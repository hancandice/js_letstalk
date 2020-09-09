const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// const timestamp = new Date().getTime();
// console.log(timestamp);
// const timestampToDate = new Date(timestamp);
// console.log(timestampToDate);

io.on("connection", (socket) => {
  socket.on("entered", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      socket.emit("message", {
        user: "admin",
        text: `${error} Pour entrer dans cette salle, cliquez sur le bouton Quitter et essayez avec un autre nom.`,
      });

      return callback(error);
    }

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Bienvenue chez ${user.room}`,
    });

    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `un nouvel utilisateur ${user.name} a rejoint chez nous !`,
    });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} a quitté.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

app.use(router);
app.use(cors());

server.listen(PORT, () =>
  console.log(`Le serveur a démarré sur le port ${PORT}`)
);
