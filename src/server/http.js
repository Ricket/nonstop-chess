/*jshint node: true*/
"use strict";

var fs = require("fs"),
    http = require("http"),
    path = require("path"),
    uglifyJS = require("uglify-js");

var files = {};

["index.html", "404.html"].forEach(function (filename) {
    files[filename] = {
        type: "text/html",
        contents: fs.readFileSync(path.resolve(__dirname, "../public/" + filename))
    };
});

["nonstop-chess.css"].forEach(function (filename) {
    files[filename] = {
        type: "text/css",
        contents: fs.readFileSync(path.resolve(__dirname, "../public/" + filename))
    };
});

["nonstop-chess.js", "Board.js", "Highlighter.js", "Movements.js", "Piece.js"].forEach(function (filename) {
    files[filename] = {
        type: "text/javascript",
        contents: uglifyJS.minify(path.resolve(__dirname, "../public/" + filename)).code
        // contents: fs.readFileSync(path.resolve(__dirname, "../public/" + filename))
    };
});

http.createServer(function (req, res) {
    var url = req.url;
    if (url == null || url.length <= 1) {
        url = "/index.html";
    }

    var reqFile = url.substr(1);
    if (!files.hasOwnProperty(reqFile)) {
        reqFile = "404.html";
    }

    var file = files[reqFile];

    res.writeHead(200, {
        "Content-Length": file.contents.length,
        "Content-Type": file.type
    });
    res.end(file.contents, "utf8");
}).listen(7236);

console.log("http://localhost:7236/");
