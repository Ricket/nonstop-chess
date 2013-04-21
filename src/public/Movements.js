/*jshint browser: true*/
var exports = (function () {
    "use strict";

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
    validDestination.push(function (x, y, first) {
        return x === 0 && (first ? inRange(y, -2, -1) : y === -1);
    });
    for (var x = 0; x < 5; x += 1) {
        validDestination.push(validDestination[x]);
    }
    validDestination.push(function (x, y, first) {
        return x === 0 && (first ? inRange(y, 1, 2) : y === 1);
    });

    return {
        isValid: function (type, relx, rely, first) {
            return validDestination[type](relx, rely, first);
        }
    };

})();

/* global module */
if (typeof module !== "undefined") {
    module.exports = exports;
} else {
    this.Movements = exports;
}