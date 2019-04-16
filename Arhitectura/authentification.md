# dbAdminer.Arhitectura.
## User authentication and authorization
In a monolithic architecture, the entire application is a process with access to all the databases it may need.

Because of the microservice architecture that our web application uses, user authentification and authorization is more challenging as they have to be handled in each microservice without breaking the principle of single responsibility principle that the microservice architecture should follow. (They shouldn't have to implement each the authorization/authentification procedure)

Therefore, the classical session approach, where a session is stored on the server and the session ID is sent to the client is not a good idea as the problem of sharing these sessions between microservices would require either a centralized session storage, or a session synchronization service .
 
Therefore, we decided to use JSON Web tokens as it stores the user's information on the client.
The authentification server at a user's request will create a Token (JSON web Token) containing a header a payload and a signature. Using the signature, which contains a secret that the user management microservice generates, the token is hashed. This token will be used for authentification across all microservices.
For that to happen, all the microservices must have a JWT validation method (they must also share the secret).

<b>Header</b>:
{
&nbsp;&nbsp;&nbsp;"typ": "JWT",  
&nbsp;&nbsp;&nbsp;"alg": "HS256"
}

<b>Payload</b>:
{
&nbsp;&nbsp;&nbsp;"user_id":
&nbsp;&nbsp;&nbsp;"username":
&nbsp;&nbsp;&nbsp;"exp":
}

<b>Signature</b>:
HMACSHA256(  
  &nbsp;&nbsp;&nbsp;base64UrlEncode(header) + "." +  
 &nbsp;&nbsp;&nbsp; base64UrlEncode(payload),  
 &nbsp;&nbsp;&nbsp; secret  
)

How <b>JWT</b> works:
![JWT diagram](https://cdn-images-1.medium.com/max/1600/0*4e6oPp1HYrmDm2CH.png)
