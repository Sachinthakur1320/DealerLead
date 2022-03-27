(function () {
    ko.bindingHandlers.select2 = ko.bindingHandlers.select2 || function () {
        var populateOptions = function (valueAccessor) {
            var options = {};
            var data = ko.utils.unwrapObservable(valueAccessor().data);
            if (data) {
                options.data = data;
            }
            var disabled = ko.utils.unwrapObservable(valueAccessor().disabled);
            if (disabled) {
                options.disabled = disabled;
            }
            var placeholder = ko.utils.unwrapObservable(valueAccessor().placeholder);
            if (placeholder) {
                options.placeholder = placeholder;
            }
            var allowClear = ko.utils.unwrapObservable(valueAccessor().allowClear);
            if (allowClear) {
                options.allowClear = allowClear;
            }
            return options;
        };
        return {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var options = populateOptions(valueAccessor);
                $(element).select2(options);
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    $(element).select2('destroy');
                });
            },
            update: function (element, valueAccessor, allBindings, viewModel) {
                // need to reinit select2 if options or value has changed to handle valueAllowUnset
                var options = populateOptions(valueAccessor);
                var value = ko.utils.unwrapObservable(allBindings.get('value'));
                var selectedOptions = ko.utils.unwrapObservable(allBindings.get('selectedOptions'));
                $(element).select2(options);
                if(options.disabled){
                    $(element).select2("disable");
                } else {
                    $(element).select2("enable");
                }
                $(element).select2('val', value || selectedOptions);
            }
        };
    }();
}());