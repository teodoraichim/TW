const server = require('http').createServer();
const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
const projMng = require('./projMngCommunication.js');
const fs = require('fs');
//clients object
/*
  Format:
  {
    'project_id':
    [{client:[Object](representing the socket used by that client),user_id:(user_id corresponding to the client)}]
  }
  ex:
  { '1': 
   [ { client: [Object], user_id: 2 },
     { client: [Object], user_id: 1 } ] }

*/
let clients = {};
let numProjects = 0;

//returns the jwt object if the jwt is valid;an undefined obj otherwise
function validateToken(token) {

  var publicKEY = fs.readFileSync('./public.key', 'utf8');
  var i = 'UPNP';          // Issuer 
  var s = 'some@user.com';        // Subject 
  var a = 'http://localhost'; // Audience
  var verifyOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: "12h",
    algorithm: ["RS256"]
  };
  try {
    var legit = jwt.verify(token, publicKEY, verifyOptions);
  }
  catch (err) {
    console.log(err);
  }
  console.log("\nJWT verification result: " + JSON.stringify(legit));
  return legit;

}

io.on('connection', client => {
  /*
    Adding a client:
    first verify the jwt and extract the user id
    then add it to the clients object
  */
  client.on("addClient", function (user_token, project_id) {
    user_json = validateToken(user_token);
    if (user_json) {
      user_id = user_json.user_id;
      projMng.isColab(user_id, project_id).then(function (bool) {
        if (bool) {
          console.log("User:" + user_id);
          console.log("Project:" + project_id);
          //add client to the clients object
          let isAlready = false;
          if (clients[project_id])
            for (var i = 0; i < clients[project_id].length; i++) {
              console.log(clients[project_id][i].user_id);
              if (clients[project_id][i].user_id == user_id)
                isAlready = true;
              if (!isAlready) {

                if (clients[project_id]) clients[project_id].push({ "client": client, "user_id": user_id });
                else {
                  clients[project_id] = [{ "client": client, "user_id": user_id }]; 
                }
              }
            }
          else { clients[project_id] = [{ "client": client, "user_id": user_id }];}

          console.log(clients);

        }
        else client.emit("invalid");
      }).catch((err) => setImmediate(() => { console.log(err); client.emit("error", "Could not fulfill the request"); }));
    }
  });
  //receive update from a client and send it to all the connected colabs
  client.on("addUpdate", function (user_token, project_id, message) {
    user_json = validateToken(user_token);
    if (user_json) {
      user_id = user_json.user_id;
      console.log("User:" + user_id);
      console.log("Project:" + project_id);
      console.log("Message:" + message);
      let connected = false;
      for (var i = 0; i < clients[project_id].length; i++) {
        if (clients[project_id][i].client === client) {
          connected = true;
        }
      }

      if (connected) {//sending update to all connected colabs
        for (var i = 0; i < clients[project_id].length; i++) {
          console.log(clients[project_id][i].user_id);
          if (clients[project_id][i].client !== client) {
            console.log("Sending to client with user id " + clients[project_id][i].user_id);
            clients[project_id][i].client.emit("update", user_id, message);
          }
        }
      }
    }
    else client.emit("invalid");
  });

  client.on('disconnect', () => {
    
    Reflect.ownKeys(clients).forEach(project_id => {
      console.log(clients[project_id]);
      for (var i = 0; i < clients[project_id].length; i++) {
        if (clients[project_id][i].client === client) {
          clients[project_id].splice(i, 1);

          i--;
        }

      }

    });
    console.log("Popped client");
    console.log(clients);
    
  });
});
server.listen(3000);