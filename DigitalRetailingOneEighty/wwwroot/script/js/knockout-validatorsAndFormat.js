(function () {
ko.extenders.validateDefault = function (target, defaultValue) {
    var result = ko.computed({
        read: target,
        write: function (newValue) {
            if (newValue) {
                newValue = newValue.trim();
            }
            !newValue ? target(defaultValue) : target(newValue);
            target.notifySubscribers(newValue);
        }
    }).extend({ notify: 'always' });
    result(target());

    return result;
    };

ko.extenders.doNotAllowSpecialCharacters = function(target) {
    target.validationMessage = ko.observable();
    function validate(newValue) {
        if (newValue != undefined)
        {
            target(newValue.replace(/[\\#,@~%:*?<>{}]/g, '') ); 
        }
    }
    validate(target());
    target.subscribe(validate);
    return target;
    };  

    ko.extenders.removeWhiteSpaceAndLineBreak = function (target) {
        target.validationMessage = ko.observable();
        function validate(newValue) {
            if (newValue != undefined) {
                newValue = newValue.trim();
                target(newValue.replace(/[\r\n]+/gm, ''));
            }
        }
        validate(target());
        target.subscribe(validate);
        return target;
    };

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
                    return formatter.read.apply(null, [formatee()].concat(formatterOptions));
                },
                write: function (value) {
                    formatee(formatter.write(value));
                    formatee.notifySubscribers();
                }
            }).extend({ notify: 'always' });
        } else {
            formatted = formatter.read.apply(null, [formatee].concat(formatterOptions));
        }

        return formatted;
    };
};

ko.format.formatters = {
    currencyPositive: {
        read: Util.format.currencyPositive,
        write: Util.unformat.currencyPositive
    },
    number: {
        read: function (num) {
            num = isNaN(num) || num === '' || num === null || +num < 0 ? "" : parseInt(num);
            return num;
        },
        write: Util.unformat.number
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
}());