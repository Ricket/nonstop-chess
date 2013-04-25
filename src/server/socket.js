/*jshint node: true*/
"use strict";

var _ = require("lodash");

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
        "player1Ready": false,
        "player2": socket2,
        "player2Ready": false
    };
    games[newId] = game;

    var sendGetReady = _.after(2, function () {
        socket1.emit("getReady");
        socket2.emit("getReady");
    });

    socket1.set("gameId", newId, sendGetReady);
    socket2.set("gameId", newId, sendGetReady);
}

function playerReady(socket) {
    socket.get("gameId", function (err, gameId) {
        if (err || gameId == null) {
            socket.disconnect();
            console.error(err);
            return;
        }

        var game = games[gameId];
        if (game.player1.id === socket.id) {
            game.player1Ready = true;
        } else if (game.player2.id === socket.id) {
            game.player2Ready = true;
        } else {
            console.log("playerReady fault, neither player");
            return;
        }

        if (game.player1Ready && game.player2Ready) {
            game.player1.emit("start");
            game.player2.emit("start");
        }
    });
}

function stopGame(gameId) {
    if (gameId in games) {
        var game = games[gameId];
        game.player1.emit("halt");
        game.player2.emit("halt");
        delete games[gameId];
    }
}

function getOpponent(socket, callback) {
    socket.get("gameId", function (err, gameId) {
        if (err) {
            callback(err, null);
        } else {
            var game = games[gameId];
            if (socket.id === game.player1.id) {
                callback(null, game.player2);
            } else if (socket.id === game.player2.id) {
                callback(null, game.player1);
            } else {
                callback("Not found in game", null);
            }
        }
    });
}

exports.onConnection = function (socket) {
    socket.on("disconnect", function () {
        if (pendingPlayer !== null && pendingPlayer.id === socket.id) {
            pendingPlayer = null;
        } else {
            socket.get("gameId", function (err, gameId) {
                if (gameId != null) {
                    stopGame(gameId);
                }
            });
        }
    });

    if (pendingPlayer === null) {
        pendingPlayer = socket;
        socket.emit("waitingForMatch");
    } else {
        startNewGame(socket, pendingPlayer);
        pendingPlayer = null;
    }

    socket.on("ready", function () {
        playerReady(socket);
    });

    socket.on("positionChange", function (data) {
        console.log("positionChange", require("util").inspect(data));
        getOpponent(socket, function (err, opponent) {
            opponent.emit("positionChange", {
                oldx: (7 - parseInt(data.oldx, 10)),
                oldy: (7 - parseInt(data.oldy, 10)),
                x: (7 - parseInt(data.x, 10)),
                y: (7 - parseInt(data.y, 10))
            });
        });
    });
    socket.on("capture", function (data) {
        getOpponent(socket, function (err, opponent) {
            opponent.emit("capture", {
                captorx: (7 - parseInt(data.captorx, 10)),
                captory: (7 - parseInt(data.captory, 10)),
                x: (7 - parseInt(data.x, 10)),
                y: (7 - parseInt(data.y, 10))
            });
        });
    });
};
