### Lista erori
401 unauthorized
404 page not found
500 internal server error
403 invalid query params
# Project management
## Get list of projects an user is a colab of: 
GET /projects
JWT in authorization header
return type: 200 ok json
ex:
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
erori:500,401
## getting  the  description  of  a  project(project  name,creator,collaborators,database_name)

GET  /projects/proj_id (ex: /projects/1)

jwt  in  authorization  header
response:200 ok
{ "colabs": [
{"user_id": 1},
{"user_id": 2},
{"user_id": 3}
 ],
"info": [
	{
	"project_id": 1,
	"project_name": "Sparkling water",
	"creator": "One",
	"database_id": 1
	} ]
}
erori:500,401,403

## add project

POST  /projects?project_name=

jwt  in  authorization  header
returneaza  200  ok
 
erori:500,401,403

## add colab

POST  /projects/colabs?project_id=&user_id=

jwt  in  authorization  header
returneaza  200  ok
 
erori:500,401,403

## delete colab

DELETE  /projects/colabs?project_id=&user_id=

jwt  in  authorization  header
returneaza  200  ok
 
erori:500,401,403


## is colab(check)

GET  /isColab?project_id=&user_id=
returneaza 200 ok 
json:
{ "isColab":true}
sau
{ "isColab":false}

eroare:500,401,403

## execute query

POST  /projects/query?project_id=&query=

jwt in authorization
returneaza 200 ok
return json:
{"result":"string-result"
}
eroare:401,500

## Generate code
POST  /generateCode/PHP?project_id=&query=?  or  /generateCode/Java?project_id=&query=?

jwt in authorization 
returneaza 200 ok
return json:
{"result":"php or java code"
}
## delete project

DELETE /projects?project_id=
jwt in authorization 
returneaza 200 ok 

erori:401,500

# Update

This module establishes a websocket client-server connection using socket.io
The html client shows how to establish the connection and communicate with the server.
the actions are:
* addClient(jwt,project_id):
	* extracts the user_id from the jwt
	* adds the client to the list of connected clients for the project_id project 
* addUpdate(jwt,project_id,message)
	* sends the update to all the connected clients
* invalid
	* error for when the jwt is invalid or the user is not a valid collaborator or the client didn't login before sending an update 
* error
	* if the project_management microservice cannot send respond if an user is a collaborator 


