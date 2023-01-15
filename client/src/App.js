import "./App.scss";
import { useState, useEffect } from "react";
import io from "socket.io-client";
// import { useSprite } from "react-sprite-animator";
import styled, { keyframes } from 'styled-components'
// import spriteImage from "./images/CharAni-Sheet4.png"

import spritePageRight from './moveRight.png'
import spritePageLeft from './moveLeft.png'
import spritePageUp from './moveUp.png'
import spritePageDown from './moveDown.png'

const socket = io.connect("http://localhost:3001");
const MAX_X_BOARDER = 1331;
const MAX_Y_BOARDER = 733;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const animation = keyframes`
  100% { background-position: -1000px; }
`;

    const SpriteDown = styled.div`
      height: 30px;
      width: 36px;
      position: absolute;
      background: url(${spritePageDown}) left top;
      animation: ${animation} .4s steps(2) infinite; 
    `;    
    const SpriteUp = styled.div`
      height: 30px;
      width: 36px;
      position: absolute;
      background: url(${spritePageUp}) left top;
      animation: ${animation} .4s steps(2) infinite; 
    `;
    const SpriteRight = styled.div`
      height: 30px;
      width: 36px;
      position: absolute;
      background: url(${spritePageRight}) left top;
      animation: ${animation} .4s steps(2) infinite; 
    `;
    const SpriteLeft = styled.div`
      height: 29px;
      width: 36px;
      position: absolute;
      background: url(${spritePageLeft}) left top;
      animation: ${animation} .4s steps(2) infinite; 
    `;

function App() {
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [playerDirection, setPlayerDirection] = useState("down");
  const [playerPosition, setPlayerPosition] = useState({
    x: getRandomInt(800) + 32,
    y: getRandomInt(600) + 144,
  });

  useEffect(() => {
    socket.on("connect", () => {
      setPlayerId(socket.id);
      setPlayers((prevPlayers) => {
        return {
        ...prevPlayers,
        [socket.id]: { x: playerPosition.x, y: playerPosition.y, health: 100, direction: playerDirection },
        }
      });
      socket.emit("newPlayer", {
        id: socket.id,
        x: playerPosition.x,
        y: playerPosition.y,
        direction: playerDirection
      });
    });

    // Update the position of other players when they move
    socket.on("playerMoved", (data) => {
      setPlayers((prevPlayers) => ({
        ...prevPlayers,
        [data.id]: { ...prevPlayers[data.id], x: data.x, y: data.y },
      }));
    });

    // Update the player health when they are hit
    socket.on("playerHit", (id) => {
      setPlayers((prevPlayers) => {
        let newPlayers = { ...prevPlayers };
        newPlayers[id].health -= 25;
        return newPlayers;
      });
    });

    // Remove the player when they are killed
    socket.on("playerKilled", (id) => {
      setPlayers((prevPlayers) => {
        let newPlayers = { ...prevPlayers };
        delete newPlayers[id];
        return newPlayers;
      });
    });

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [players]);

  function handleKeyPress(event) {
    if (event.keyCode === 37) {
      movePlayer("left");
      console.log("Left");
    } else if (event.keyCode === 38) {
      movePlayer("up");
      console.log("Up");
    } else if (event.keyCode === 39) {
      movePlayer("right");
      console.log("Right");
    } else if (event.keyCode === 40) {
      movePlayer("down");
      console.log("Down");
    }
  }
  function movePlayer(direction) {
    let newX = playerPosition.x;
    let newY = playerPosition.y;
   
    if (direction === "left" && playerPosition.x > 40) {
        newX -= 16;
    } else if (playerPosition.y > 144 && direction === "up") {
      newY -= 16;
    } else if (playerPosition.x < MAX_X_BOARDER && direction === "right") {
      newX += 16;
    } else if (playerPosition.y < MAX_Y_BOARDER && direction === "down") {
      newY += 16;
    }
    setPlayerDirection(direction)
    setPlayers((prevPlayers) => {
      return {
        ...prevPlayers,
        [playerId]: { ...prevPlayers[playerId], x: newX, y: newY, direction: direction },
      };
    });
    setPlayerPosition({ x: newX, y: newY });
    socket.emit("move", { x: newX, y: newY, playerDirection });
    console.log("newX, newY:", newX, newY);
    console.log("x, y, direction", playerPosition.x, playerPosition.y, playerDirection);
  }

  // Send the player's position to the server when they move
  function handleMove(x, y) {
    socket.emit("move", { x, y });
  }

  // Send the player's attack to the server when they attack
  function handleAttack(x, y) {
    socket.emit("attack", { x, y });
  }

  function updatePlayerPosition(data) {
    setPlayers({
      ...players,
      [data.id]: { ...players[data.id], x: data.x, y: data.y },
    });
  }

  function updatePlayerHealth(id) {
    setPlayers({
      ...players,
      [id]: { ...players[id], health: players[id].health - 25 },
    });
  }

  function removePlayer(id) {
    let newPlayers = { ...players };
    delete newPlayers[id];
    setPlayers(newPlayers);
  }

  const getSprite = (dir, key) => {
    if (dir === 'up') {
      return (
          <SpriteUp key={key}/>
      )
    } else if (dir === 'down') {
      return (
          <SpriteDown key={key}/>
      )
    } else if (dir === 'left') {
      return (
          <SpriteLeft key={key}/>
      )
    } else if (dir === 'right') {
      return (
          <SpriteRight key={key}/>
      )
    };
  };



  return (
    <div className="App">
      <div className="game-board">
        {Object.values(players).map((player, i) => {
          const sprite = getSprite(player.direction, player.id);
            return(
              <div
                key={player.id}
                className="player"
                id={`player-${i}`}
                style={{ left: `${player.x}px`, top: `${player.y}px`}}
              >
                {sprite}
              </div>
            )
        })}
      </div>
    </div>
  );
}

export default App;
