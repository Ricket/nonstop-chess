/* global module */
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            options: {
                jshintrc: "build/strict.jshintrc"
            },

            server: {
                src: ["src/server/**/*.js", "test/server/**/*.js"]
            },
            public: {
                src: ["src/public/**/*.js", "test/public/**/*.js"]
            },
            misc: {
                src: ["Gruntfile.js"]
            }
        },
        nodeunit: {
            server: ["test/server/**/*.js"],
            public: ["test/public/**/*.js"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");
};