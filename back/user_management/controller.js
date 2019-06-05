
const http = require('http');
// const querystring= require('querystring');
const url = require('url');
const model = require('/home/silviu/web_dev/Project/back/model.js');
//for working with the file system
const fs = require('fs');
const jwt = require('jsonwebtoken');

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
function createToken(user_id){
// PAYLOAD
var payload = {
    user_id: user_id,

   };
   // PRIVATE and PUBLIC key
   var privateKEY  = fs.readFileSync('./private.key', 'utf8');
   var publicKEY  = fs.readFileSync('./public.key', 'utf8');
   var i  = 'UPNP';          // Issuer 
   var s  = 'some@user.com';        // Subject 
   var a  = 'http://localhost:8000'; // Audience
   // SIGNING OPTIONS
   var signOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "12h",
    algorithm:  "RS256"
   };

   var token = jwt.sign(payload, privateKEY, signOptions);
   console.log("Token - " + token);
}

function onRequest(request, response) {

   if(request.url == '/login'){

      // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) 
      return res.status(401).json({ message: 'Missing Authorization Header' });

   const credentials64=req.headers.authorization.split(' ')[1];
   const credentials=Buffer.from(credentials64,'base64').toString('ascii');
   const username=credentials.split(':')[1];
   const password=credentials.split(':')[2];
   model.login(username,password).then(function(resp){
      if(resp=='user inexistent'|| resp=='incorect password') return res.status(401).json({ message: resp });
      
      let id=model.getId(username);
      createToken(id);
   });
  

   }
   
}

http.createServer(onRequest).listen(8000);
console.log("Service is running ");