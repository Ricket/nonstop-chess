/*jshint node: true*/
"use strict";

var _ = require("lodash"),
    Board = require("../public/Board"),
    Piece = require("../public/Piece");

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
        "player2Ready": false,
        "board": new Board()
    };
    games[newId] = game;

    [8, 10, 9, 7, 6, 9, 10, 8,
     11, 11, 11, 11, 11, 11, 11, 11,
     5, 5, 5, 5, 5, 5, 5, 5,
     2, 4, 3, 1, 0, 3, 4, 2].forEach(function (code, idx) {
        var piece = new Piece(code);
        game.board.add(piece);
        piece.setPosition(idx % 8, Math.floor(idx / 8) + 4 * Math.floor(idx / 16));
    });

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
            console.error("playerReady fault, neither player");
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

function getGame(socket, callback) {
    socket.get("gameId", function (err, gameId) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, games[gameId]);
        }
    });
}

function getPlayerNumber(socket, game) {
    if (socket.id === game.player1.id) {
        return 1;
    } else if (socket.id === game.player2.id) {
        return 2;
    } else {
        throw new Error("Player not found");
    }
}

function getOpponent(socket, game) {
    if (socket.id === game.player1.id) {
        return game.player2;
    } else if (socket.id === game.player2.id) {
        return game.player1;
    } else {
        throw new Error("Opponent not found");
    }
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

    socket.on("move", function (data) {
        getGame(socket, function (err, game) {
            var oppositeData = {
                oldx: data.oldx,
                oldy: (7 - data.oldy),
                x: data.x,
                y: (7 - data.y)
            };
            var serverData = (getPlayerNumber(socket, game) === 1) ? data : oppositeData;

            var piece = game.board.getPieceAt(serverData.oldx, serverData.oldy);

            if (piece != null) {
                game.board.move(piece, serverData.x, serverData.y);
                socket.emit("move", data);
                var opponent = getOpponent(socket, game);
                opponent.emit("move", oppositeData);
            }
        });
    });
    socket.on("capture", function (data) {
        getGame(socket, function (err, game) {
            var oppositeData = {
                captorx: data.captorx,
                captory: (7 - data.captory),
                x: data.x,
                y: (7 - data.y)
            };
            var serverData = (getPlayerNumber(socket, game) === 1) ? data : oppositeData;

            var captor = game.board.getPieceAt(serverData.captorx, serverData.captory),
                captive = game.board.getPieceAt(serverData.x, serverData.y);

            if (captor != null && captive != null) {
                game.board.capture(captor, captive);
                socket.emit("capture", data);
                var opponent = getOpponent(socket, game);
                opponent.emit("capture", oppositeData);
            }
        });
    });
};
