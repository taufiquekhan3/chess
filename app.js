const express = require("express");
const socket = require("socket.io");
const ejs = require("ejs");
const http = require("https");
const { Chess } = require("chess.js");
const { log } = require("console");

const path = require("path");


const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));


app.get("/", (req,res) => {
    res.render("index");
})



io.on("connection",  (uniquesocket) => { // the user which got connected tauseef
   console.log("connected");
   
   if(!players.white) {
      players.white = uniquesocket.id;
      uniquesocket.emit("playerRole", "w");
   }
   else if(!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
   }
   else {
    uniquesocket.emit("spectatorRole");
   }


   uniquesocket.on("disconnect", () => {
    if(uniquesocket.id === players.white) {
        delete players.white;
    }
    else if(uniquesocket.id === players.black) {
        delete players.black;
    }
   });

   uniquesocket.on("move", (move) => {
    try {
        if(chess.turn() === 'w' && uniquesocket.id !== players.white) return;
        if(chess.turn() === 'b' && uniquesocket.id !== players.black) return;

        const result = chess.move(move);
        if(result) {
            currentPlayer = chess.turn();
            io.emit("move",move); // if tauseef moves he and me both can see the move which will reflect on frontend.
            io.emit("boardState", chess.fen())
        }
        else {
            console.log("Invalid move :",move);
            uniquesocket.emit("Invalid move ",move);
            
        }

    } catch (error) {
        console.log(error);
        uniquesocket.emit("Invalid move: ",move);
        
    }
   })













   

})
 
PORT = 5000;

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})