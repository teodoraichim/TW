const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:3000");

ioClient.on("seq-num", (msg) => console.info(msg));
//add user_id,project_id,message
ioClient.emit("addClient","1","1");
ioClient.emit("addUpdate","1","1","hi bastard");