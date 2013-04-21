/*jshint browser: true*/
(function (Board, Piece, Movements, Highlighter) {
    "use strict";

    /* GLOBALS */
    var UNIT = 50; // one block/piece size

    /* USER INTERACTION */
    document.onmousedown = function (e) {
        // prevent highlighting the page if user drags or double-clicks
        e.preventDefault();
    };

    /* SETTING UP BOARD AND PIECES */
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
                highlightedPiece.moveTo(x, y);
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

        piece.setPosition(idx % 8, Math.floor(idx / 8) + 4 * Math.floor(idx / 16));

        pieceView.onclick = function () {
            var highlightedPiece = Highlighter.getModel();
            if (highlightedPiece === null) {
                Highlighter.set(pieceView, piece);
            } else if (highlightedPiece === piece) {
                Highlighter.clear();
            } else if (board.capture(highlightedPiece, piece)) {
                pieceView.parentNode.removeChild(pieceView);
                Highlighter.clear();
            } else {
                Highlighter.set(pieceView, piece);
            }
            return false;
        };
    });

})(this.Board, this.Piece, this.Movements, this.Highlighter);