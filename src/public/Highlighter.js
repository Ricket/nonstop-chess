// Client-only

/*jshint browser: true*/
this.Highlighter = (function () {
    "use strict";

    var exports = {};

    var highlightedView = null,
        highlightedModel = null;

    exports.set = function (view, model) {
        if (highlightedView !== null) {
            highlightedView.className = highlightedView.className.replace(/ highlighted/g, "");
        }
        highlightedView = view;
        highlightedModel = model;
        if (highlightedView !== null) {
            highlightedView.className += " highlighted";
        }
    };

    exports.clear = function () {
        exports.set(null, null);
    };

    exports.getView = function () {
        return highlightedView;
    };

    exports.getModel = function () {
        return highlightedModel;
    };

    return exports;

})();