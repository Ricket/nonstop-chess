/*jshint node: true*/
"use strict";

var PORT = 8000;

var fs = require("fs"),
    http = require("http"),
    path = require("path"),
    cleanCSS = require("clean-css"),
    uglifyJS = require("uglify-js");

var files = {},
    publicDir = path.resolve(__dirname, "../public");

["/game.html", "/404.html"].forEach(function (filename) {
    files[filename] = {
        type: "text/html",
        contents: fs.readFileSync(path.resolve(__dirname, "../public/" + filename), { encoding: "utf8" })
    };
});

["/nonstop-chess.css"].forEach(function (filename) {
    files[filename] = {
        type: "text/css",
        contents: cleanCSS.process(
            fs.readFileSync(publicDir + filename, { encoding: "utf8" }))
    };
});

files["/nonstop-chess.js"] = {
    type: "text/javascript",
    contents: uglifyJS.minify([
        publicDir + "/Movements.js",
        publicDir + "/Piece.js",
        publicDir + "/Board.js",
        publicDir + "/Highlighter.js",
        publicDir + "/Notice.js",
        publicDir + "/Socket.js",
        publicDir + "/nonstop-chess.js"
    ]).code
};

var httpServer = http.createServer(function (req, res) {
    var reqFile = req.url;
    if (reqFile == null || reqFile.length <= 1) {
        reqFile = "/game.html";
    }

    if (!files.hasOwnProperty(reqFile)) {
        reqFile = "/404.html";
    }

    var file = files[reqFile];

    res.writeHead(200, {
        "Content-Length": file.contents.length,
        "Content-Type": file.type
    });
    res.end(file.contents, "utf8");
});

var io = require("socket.io").listen(httpServer);

httpServer.listen(PORT);

io.sockets.on("connection", require("./socket").onConnection);

console.log("http://localhost:" + PORT + "/");
