/*jshint node: true*/
"use strict";

// var _ = require("lodash");

var pendingPlayer = null,
    games = {};

function getNewGameId() {
    var newId;
    do {
        newId = ("" + Math.random()).substr(2);
    } while (games.hasOwnProperty(newId));
    return newId;
}

function startNewGame(socket1, socket2) {
    var newId = getNewGameId();
    var game = {
        "id": newId,
        "player1": socket1,
        "player2": socket2
    };
    games[newId] = game;


}

exports.onConnection = function (socket) {
    console.dir(socket);

    // TODO setup disconnect handler
    socket.on("disconnect", function () {
        pendingPlayer = null; // TODO this is bad, just for testing
    });

    if (pendingPlayer === null) {
        pendingPlayer = socket;
        socket.emit("waitingForMatch");
    } else {
        startNewGame(socket, pendingPlayer);
    }
};
