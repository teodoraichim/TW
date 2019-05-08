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
function send401Response(response) {
    response.writeHead(401, { "Content-Type": "text/plain", "WWW-Authenticate": "Please Login or send a valid  JWT token" });
    response.write("Error 401:Unauthorized");

    response.end();
}
function getToken(request, response) {

    //    let token=request.headers['x-access-token'] || request.headers['Authorization'];
    try
    {var re = new RegExp('Bearer (.*)');
    var r = request.headers['authorization'].match(re);
    var token = r[1];
    }
    catch(err)
    {
        send401Response(response);
    }
    return token;
}
function validateToken(token, response) {

    var publicKEY = fs.readFileSync('/home/silviu/web_dev/Project/back/user_management/public.key', 'utf8');
    var i = 'UPNP';          // Issuer 
    var s = 'some@user.com';        // Subject 
    var a = 'http://localhost:8000'; // Audience
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
        send401Response(response);

    }
    console.log("\nJWT verification result: " + JSON.stringify(legit));
    return legit;

}
function onRequest(request, response) {
    //Getting the list of projects for an user (project_name,project id)
    if (request.method == 'GET' && request.url == '/projects') {

        console.log("Getting the project lists");
        token = getToken(request, response);
        legit = validateToken(token, response);

        if (legit) {
            model.getProjectList(legit.user_id).then(function (json) {
                response.writeHead(200, { "Content-Type": "application/json" });
                response.write(json);
                response.end();
            }).catch((err) => setImmediate(() => { throw err; }));
        }
    }
    //getting the description of a project(project name,creator,collaborators,database_name)
    else if (request.method == 'GET' && request.url.indexOf('/projects') == 0) {
        var pathData = url.parse(request.url, true).pathname;
        //get query data
        //var queryData = url.parse(request.url, true).query;
        // var proj_id=queryData.project_id;
        // console.log(queryData);

        //get path data
        var re = new RegExp('/projects/(.*)');
        var r = pathData.match(re);
        var proj_id = r[1];

        if (proj_id != null) {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(JSON.stringify({ project_name: proj_id, creator: 'percent', database_name: 'winterspoiler' }));
        }
        else {
            send404Response(response);
        }
        response.end();
    }
    //adding a new project
    else if (request.method == 'POST' && request.url == '/projects') {

    }
    else if (request.method == 'POST') {

    }
    else {
        send404Response(response);
    }
}

http.createServer(onRequest).listen(8000);
console.log("Service is running ");