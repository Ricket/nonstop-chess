/*jshint browser: true*/
(function () {
    "use strict";

    /* GLOBALS */
    var UNIT = 50; // one block/piece size

    /* CHESS BOARD */
    function Board(elem) {
        this.elem = elem;
        this.pieces = new Array(64);

        function addSquare(i) {
            var square = document.createElement("div");
            square.className += ["dark", "light"][(i + Math.floor(i / 8)) % 2] + " square";
            elem.appendChild(square);
            square.onclick = function () {
                squareOnClick(i % 8, Math.floor(i / 8));
            };
        }

        for (var i = 0; i < 64; i += 1) {
            addSquare(i);
        }
    }
    Board.prototype.add = function (piece) {
        this.elem.appendChild(piece.elem);
        this.pieces[piece.y * 8 + piece.x] = piece;
        var _this = this;
        piece.onPositionChange(function (oldX, oldY) {
            _this.pieces[oldY * 8 + oldX] = null;
            _this.pieces[piece.y * 8 + piece.x] = piece;
        });
    };
    Board.prototype.getPieceAt = function (x, y) {
        return this.pieces[y * 8 + x] || null;
    };
    Board.prototype.arePiecesBetween = function (x1, y1, x2, y2) {
        // assume that (x1, y1) -> (x2, y2) is either a straight or a diagonal, not something weird
        var xv = x2 - x1,
            yv = y2 - y1;
        if (xv !== 0) {
            xv /= Math.abs(xv);
        }
        if (yv !== 0) {
            yv /= Math.abs(yv);
        }
        x1 += xv;
        y1 += yv;
        while (x1 !== x2 || y1 !== y2) {
            if (this.getPieceAt(x1, y1) !== null) {
                return true;
            }
            x1 += xv;
            y1 += yv;
        }
        return false;
    };

    /* PIECE MOVEMENT VALIDATORS */
    function inRange(num, min, max) {
        return min <= num && num <= max;
    }

    function isDiagonal(x, y) {
        return Math.abs(x) === Math.abs(y);
    }

    function isStraight(x, y) {
        return x === 0 || y === 0;
    }

    var validDestination = [];
    // note: x and y are relative
    validDestination.push(function (x, y) {
        return inRange(x, -1, 1) && inRange(y, -1, 1);
    });
    validDestination.push(function (x, y) {
        return isDiagonal(x, y) || isStraight(x, y);
    });
    validDestination.push(function (x, y) {
        return isStraight(x, y);
    });
    validDestination.push(function (x, y) {
        return isDiagonal(x, y);
    });
    validDestination.push(function (x, y) {
        return (Math.abs(x) === 1 && Math.abs(y) === 2) || (Math.abs(x) === 2 && Math.abs(y) === 1);
    });
    validDestination.push(function (x, y, movements) {
        return x === 0 && (movements === 0 ? inRange(y, -2, -1) : y === -1);
    });
    for (var x = 0; x < 5; x += 1) {
        validDestination.push(validDestination[x]);
    }
    validDestination.push(function (x, y, movements) {
        return x === 0 && (movements === 0 ? inRange(y, 1, 2) : y === 1);
    });

    /* PIECE DATA */
    var pieceColors = ["white", "black"],
        pieceTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];

    function Piece(code) {
        this.code = code;
        this.color = Math.floor(code / 6);
        this.type = code % 6;
        this.movements = 0;

        this.elem = document.createElement("div");
        this.elem.innerHTML = "&#" + (9812 + code) + ";";
        this.elem.className = pieceColors[this.color] +
            " " + pieceTypes[this.type] + " piece";
        this.setPosition(0, 0);

        this.elem.onclick = Piece.prototype.onClick.bind(this);
    }

    /* HIGHLIGHTING */
    var highlightedPiece = null;

    function setHighlighted(piece) {
        if (highlightedPiece !== null) {
            highlightedPiece.elem.className = highlightedPiece.elem.className.replace(/ highlighted/g, "");
        }
        highlightedPiece = piece;
        if (piece !== null) {
            piece.elem.className += " highlighted";
        }
    }

    /* PIECE MOVEMENT */
    Piece.prototype.canMove = function (x, y) {
        return validDestination[this.code](x - this.x, y - this.y, this.movements) &&
            (this.type === 4 || !board.arePiecesBetween(this.x, this.y, x, y));
    };

    Piece.prototype.canCapture = function (other) {
        if (this.color === other.color) {
            return false;
        }

        if (this.code === 5) { // white pawn
            return Math.abs(other.x - this.x) === 1 && (other.y - this.y) === -1;
        } else if (this.code === 11) { // black pawn
            return Math.abs(other.x - this.x) === 1 && (other.y - this.y) === 1;
        } else {
            return this.canMove(other.x, other.y);
        }
    };

    Piece.prototype.positionChangeListener = function () {};
    Piece.prototype.onPositionChange = function (callback) {
        this.positionChangeListener = callback;
    };
    Piece.prototype.setPosition = function (x, y) {
        var oldX = this.x,
            oldY = this.y;
        this.x = x;
        this.y = y;
        this.elem.style.left = (x * UNIT) + "px";
        this.elem.style.top = (y * UNIT) + "px";
        this.positionChangeListener(oldX, oldY);
        return this;
    };

    Piece.prototype.moveTo = function (x, y, capturing) {
        if (capturing || this.canMove(x, y)) {
            this.setPosition(x, y);
            this.movements += 1;
        }
    };

    Piece.prototype.isCaptured = false;
    Piece.prototype.capture = function () {
        this.elem.parentNode.removeChild(this.elem);
        this.isCaptured = true;
    };

    /* USER INTERACTION */
    document.onmousedown = function (e) {
        // prevent highlighting the page if user drags or double-clicks
        e.preventDefault();
    };

    Piece.prototype.onClick = function () {
        if (highlightedPiece === null) {
            setHighlighted(this);
        } else if (highlightedPiece === this) {
            setHighlighted(null);
        } else if (highlightedPiece.canCapture(this)) {
            highlightedPiece.moveTo(this.x, this.y, true);
            this.capture();
            setHighlighted(null);
        } else {
            setHighlighted(this);
        }
        return false;
    };

    function squareOnClick(x, y) {
        if (highlightedPiece !== null) {
            highlightedPiece.moveTo(x, y);
            setHighlighted(null);
        }
    }

    /* SETTING UP BOARD AND PIECES */
    var board = new Board(document.getElementById("chessboard"));

    [8, 10, 9, 7, 6, 9, 10, 8,
     11, 11, 11, 11, 11, 11, 11, 11,
     5, 5, 5, 5, 5, 5, 5, 5,
     2, 4, 3, 1, 0, 3, 4, 2].forEach(function (code, idx) {
        board.add(new Piece(code).setPosition(idx % 8, Math.floor(idx / 8) + 4 * Math.floor(idx / 16)));
    });

})();