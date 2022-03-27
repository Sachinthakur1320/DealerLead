(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        OEC = (typeof OEC ==='undefined' ? {} : OEC);
		OEC.date = OEC.date || factory();
    }
})(function () {
	var exports = {};

	exports.add = (function () {
		var methods = {
			'yyyy': {
				'set': 'setFullYear',
				'get': 'getFullYear'
			},
			'm': {
				'set': 'setMonth',
				'get': 'getMonth'
			},
			'd': {
				'set': 'setDate',
				'get': 'getDate'
			},
			'h': {
				'set': 'setHours',
				'get': 'getHours'
			},
			'n': {
				'set': 'setMinutes',
				'get': 'getMinutes'
			},
			's': {
				'set': 'setSeconds',
				'get': 'getSeconds'
			}
			//missing q - Quarter, y - Day of Year, w - Weekday, ww - Week of year
		};
		return function (interval, number, date) {
			date = new Date(date);
			var method = methods[interval];
			date[method.set](date[method.get]() + number);
			return date;
		}
	}());

	exports.validate = function (date) {
		return !isNaN(new Date(date));
	};

	exports.removeNulls = function (date) {
		var d = new Date(date);
		if (!OEC.date.validate(date)) {
			return '';
		} else if (d.getFullYear() > 1901) {
			return d;
		} else {
			return '';
		}
	};
	return exports;
});