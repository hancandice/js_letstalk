const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("Une nouvelle connexion s'est produite.");

  socket.on("entered", ({ name, room }, callback) => {
    console.log(name, room);
  });

  socket.on("disconnect", () => {
    console.log("L'utilisateur vient de quitter.");
  });
});

app.use(router);

server.listen(PORT, () =>
  console.log(`Le serveur a démarré sur le port ${PORT}`)
);
