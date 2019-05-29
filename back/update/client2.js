const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:3000");

ioClient.on("seq-num", (msg) => console.info(msg));
//add user_id,project_id,message
ioClient.emit("addClient","2","1");
// ioClient.emit("event","1","1","hi bastard");
ioClient.on("update",(user,message)=>console.log(user+" : "+message));