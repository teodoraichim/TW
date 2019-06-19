
const http = require('http');
const parse = require('querystring');
const bodyParse = require('body-parser');
const url = require('url');
const model = require('./model.js');

const jsonType = { "Access-Control-Allow-Methods": "GET,POST,DELETE", "Access-Control-Allow-Credentials": true, "Access-Control-Allow-Headers": "authorization,content-type", "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
const textType = { "Access-Control-Allow-Methods": "GET,POST,DELETE", "Access-Control-Allow-Credentials": true, "Access-Control-Allow-Headers": "authorization,content-type", "Access-Control-Allow-Origin": "*", "Content-Type": "text/plain" };
const noType = { "Access-Control-Allow-Methods": "GET,POST,DELETE", "Access-Control-Allow-Credentials": true, "Access-Control-Allow-Headers": "authorization,content-type", "Access-Control-Allow-Origin": "*" };
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
   response.writeHead(404, textType);
   response.write("Error 404:Page not found");
   response.end();
}
function send200Response(response) {
   response.writeHead(200, textType);
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
   var a = 'http://localhost'; // Audience
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
   return token;
}

function onRequest(request, response) {

   if (request.method == 'POST' && request.url == '/login') {

      var buff = '';
      var body = '';

      request.on('data', chunk => {
         buff += chunk;
      });
      request.on('end', () => {
         // body = parse.parse(buff);
         body = JSON.parse(buff);
         console.log("U:" + body['username']);
         console.log("P" + body['password']);
         if(body['username']&& body['password'])
         model.login(body['username'], body['password']).then(function (resp) {
            console.log(resp);
            if (!resp) {
               send403Response(response);
            }
            else {
               model.getId(body['username']).then(function (user_id) {
                  let json = { "token": createToken(user_id) };
                  response.writeHead(200, jsonType);
                  response.write(JSON.stringify(json));
                  response.end();

               }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));

            }


         }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
         else 
         {
            send401Response(response);
         }
         //response.end('ok');
      });

      //JSON.stringify(buf);


   }

   else if (request.method == 'POST' && request.url == '/register') {

      var buff = '';
      var body = '';

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
         console.log("Register-" + buff);
         body = JSON.parse(buff);

         model.register(body['username'], body['password'], body['email']).then(function (message) {
            let json = { "status": message };
            console.log(json);
            response.writeHead(200, jsonType);
            response.write(JSON.stringify(json));
            response.end();
         }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));

      })

      //JSON.stringify(buf);







   }
   else if (request.method == 'POST' && request.url == '/register-validate') {

      var buff = '';
      var body = '';

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
         body = JSON.parse(buff);
         //JSON.stringify(buf);
         model.validateCode(body['email'], body['code']).then(function (bool) {
            if (bool) {
               model.activateAccount(body['email']).then(function (bool) {
                  let json = { "validate": bool };
                  response.writeHead(200, jsonType);
                  response.write(JSON.stringify(json));
                  response.end();

               });
            }
            else send403Response(response);

         }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));


      })






   }
   else if (request.method == 'POST' && request.url == '/changePassword') {

      var buff = '';
      var body;

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
         body = JSON.parse(buff);

         console.log("change pass")
         model.changePassword(body["email"]).then(function (bool1) {
            let json = { "status": bool1 };
            console.log(json);
            response.writeHead(200, jsonType);
            response.write(JSON.stringify(json));
            response.end();
         }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));

      })

      //JSON.stringify(body);


   }
   else if (request.method == 'POST' && request.url == '/changePasswordValidate') {

      var buff = '';
      var body;

      request.on('data', chunk => {
         buff += chunk;
      })
      request.on('end', () => {
         body = JSON.parse(buff);
         console.log("change pass"+body['code']);  

         model.changePassValidate(body['email'], body['code'], body['password']).then(function (bool1) {
            let json = { "status": bool1 };
            response.writeHead(200, jsonType);
            console.log(json);
            response.write(JSON.stringify(json));
            response.end();

         }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));


      })

      //JSON.stringify(buf);



   }
   else if (request.method == "GET" && request.url.indexOf('/getId') == 0) {

      var queryData = url.parse(request.url, true).query;
      let username = queryData.username;
      if(username&&username!='')
      model.getId(username).then(function (id) {
         let json = { "id": id };
         console.log(json);
         response.writeHead(200, jsonType);
         response.write(JSON.stringify(json));
         response.end();

      }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
      else send403Response(response);
   }
   else if (request.method == "GET" && request.url.indexOf('/getUsername') == 0) {

      var queryData = url.parse(request.url, true).query;
      let userId = queryData.userId;
      if(userId&&userId!='')
      model.getUsername(userId).then(function (username) {
         let json = { "username": username };
         console.log(json);
         response.writeHead(200, jsonType);
         response.write(JSON.stringify(json));
         response.end();

      }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
      else send403Response(response);
   }
   else if (request.method == 'OPTIONS') {
      console.log("Options " + request.url)
      response.writeHead(200, noType);
      response.end();
   }
   else {
      console.log(request.method + " " + request.url);
      send404Response(response);
   }

}

http.createServer(onRequest).listen(8001);
console.log("Service is running ");