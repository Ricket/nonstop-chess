/*jshint node: true*/
"use strict";

var fs = require("fs"),
    http = require("http"),
    path = require("path"),
    uglifyJS = require("uglify-js");

var files = {
    "index.html": fs.readFileSync(path.resolve(__dirname, "../client/index.html")),
    "nonstop-chess.js": uglifyJS.minify(path.resolve(__dirname, "../client/nonstop-chess.js")).code,
    "nonstop-chess.css": fs.readFileSync(path.resolve(__dirname, "../client/nonstop-chess.css")),
    "404.html": fs.readFileSync(path.resolve(__dirname, "../client/404.html"))
};

http.createServer(function (req, res) {
    var url = req.url;
    if (url == null || url.length <= 1) {
        url = "/index.html";
    }

    var reqFile = url.substr(1);
    if (files.hasOwnProperty(reqFile)) {
        res.end(files[reqFile], "utf8");
    } else {
        res.end(files["404.html"], "utf8");
    }
}).listen(7236);

console.log("http://localhost:7236/");
