const socket = io(); // connecting client to socketio
const chess =new Chess(); // initializes a new game with chess.js library
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board(); // return a 2d 8*8 array
    boardElement.innerHTML = "";
    console.log(board);
    
    board.forEach((row , rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex + squareindex) % 2 === 0? "light" : "dark" // squares ont the board;
            );

            squareElement.dataset.row = rowindex; // part of HTML attribute, stores row
            squareElement.dataset.col = squareindex; // stores column

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if(pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain",""); //cross browsers compatible;
                    }
                });

                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            })

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if(draggedPiece) {
                    const targetSource = {
                        row : parseInt(squareElement.dataset.row),
                        column :parseInt(squareElement.dataset.col),
                    }
                
                    handleMove(sourceSquare, targetSource);
                }
            })
        })
    });

    if(playerRole === 'b') {
        boardElement.classList.add("flipped");
    }
    
    else {
        boardElement.classList.remove("flipped");
    }

    boardElement.appendChild(squareElement);
}

const handleMove = () => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + source.row)}${8 - source.row}`,
        promotion: 'q'
    };
    socket.emit("move",move);
}

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟" ,  P: "♙" ,
        n: "♞" ,  N: "♘" ,
        b: "♝" ,  B: "♗" ,  
        r: "♜" ,  R: "♖" ,
        q: "♛" ,  Q: "♕" ,  
        k: "♚" ,  K: "♔" ,
    };

    return unicodePieces[piece.type] || "";
}; 



socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState" ,(fen) => {
    chess.load(fen);
    renderBoard();
});


socket.on("move" ,(move) => {
    chess.move(move);
    renderBoard();
});



renderBoard();


