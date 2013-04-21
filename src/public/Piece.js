/*jshint browser: true*/
var exports = (function () {
    "use strict";

    function Piece(code) {
        this.code = code;
        this.color = Math.floor(code / 6);
        this.type = code % 6;
        this.movements = 0;
        this.positionChangeListeners = [];
    }

    Piece.COLORS = ["white", "black"];
    Piece.TYPES = ["king", "queen", "rook", "bishop", "knight", "pawn"];

    Piece.prototype.hasMoved = function () {
        return this.movements !== 0;
    };

    Piece.prototype.onPositionChange = function (callback) {
        this.positionChangeListeners.push(callback);
    };

    Piece.prototype.setPosition = function (x, y) {
        var oldX = this.x,
            oldY = this.y;
        this.x = x;
        this.y = y;
        this.positionChangeListeners.forEach(function (listener) {
            listener(oldX, oldY);
        });
        return this;
    };

    Piece.prototype.moveTo = function (x, y) {
        this.setPosition(x, y);
        this.movements += 1;
    };

    return Piece;

})();

/* global module */
if (typeof module !== "undefined") {
    module.exports = exports;
} else {
    this.Piece = exports;
}