// Client-only

/*jshint browser: true*/
this.Notice = (function () {
    "use strict";

    var exports = {};

    var notice = document.getElementById("notice"),
        mask = document.getElementById("mask"),
        isVisible = true;

    exports.isVisible = function () {
        return isVisible;
    };

    exports.show = function (text) {
        notice.innerHTML = text;
        notice.style.display = null;
        mask.style.display = null;
        isVisible = true;
    };

    exports.hide = function () {
        notice.style.display = "none";
        mask.style.display = "none";
        isVisible = false;
    };

    return exports;

})();
