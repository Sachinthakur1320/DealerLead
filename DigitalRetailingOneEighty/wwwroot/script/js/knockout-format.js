(function (ko) {

	// arguments: formatter, arg1, arg2...
	ko.format = function (formatter) {
		var formatterOptions = Array.prototype.slice.call(arguments, 1);
		if (typeof formatter === 'string') {
			formatter = ko.format.formatters[formatter];
		} else if (typeof formatter === 'function') {
			formatter = { read: formatter };
		}

		return function (formatee) {
			var formatted;

			if (ko.isObservable(formatee)) {
				formatted = ko.computed({
					read: function () {
						return formatter.read.apply(null, [ formatee() ].concat(formatterOptions));
					},
					write: function (value) {
						formatee(formatter.write(value));
						formatee.valueHasMutated();
						formatted.notifySubscribers();
					}
				});
			} else {
				formatted = formatter.read.apply(null, [ formatee ].concat(formatterOptions));
			}

			return formatted;
		};
	};

	ko.format.formatters = {
		number: {
			read: Util.format.number,
			write: Util.unformat.number
		},
		numberPositive: {
			read: Util.format.numberPositive,
			write: Util.unformat.numberPositive
		},
		percent: {
			read: Util.format.percent,
			write: Util.unformat.percent
		},
		percentPositive: {
			read: Util.format.percentPositive,
			write: Util.unformat.percentPositive
		},
		currency: {
			read: Util.format.currency,
			write: Util.unformat.currency
		},
		currencyPositive: {
			read: Util.format.currencyPositive,
			write: Util.unformat.currencyPositive
		},
		currencyNegate: {
		    read: Util.format.currencyNegate
		},
		currencyBlank: {
			read: Util.format.currencyBlank,
			write: Util.unformat.currencyBlank
		},
		address: {
			read: Util.format.address,
			write: Util.unformat.address
		},
		phone: {
			read: Util.format.phone,
			write: Util.unformat.phone
		},
		time: {
			read: Util.format.time,
			write: Util.unformat.time
		},
		postalCode: {
			read: Util.format.postalCode,
			write: Util.unformat.postalCode
		},
		date: {
			read: function (value, format) {
				return value ? formatDate(value, format) : '';
			},
			write: function (value) {
				return new Date(value);
			}
		},
		trim: {
			read: function (value, length) {
				return value.length > length ? value.substr(0, length - 3) + '...' : value;
			}
		},
		numberPlain: {
			read: Util.format.numberPlain,
			write: Util.unformat.numberPlain
		}
	};

	var formatPreprocessor = function (text) {
		var parts = text.split(' | ');
		var formatText = parts.shift().trim();
		while (parts.length) {
			var formatterParts = parts.shift().split(':');
			var formatterArgs = '\'' + formatterParts[0].trim() + '\'';
			if (formatterParts[1]) {
				formatterArgs = formatterArgs + ',' + formatterParts[1];
			}
			formatText = 'ko.format(' + formatterArgs + ')(' + formatText + ')';
		}
		return formatText;
	};

	var chainPreprocessor = function (binding, preprocessFn) {
		if (binding.preprocess) {
			var oldFn = binding.preprocess;
			binding.preprocess = function (value, binding, addBinding) {
	            value = oldFn.call(this, value, binding, addBinding);
	            if (value) {
	                return preprocessFn.call(this, value, binding, addBinding);
	            }
	        };
		} else {
			binding.preprocess = preprocessFn;
		}
	};

	// add format preprocessor to all bindings 
	Object.keys(ko.bindingHandlers).forEach(function (bindingName) {
		chainPreprocessor(ko.bindingHandlers[bindingName], formatPreprocessor);
	});

})(window.ko);