(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(["knockout", "popover"], factory);
    } else if (typeof require === 'function') {
        module.exports = factory(window.ko);
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        factory(window.ko);
    }
})(function (ko) {

    ko.bindingHandlers['popover'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var rootModel = bindingContext.$root;
            var options = valueAccessor();

            ko.computed(function () {
                var opt = {};
                opt.title = ko.utils.unwrapObservable(options.title);
                opt.content = ko.utils.unwrapObservable(options.content);
                opt.placement = ko.utils.unwrapObservable(options.placement);
                opt.container = ko.utils.unwrapObservable(options.container);
                opt.trigger = options.toggle ? 'manual' : options.trigger;
                opt.html = options.html;
                opt.template = options.template;

                if (!options.template) {
                    var $close = $('<button type="button" class="close" style="padding:7px;">&times;</button>');
                    var $template =
                        $('<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>');
                    $template.find('.popover-title').before($close);
                    $close.on('click',
                        function (e) {
                            $element
                                .popover('toggle');
                            // Hide leave a shadow there making background elements impossible to click on.
                        });
                    opt.template = $template;
                };

                if (opt.container) {
                    ko.bindingHandlers.element.getModelElement(rootModel,
                        options.container,
                        function (element) {
                            opt.container = element;
                            $element.popover('destroy').popover(opt);
                            //If the content is observable, destroy the popup and re-create it when the observable changes.
                            if (ko.isSubscribable(options.content)) {
                                options.content.subscribe(function (newContent) {
                                    opt.content = newContent;
                                    $element.popover('destroy').popover(opt);
                                });
                            }
                        });
                } else {
                    $element.popover('destroy').popover(opt);
                }
            },
                null,
                { 'disposeWhenNodeIsRemoved': element });


            if (options.toggle) {
                options.toggle.subscribe(function (value) {
                    $element.popover(value ? 'show' : 'hide');
                });
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element,
                function () {
                    $element.popover('destroy');
                });
        }
    };
});