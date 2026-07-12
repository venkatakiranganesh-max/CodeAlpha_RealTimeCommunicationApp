const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {

    console.log("A user connected");

    socket.on("join-room", (roomId, username) => {

        socket.join(roomId);

        console.log(username + " joined room " + roomId);

        const room = io.sockets.adapter.rooms.get(roomId);
        const userCount = room ? room.size : 0;

        console.log("Users in room:", userCount);

        socket.to(roomId).emit("user-joined", username);

    });

    socket.on("offer", (data) => {
        socket.to(data.room).emit("offer", data);
    });

    socket.on("answer", (data) => {
        socket.to(data.room).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", data);
});

socket.on("camera-toggle", (data) => {

    socket.to(data.room).emit("camera-toggle", {
        enabled: data.enabled
    });

});

socket.on("mic-toggle", (data) => {
    socket.to(data.room).emit("mic-toggle", data);
});
socket.on("chat-message", (data) => {

    socket.to(data.room).emit("chat-message", {
        username: data.username,
        message: data.message
    });

});
socket.on("file-share", (data) => {

    console.log("File received on server:", data.fileName);

    socket.to(data.room).emit("file-share", data);



});
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

});
const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});