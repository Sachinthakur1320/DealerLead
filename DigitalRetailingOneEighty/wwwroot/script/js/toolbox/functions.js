(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        OEC = OEC || {};
		OEC.functions = OEC.functions || factory();
    }
})(function () {
	var exports = {};

	exports.not = function (x) {
		return function () { return !x.apply(this, arguments); };
	};

    exports.extractMethod = function (self, method) {
        return self[method].bind(self);
    };

	return exports;
});