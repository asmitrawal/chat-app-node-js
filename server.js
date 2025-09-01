const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

const server = http.createServer(app);

//initiate socket.io and attach this to the http server

const io = socketIo(server);

app.use(express.static("public"));

const users = new Set();

io.on("connection", (socket) => {
  console.log("a user is now connected");

  //handle users when they will join the chat
  socket.on("join", (username) => {
    users.add(username);
    socket.username = username;

    //broadcast to all clients that new user has joined
    io.emit("userJoined", username);

    //send the updated userList to all clients
    io.emit("userList", Array.from(users));
  });

  //handle incoming chat messages
  socket.on("chatMessage", (message) => {
    console.log("chatMessage was received on server");

    //broadcast the received message to all the connected clients
    io.emit("chatMessage", message);
  });

  //handle user disconnection

  socket.on("disconnect", () => {
    users.forEach((user) => {
      if (user === socket.username) {
        console.log(`${user} was disconnected`);
        users.delete(user);

        io.emit("userLeft", user);

        io.emit("userList", Array.from(users));
      }
    });
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`server is now running at port http://localhost:${PORT}`);
});
