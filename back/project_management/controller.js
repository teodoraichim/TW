const http = require('http');
// const querystring= require('querystring');
const url = require('url');
const model = require('./model.js');
const convert = require('./Convertor.js');
const jsonType={"Access-Control-Allow-Methods":"GET,POST,DELETE","Access-Control-Allow-Credentials":true,"Access-Control-Allow-Headers":"authorization","Access-Control-Allow-Origin": "*","Content-Type": "application/json" };
const textType={"Access-Control-Allow-Methods":"GET,POST,DELETE","Access-Control-Allow-Credentials":true,"Access-Control-Allow-Headers":"authorization","Access-Control-Allow-Origin": "*", "Content-Type": "text/plain" };
const noType={"Access-Control-Allow-Methods":"GET,POST,DELETE","Access-Control-Allow-Credentials":true,"Access-Control-Allow-Headers":"authorization","Access-Control-Allow-Origin": "*"};
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
function getToken(request, response) {

    //    let token=request.headers['x-access-token'] || request.headers['Authorization'];
    try {
        var re = new RegExp('Bearer (.*)');
        var r = request.headers['authorization'].match(re);
        var token = r[1];
    }
    catch (err) {
        console.log(err);
    }
    return token;
}
function validateToken(token, response) {

    var publicKEY = fs.readFileSync('/home/silviu/web_dev/Project/back/user_management/public.key', 'utf8');
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
function onRequest(request, response) {
    //Getting the list of projects for an user (project_name,project id)
    /*
    GET /projects
    json webtoken in authorization header
    
    returneaza json .ex:
    {
    "projects": [
        {
            "project_name": "Sparkling water",
            "creator": "One"
        },
        {
            "project_name": "To your left",
            "creator": "woP"
        },
        {
            "project_name": "hello friends",
            "creator": "1"
        }
    ]
    }
    */
    if (request.method == 'GET' && request.url == '/projects') {

        console.log("Getting the project lists");
        //check the webtoken

        let token = getToken(request, response);
        let legit;
        if (token) {
            legit = validateToken(token, response);
            if (legit) {
                model.getProjectList(legit.user_id).then(function (json) {
                    response.writeHead(200, jsonType);
                    response.write(json);
                    response.end();
                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
            }
            else send401Response(response);
        }
        else send401Response(response);

    }
    // getting the description of a project(project name,creator,collaborators,database_name)
    //     GET /projects/proj_id (ex: /projects/1)
    // json webtoken in authorization header
    /*return json:
    {
    "colabs": [
        {
            "user_id": 1
        },
        {
            "user_id": 2
        },
        {
            "user_id": 3
        }
    ],
    "info": [
        {
            "project_id": 1,
            "project_name": "Sparkling water",
            "creator": "One",
            "database_id": 1
        }
    ]
    }   
    */
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
        if (token) {
            legit = validateToken(token, response);
            if (project_id != null && legit != null) {
                model.isColab(legit.user_id, project_id).then(function (bool) {
                    if (bool)
                        model.getProject(legit.user_id, project_id).then(function (json) {
                            response.writeHead(200, jsonType);
                            response.write(json);
                            response.end();
                        }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
                    else send401Response(response);
                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));

            }
            else {
                send403Response(response);
            }
        }
        else send401Response(response);

    }
    //adding a new project
    // POST /projects?project_name=?username=?&password=?
    // json webtoken in authorization header
    // returneaza 200 ok 
    /*
    {
        "project_id":id
    }
    */
    // sau 401 la eroare
    else if (request.method == 'POST' && request.url.indexOf('/projects?project_name=') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_name;

        var dbUsername = queryData.username;
        var dbPassword = queryData.password;

        // var creator=queryData.creator;

        token = getToken(request, response);
        if (token) {
            legit = validateToken(token, response);
            if (proj_name != null && legit != null) {
                model.addProject(legit.user_id, proj_name, dbUsername, dbPassword).then(function (project_id) {
                    let json = {};
                    json['project_id']=project_id;
                    response.writeHead(200, jsonType);
                    response.write(JSON.stringify(json));
                    response.end();
                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
            }
            else send403Response(response);
        }
        else send401Response(response);

    }
    //add a collab
    // POST /projects/colabs?project_id=&user_id=
    //json webtoken in authorization header
    //returns 200 ok 401 on error
    else if (request.method == 'POST' && request.url.indexOf('/projects/colabs') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_id;
        var user_id = queryData.user_id;
        // var creator=queryData.creator;

        token = getToken(request, response);
        if (token) {
            legit = validateToken(token, response);
            if (proj_name != null && legit != null) {
                model.isColab(legit.user_id, proj_name).then(function (bool) {
                    if (bool) {
                        model.addIntoColabs(user_id, proj_name).then(function (json) {
                            send200Response(response);
                        }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
                    }
                    else send401Response(response);
                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
            }
            else send403Response(response);
        }
        else send401Response(response);

    }
    //delete colab
    //DELETE /projects/colabs?project_id=&user_id
    //erori 401,403
    else if (request.method == 'DELETE' && request.url.indexOf('/projects/colabs') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_id;
        var user_id = queryData.user_id;
        // var creator=queryData.creator;

        token = getToken(request, response);
        if (token) {
            legit = validateToken(token, response);
            if (proj_name != null && legit != null) {
                model.isColab(legit.user_id, proj_name).then(function (bool) {
                    if (bool) {
                        model.deleteAColab(user_id, proj_name).then(function (json) {
                            send200Response(response);
                        }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
                    }
                    else send401Response(response);
                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
            }
            else send403Response(response);
        }
        else send401Response(response);

    }
    // GET /isColab?project_id=&user_id=

    //returneaza 200 ok 401 la eroare
    else if (request.method == 'GET' && request.url.indexOf('/isColab') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_id;
        var user_id = queryData.user_id;
        // var creator=queryData.creator;
        if (proj_name != null) {
            model.isColab(user_id, proj_name).then(function (bool) {
                if (bool) {
                    let json = { "isColab": true };
                    response.writeHead(200, jsonType);
                    response.write(JSON.stringify(json));
                    response.end();
                }
                else {
                    let json = { "isColab": false };
                    response.writeHead(200,jsonType );
                    response.write(JSON.stringify(json));
                    response.end();
                }
            }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
        }
        else send403Response(response);
    }
    //execute query
    // POST /projects/query?project_id=&query=
    //json webtoken in authorization header

    //return 200  ok 401 on error
    else if (request.method == 'POST' && request.url.indexOf('/projects/query') == 0) {
        var queryData = url.parse(request.url, true).query;
        var project_id = queryData.project_id;
        var queryReq = queryData.query;

        //check the webtoken
        token = getToken(request, response);
        if (token != null) {
            legit = validateToken(token, response);
            if (legit != null) {
                model.getDBCredentials(project_id).then(function (credentials) {

                    model.postQuery(legit.user_id, project_id, queryReq, credentials.username, credentials.password).then(function (json) {
                        response.writeHead(200,jsonType);
                        response.write(json);
                        response.end();
                    }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));


                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
            }
            else send401Response(response);
        }
        else send401Response(response);

    }
    //delete project
    //delete /projects?project_id=
    //json webtoken in authorization header

    else if (request.method == 'DELETE' && request.url.indexOf('/projects') == 0) {
        //get query data
        var queryData = url.parse(request.url, true).query;
        var proj_name = queryData.project_id;
        // var creator=queryData.creator;

        token = getToken(request, response);
        if (token) {
            legit = validateToken(token, response);
            console.log(proj_name);
            if (proj_name != null && legit != null) {
                model.deleteProject(legit.user_id, proj_name).then(function (json) {
                    send200Response(response);
                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
            }
            else send401Response(response);
        }
        else send401Response(response);

    }
    //generate code
    // POST /generateCode/PHP?project_id=&query=? or /generateCode/Java?project_id=&query=?
    //returns 200 ok json
    //jwt 
    /*
    {
        'result':(phpcode)
    }
    */
    else if (request.method == 'POST' && request.url.indexOf('/generateCode') == 0) {
        var queryData = url.parse(request.url, true).query;
        var project_id = queryData.project_id;
        var queryReq = queryData.query;

        //check the webtoken
        token = getToken(request, response);
        if (token != null) {
            legit = validateToken(token, response);
            if (legit != null) {
                model.getDBCredentials(project_id).then(function (credentials) {
                    if (request.url.indexOf('/generateCode/Java') == 0) {
                        console.log("JavaGen");
                        var json = {};
                        let javaCode= convert.fromQueryToJava('localhost', credentials.username, credentials.password, credentials.id, queryReq);//host,username,password,path_database,query
                        console.log(javaCode);
                        json['result'] = javaCode;
                        response.writeHead(200, jsonType);
                        // console.log(json);
                        response.write(JSON.stringify(json));
                        response.end();
                    }
                    else if (request.url.indexOf('/generateCode/Php') == 0) {
                        console.log("JavaGen");
                        var json = {};
                        let phpCode = convert.fromQueryToPhp('localhost', credentials.username, credentials.password, credentials.id, queryReq);//host,username,password,path_database,query
                        console.log(phpCode);
                        json['result'] = phpCode;
                        response.writeHead(200, jsonType);
                        // console.log(json);
                        response.write(JSON.stringify(json));
                        response.end();

                    }

                }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
            }
            else send401Response(response);
        }
        else send401Response(response);

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