
const http = require('http');
// const querystring= require('querystring');
const url = require('url');
const model = require('./model.js');
//for working with the file system
const fs = require('fs');
const jwt = require('jsonwebtoken');
const parse = require('querystring');
var nodemailer = require('nodemailer');

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

function onRequest(request, resp) {

   if( request.method == 'POST' && request.url == '/login'){

      let buf = '';
      
      request.on('data', chunk =>{
         buf+=chunk;
      })
      request.on('end', ()=>{
         parse(buf);
      })

      JSON.stringify(buf);

      
    
   model.login(buf[username],buf[password]).then(function(resp){
      if(resp=='user inexistent'|| resp=='incorect password') return res.status(401).json({ message: resp });
      
      let id=model.getId(buf[username]);
      createToken(id);
   });
   
   return res.json({massage : resp});
  

   }

   if(request.method == 'POST' && request.url == '/register'){

      let buf = '';
      
      request.on('data', chunk =>{
         buf+=chunk;
      })
      request.on('end', ()=>{
         parse(buf);
      })

      JSON.stringify(buf);

      if(model.checkMail(buf[email])==true) return resp('This email is already used');
      if(model.checkUsername(buf[username])==true) return resp('Username already taken');

      model.register(buf[username],buf[password],buf[email]);

      return resp('Added succesfully');

      


   }
   if(request.method == 'POST' && request.url == '/register-validate'){

      let buf = '';
      
      request.on('data', chunk =>{
         buf+=chunk;
      })
      request.on('end', ()=>{
         parse(buf);
      })

      JSON.stringify(buf);

      


   }
   if(request.method == 'POST' && request.url == '/changPassword'){

      let buf = '';
      
      request.on('data', chunk =>{
         buf+=chunk;
      })
      request.on('end', ()=>{
         parse(buf);
      })

      JSON.stringify(body);
      let code = crypto.randomBytes(20).toString('hex');
      let id = modul.getId(body[email]);

      model.addCode(buf[email],code);
      module.sendMail(buf[mail],code);
      
   }
   if(request.method == 'POST' && request.url == '/changPasswordValidate'){

      let buf = '';
      
      request.on('data', chunk =>{
         buf+=chunk;
      })
      request.on('end', ()=>{
         parse(buf);
      })

      JSON.stringify(buf);

      if(modul.verifyCode(buf[code])) model.changePassword(buf[username],buf[password]);

      
      
   }

}

http.createServer(onRequest).listen(8000);
console.log("Service is running ");