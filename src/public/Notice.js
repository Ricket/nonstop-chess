// Client-only

/*jshint browser: true*/
this.Notice = (function () {
    "use strict";

    var exports = {};

    var notice = document.getElementById("notice"),
        mask = document.getElementById("mask");

    exports.show = function (text) {
        notice.innerHTML = text;
        notice.style.display = null;
        mask.style.display = null;
    };

    exports.hide = function () {
        notice.style.display = "none";
        mask.style.display = "none";
    };

    return exports;

})();