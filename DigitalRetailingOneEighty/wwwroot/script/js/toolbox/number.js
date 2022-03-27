(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        OEC = (typeof OEC ==='undefined' ? {} : OEC);
		OEC.number = OEC.number || factory();
    }
})(function () {
	var exports = {};

	exports.round = function (number, decimalPlaces) {
		decimalPlaces = decimalPlaces || 0;
		return Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
	};

	return exports;
});