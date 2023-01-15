import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
server.listen(3001, () => {
  console.log("Server is running on Port: 3001");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
  },
});

let players = {};

const getRandomColour = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};
console.log("getRandomColour", getRandomColour());

io.on("connection", (socket) => {
  console.log("A player has connected: ", socket.id);
  // assign colour to random player
  let colour = getRandomColour();

  // Add the new player to the game state
  players[socket.id] = { x: 0, y: 0, health: 100, colour: colour };

  // Send the current state of players to the new player
  socket.emit("existingPlayers", players);

  io.emit("newPlayer", {
    id: socket.id,
    x: 0,
    y: 0,
    health: 100,
    colour: colour,
  });

  socket.on("move", (data) => {
    // Update the player's position in the game state
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;

    // Broadcast the updated position to all other players
    socket.broadcast.emit("playerMoved", {
      id: socket.id,
      x: data.x,
      y: data.y,
    });
  });

  socket.on("attack", (data) => {
    // Check if the attack hit another player
    for (let id in players) {
      if (id !== socket.id) {
        let player = players[id];
        let dx = player.x - data.x;
        let dy = player.y - data.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) {
          // Reduce the hit player's health
          player.health -= 25;
          if (player.health <= 0) {
            // Broadcast the player is killed, and remove the player from the game state
            io.emit("playerKilled", id);
            delete players[id];
          } else {
            // Broadcast the player is hit
            io.emit("playerHit", id);
            console.log("Player is hit", id);
          }
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A player has disconnected: ", socket.id);
    // Remove the player from the game state
    delete players[socket.id];
  });
});
