/*jshint browser: true*/
(function (Board, Piece, Movements, Highlighter, Notice, Socket) {
    "use strict";

    var UNIT = 50; // one block/piece size

    document.onmousedown = function (e) {
        // prevent highlighting the page if user drags or double-clicks
        e.preventDefault();
    };

    var boardView = document.getElementById("chessboard"),
        board = new Board();

    function addSquare(i) {
        var square = document.createElement("div"),
            x = i % 8,
            y = Math.floor(i / 8),
            darkness = ((x * x) + (y * y)) % 2;
        square.className += ["dark", "light"][darkness] + " square";
        boardView.appendChild(square);
        square.onclick = function () {
            var highlightedPiece = Highlighter.getModel();
            if (highlightedPiece !== null && board.canMove(highlightedPiece, x, y)) {
                Socket.emit("positionChange", { oldx: highlightedPiece.x, oldy: highlightedPiece.y, x: x, y: y });
                board.move(highlightedPiece, x, y);
                Highlighter.clear();
            }
        };
    }

    for (var i = 0; i < 64; i += 1) {
        addSquare(i);
    }

    [8, 10, 9, 7, 6, 9, 10, 8,
     11, 11, 11, 11, 11, 11, 11, 11,
     5, 5, 5, 5, 5, 5, 5, 5,
     2, 4, 3, 1, 0, 3, 4, 2].forEach(function (code, idx) {
        var piece = new Piece(code);
        board.add(piece);

        var pieceView = document.createElement("div");
        pieceView.innerHTML = "&#" + (9812 + code) + ";";
        pieceView.className = Piece.COLORS[piece.color] +
            " " + Piece.TYPES[piece.type] + " piece";
        boardView.appendChild(pieceView);

        piece.onPositionChange(function () {
            pieceView.style.left = (piece.x * UNIT) + "px";
            pieceView.style.top = (piece.y * UNIT) + "px";
        });

        piece.onRemove(function () {
            pieceView.parentNode.removeChild(pieceView);
        });

        pieceView.onclick = function () {
            var highlightedPiece = Highlighter.getModel();
            if (highlightedPiece === null) {
                if (piece.color === 0) {
                    Highlighter.set(pieceView, piece);
                }
            } else {
                if (highlightedPiece === piece) {
                    Highlighter.clear();
                } else if (board.canMoveToCapture(highlightedPiece, piece)) {
                    Socket.emit("capture", { captorx: highlightedPiece.x, captory: highlightedPiece.y, x: piece.x, y: piece.y });
                    board.capture(highlightedPiece, piece);
                    Highlighter.clear();
                } else if (piece.color === 0) {
                    Highlighter.set(pieceView, piece);
                } // else they've clicked a distant black piece
            }
            return false;
        };

        piece.setPosition(idx % 8, Math.floor(idx / 8) + 4 * Math.floor(idx / 16));
    });

    Socket.connect();
    Socket.on("error", function () {
        Notice.show("Error connecting to server.");
    });
    Socket.on("connect_failed", function () {
        Notice.show("Error connecting to server.");
    });
    Socket.on("disconnect", function () {
        Notice.show("Disconnected from server.");
    });
    Socket.on("waitingForMatch", function () {
        Notice.show("Waiting for match...");
    });
    Socket.on("getReady", function () {
        // TODO add button that sends the ready notification
        Socket.emit("ready");
        Notice.show("Get ready!");
    });
    Socket.on("start", function () {
        Notice.hide();
    });
    Socket.on("halt", function () {
        Notice.show("Your opponent left. Please refresh.");
        Socket.disconnect();
    });
    Socket.on("positionChange", function (data) {
        console.log("positionChange", data);
        var piece = board.getPieceAt(data.oldx, data.oldy);
        if (piece != null && piece.color === 1) {
            board.move(piece, data.x, data.y);
        }
    });
    Socket.on("capture", function (data) {
        console.log("capture", data);
        var captor = board.getPieceAt(data.captorx, data.captory);
        var captive = board.getPieceAt(data.x, data.y);
        if (captor != null && captive != null && captor.color === 1 && captive.color === 0) {
            board.capture(captor, captive);
        }
    });

})(this.Board, this.Piece, this.Movements, this.Highlighter, this.Notice, this.Socket);
