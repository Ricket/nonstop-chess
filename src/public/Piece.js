/*jshint browser: true*/
var exports = (function () {
    "use strict";

    var nextId = 0;

    function Piece(code) {
        this.id = nextId++;
        this.code = code;
        this.color = Math.floor(code / 6);
        this.type = code % 6;
        this.movements = 0;
        this.positionChangeListeners = [];
        this.removeListeners = [];
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
    };

    Piece.prototype.onRemove = function (callback) {
        this.removeListeners.push(callback);
    };

    Piece.prototype.remove = function () {
        this.isRemoved = true;
        this.removeListeners.forEach(function (listener) {
            listener();
        });

    return Piece;

})();

/* global module */
if (typeof module !== "undefined") {
    module.exports = exports;
} else {
    this.Piece = exports;
}
