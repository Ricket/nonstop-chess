// Client-only

/*jshint browser: true*/
this.Socket = (function () {
    "use strict";

    var exports = {};

    var socket = null;

    exports.connect = function () {
        socket = io.connect(window.location.origin);
        return socket;
    };

    exports.on = function (event, callback) {
        socket.on(event, callback);
    };

    return exports;

})();