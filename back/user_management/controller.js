
const http = require('http');
const parse = require('querystring');
const url = require('url');
const model = require('./model.js');

const jsonType = { "Access-Control-Allow-Methods": "GET,POST,DELETE", "Access-Control-Allow-Credentials": true, "Access-Control-Allow-Headers": "authorization", "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
const textType = { "Access-Control-Allow-Methods": "GET,POST,DELETE", "Access-Control-Allow-Credentials": true, "Access-Control-Allow-Headers": "authorization", "Access-Control-Allow-Origin": "*", "Content-Type": "text/plain" };
const noType = { "Access-Control-Allow-Methods": "GET,POST,DELETE", "Access-Control-Allow-Credentials": true, "Access-Control-Allow-Headers": "authorization", "Access-Control-Allow-Origin": "*" };
//for working with the file system
const fs = require('fs');
const jwt = require('jsonwebtoken');
function send500Response(response) {
   response.writeHead(500, textType);
   response.write("Error 500:Internal server error");
   response.end();
}
function send404Response(response) {
   response.writeHead(404, textType);
   response.write("Error 404:Page not found");
   response.end();
}
function send200Response(response) {
   response.writeHead(200, textType);
   response.write("Done");
   response.end();
}
function send401Response(response) {
   response.writeHead(401, textType);
   response.write("Error 401:Unauthorized");

   response.end();
}
function send403Response(response) {
   response.writeHead(403, textType);
   response.write("Error 403:Send valid query params");
   response.end();
}

function send404Response(response) {
   response.writeHead(404, { "Content-Type": "text/plain" });
   response.write("Error 404:Page not found");
   response.end();
}
function send200Response(response) {
   response.writeHead(200, { "Content-Type": "text/plain" });
   response.write("Done");
   response.end();
}

//Script for generating a JSON web token
function createToken(user_id) {
   // PAYLOAD
   var payload = {
      user_id: user_id,

   };
   // PRIVATE and PUBLIC key
   var privateKEY = fs.readFileSync('./private.key', 'utf8');
   var publicKEY = fs.readFileSync('./public.key', 'utf8');
   var i = 'UPNP';          // Issuer 
   var s = 'some@user.com';        // Subject 
   var a = 'http://localhost:8000'; // Audience
   // SIGNING OPTIONS
   var signOptions = {
      issuer: i,
      subject: s,
      audience: a,
      expiresIn: "12h",
      algorithm: "RS256"
   };

   var token = jwt.sign(payload, privateKEY, signOptions);
   console.log("Token - " + token);
}

function onRequest(request, response) {

   if (request.method == 'POST' && request.url == '/login') {

      var buff = '';
      var body = '';

      request.on('data', chunk => {
         buff += chunk;
      });
      request.on('end', () => {
         body = parse.parse(buff);

         //response.end('ok');
      });

      //JSON.stringify(buf);



      model.login(body['username'], body['password']).then(function (resp) {
         if (!resp) {
            let json = ({ "message": 'incorrect data' });
            response.writeHead(200, jsonType);
            response.write(JSON.stringify(json));
            response.end();
         }

         else {
            let json = ({ "message": 'logged in' })
            response.writeHead(200, jsonType);
            response.write(JSON.stringify(json));
            response.end();
            let id = model.getId(body['username']);
            createToken(id);
         }


      }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));




   }

   else if (request.method == 'POST' && request.url == '/register') {

      var buff = '';
      var body = '';

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
         body = parse.parse(buff);

      })

      //JSON.stringify(buf);



      model.register(body['username'], body['password'], body['email'], function (message) {
         let json = ({ "status": message });
         response.writeHead(200, jsonType);
         response.write(json);
         response.end();
      });






   }
   else if (request.method == 'POST' && request.url == '/register-validate') {

      var buff = '';
      var body = '';

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
         body = parse.parse(buff);

      })
      

      //JSON.stringify(buf);
      model.validateCode(body['id'], body['code'], function (bool) {
         let json = ({ "validate": bool });
         response.writeHead(200, jsonType);
         response.write(json);
         response.end();


      }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));




   }
   else if (request.method == 'POST' && request.url == '/changPassword') {

      var buff = '';
      var body;

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
         body = parse.parse(buff);
         
      })

      //JSON.stringify(body);
      

      model.changePassword(email, function(bool){
         let json = ({"status" : bool});
         response.writeHead(200, jsonType);
         response.write(json);
         response.end();
      }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));

   }
   else if (request.method == 'POST' && request.url == '/changPasswordValidate') {

      var buff = '';
      var body;

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
        body = parse.parse(buf);
         
      })

      //JSON.stringify(buf);

      model.cahngePassValidate(body['email'],body['code'],body['pass'],function(bool){
         let json = ({"status" : bool});
         response.writeHead(200, jsonType);
         response.write(json);
         response.end();
         
      }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));



   }
   else if(request.method=="GET" && request.url.indexOf('/getId')==0){

      var queryData = url.parse(request.url, true).query;
      let username =queryData.username;

      model.getId(username, function(id){
         let json = ({"id" : id});
         response.writeHead(200, jsonType);
         response.write(json);
         response.end();
         
      }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
   }
   else if(request.method=='OPTIONS')
    {
        console.log("Options "+request.url)
        response.writeHead(200,noType);
        response.end();
    }
    else {
        console.log(request.method+" "+request.url);
        send404Response(response);
    }

}

http.createServer(onRequest).listen(8000);
console.log("Service is running ");