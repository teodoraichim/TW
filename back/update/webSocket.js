const server = require('http').createServer();
const io = require('socket.io')(server);
let clients = {};
io.on('connection', client => {

  client.on("addClient", function (user_id, project_id) {
    console.log("User:" + user_id);
    console.log("Project:" + project_id);

    if (clients[project_id]) clients[project_id].push({ "client": client, "user_id": user_id });
    else clients[project_id] = [{"client": client, "user_id": user_id }];
    console.log(clients);
  });
  client.on("addUpdate", function (user_id, project_id, message) {
    console.log("User:" + user_id);
    console.log("Project:" + project_id);
    console.log("Message:" + message);
    for (var i=0;i<clients[project_id].length;i++)
    {  console.log(clients[project_id][i].user_id);
      
      if (clients[project_id][i].client !== client) {
        console.log("Sending to client with user id " + clients[project_id][i].user_id);
        clients[project_id][i].client.emit("update", user_id, message);
      }
    }
  });

  client.on('disconnect', () => {
    for (var i = 0; i < clients.length; i++) {
      if (clients[i] === client) {
        clients.splice(i, 1);
        i--;
      }

    }
    console.log("Popped client");
    console.log(clients);
  });
});
server.listen(3000);