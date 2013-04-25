/*jshint browser: true*/
/* global require, module */

var exports = (function (Movements) {
    "use strict";

    function Board() {
        this.pieces = new Array(64);
    }

    Board.prototype.add = function (piece) {
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

    Board.prototype.canMove = function (piece, x, y) {
        return Movements.isValid(piece.code, x - piece.x, y - piece.y, !piece.hasMoved()) &&
            (piece.type === 4 || !this.arePiecesBetween(piece.x, piece.y, x, y));
    };

    Board.prototype.move = function (piece, x, y) {
        piece.setPosition(x, y);
        piece.movements += 1;
    };

    Board.prototype.canMoveToCapture = function (captor, captive) {
        if (captor.color === captive.color) {
            return false;
        }

        if (captor.code === 5) { // white pawn
            return Math.abs(captive.x - captor.x) === 1 && (captive.y - captor.y) === -1;
        } else if (captor.code === 11) { // black pawn
            return Math.abs(captive.x - captor.x) === 1 && (captive.y - captor.y) === 1;
        } else {
            return this.canMove(captor, captive.x, captive.y);
        }
    };

    Board.prototype.capture = function (captor, captive) {
        this.remove(captive);
        this.move(captor, captive.x, captive.y);
    };

    Board.prototype.remove = function (piece) {
        this.pieces[piece.y * 8 + piece.x] = null;
        piece.remove();
    };

    return Board;

})(typeof require !== "undefined" ? require("./Movements") : this.Movements);

if (typeof module !== "undefined") {
    module.exports = exports;
} else {
    this.Board = exports;
}
