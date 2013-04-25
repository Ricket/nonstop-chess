// Client-only

/*jshint browser: true*/
/* global io */
this.Socket = (function () {
    "use strict";

    var exports = {};

    var socket = null;

    exports.connect = function () {
        socket = io.connect(window.location.origin, { reconnect: false });
        return socket;
    };

    exports.disconnect = function () {
        if (socket !== null) {
            socket.disconnect();
            socket = null;
        }
    };

    exports.on = function (event, callback) {
        if (socket !== null) {
            socket.on(event, callback);
        }
    };

    exports.emit = function (event, callback) {
        if (socket !== null) {
            socket.emit(event, callback);
        }
    };

    return exports;

})();
