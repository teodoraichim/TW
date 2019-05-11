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
function send401Response(response) {
    response.writeHead(401, { "Content-Type": "text/plain", "WWW-Authenticate": "Please Login or send a valid  JWT token" });
    response.write("Error 401:Unauthorized");

    response.end();
}
function getToken(request, response) {

    //    let token=request.headers['x-access-token'] || request.headers['Authorization'];
    try {
        var re = new RegExp('Bearer (.*)');
        var r = request.headers['authorization'].match(re);
        var token = r[1];
    }
    catch (err) {
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
        //check the webtoken
        token = getToken(request, response);
        if (token)
            legit = validateToken(token, response);
            else send401Response(response);
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
        var project_id = r[1];
        token = getToken(request, response);
        if (token)
            legit = validateToken(token, response);
            else send401Response(response);
        if (project_id != null && legit != null) {
            model.isColab(legit.user_id, project_id).then(function (bool) {
                if (bool)
                    model.getProject(legit.user_id, project_id).then(function (json) {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        response.write(json);
                        response.end();
                    }).catch((err) => setImmediate(() => { throw err; }));
                else send401Response(response);
            }).catch((err) => setImmediate(() => { throw err; }));

        }
        else {
            send404Response(response);
        }
    }
    //adding a new project
    else if (request.method == 'POST' && request.url.indexOf('/projects?project_name=') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_name;
        // var creator=queryData.creator;

        token = getToken(request, response);
        if (token)
            legit = validateToken(token, response);
            else send401Response(response);
        if (proj_name != null && legit != null) {
            model.addProject(legit.user_id, proj_name).then(function (json) {
                send200Response(response);
            }).catch((err) => setImmediate(() => { send401Response(response); throw err; }));
        }
        else send401Response(response);
    }
    //add a collab
    else if (request.method == 'POST' && request.url.indexOf('/projects/colabs') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_id;
        var user_id = queryData.user_id;
        // var creator=queryData.creator;

        token = getToken(request, response);
        if (token)
            legit = validateToken(token, response);
        else send401Response(response);
        if (proj_name != null && legit != null) {
            model.isColab(legit.user_id,proj_name).then(function (bool) {
                if (bool) {
                    model.addIntoColabs(user_id, proj_name).then(function (json) {
                        send200Response(response);
                    }).catch((err) => setImmediate(() => { send401Response(response); throw err; }));
                }
                else send401Response(response);
            }).catch((err) => setImmediate(() => { send401Response(response); throw err; }));
        }
        else send401Response(response);
    }
    //execute query
    else if (request.method == 'POST' && request.url.indexOf('/projects/query') == 0) {
        var queryData = url.parse(request.url, true).query;
        var project_id=queryData.project_id;
        var queryReq=queryData.query;
        
        //check the webtoken
        token = getToken(request, response);
        if (token!=null)
            legit = validateToken(token, response);
        else send401Response(response);
        if (legit!=null) {
            model.postQuery(legit.user_id,project_id,queryReq).then(function (json) {
                response.writeHead(200, { "Content-Type": "application/json" });
                response.write(json);
                response.end();
            }).catch((err) => setImmediate(() => { throw err; }));
        }
    }
    //delete project
    else if (request.method == 'DELETE' && request.url.indexOf('/projects') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_id;
        // var creator=queryData.creator;

        token = getToken(request, response);
        if (token)
            legit = validateToken(token, response);
        console.log(proj_name);
        if (proj_name != null && legit != null) {
            model.deleteProject(legit.user_id, proj_name).then(function (json) {
                send200Response(response);
            }).catch((err) => setImmediate(() => { send401Response(response); throw err; }));
        }
        else send401Response(response);
    }
    else {
        send404Response(response);
    }
}

http.createServer(onRequest).listen(8000);
console.log("Service is running ");