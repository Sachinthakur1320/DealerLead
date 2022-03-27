(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        OEC = (typeof OEC ==='undefined' ? {} : OEC);
		OEC.array = OEC.array || factory();
    }
})(function () {
	var compare = function (a, b) {
		if (a === undefined || b === undefined) {
			return false;
		} else if ((typeof typeof a === 'object' && typeof b === 'object') && (Object.keys(a).length !== Object.keys(b).length)) {
			return false;
		} else if (typeof a === 'object' && typeof b === 'object') {
			return Object.keys(a).every(function (key) {
				return compare(a[key], b[key]);
			});
		} else {
			return a === b;
		}
	};

	var exports = {};

	exports.intersection = function (array, other) {
		return array.filter(function (item) {
			return other.some(function (otherVal) {
				return compare(otherVal, item);
			});
		});
	};

	// returns only unique fields from an array, does not perserve order
	exports.uniq = exports.unique = function (arr) {
		var hash ={};
		arr.forEach(function (val) {
		    hash[val] = val;
		});
		return Object.keys(hash).map(function (key) { return hash[key]; }); // Hash keys can only be strings, so keep the type.
	};

	return exports;
});