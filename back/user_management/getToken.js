//Script for generating a JSON web token
const fs=require ('fs');
const jwt=require('jsonwebtoken');

// PAYLOAD
var payload = {
    user_id: 4

   };
   // PRIVATE and PUBLIC key
   var privateKEY  = fs.readFileSync('./private.key', 'utf8');
   var publicKEY  = fs.readFileSync('./public.key', 'utf8');
   var i  = 'UPNP';          // Issuer 
   var s  = 'some@user.com';        // Subject 
   var a  = 'http://localhost'; // Audience
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