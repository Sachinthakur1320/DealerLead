!function($) {

    "use strict"; // jshint ;_;


    /* LOADING PUBLIC CLASS DEFINITION
    * ============================== */

    var Loading = function(element, options) {
        this.init(element, options);
    }

    Loading.prototype = {

        constructor: Loading,

        init: function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.loading.defaults, options);
            this.initialPos = this.$element.prop('style').position;
        },

        toggle: function() {
            return this[!this.isShown ? 'show' : 'hide']();
        },

        show: function() {
            if (this.isShown) return;

            this.isShown = true;

            this.position();

            this.$mask = this.$mask || $('<div class="loading-mask fade" />')
				.toggleClass('loading-trans', this.options.transparent)
				.appendTo(this.$element)
                .show();

            this.$spinner = (this.$spinner || $(this.options.spinner))
				.appendTo(this.$element);

            this.$mask[0].offsetWidth
            this.$spinner[0].offsetWidth

            this.$mask[0].offsetWidth;

            this.$mask.addClass('in');
            this.$spinner.addClass('in');

            var done = function() {
                that.$element.triggerHandler('loading');
            }

            var that = this;

            $.support.transition ?
				this.$mask.one($.support.transition.end, done) :
				done();
        },

        hide: function() {
            if (!this.isShown) return;

            this.isShown = false;

            if (!this.$mask) return;

            this.$mask[0].offsetWidth;

            this.$mask.removeClass('in');
            this.$spinner.removeClass('in');

            $.support.transition ?
				this.hideWithTransition(this.$mask, $.proxy(this.removeMask, this)) :
				this.removeMask();

            $.support.transition ?
				this.hideWithTransition(this.$mask, $.proxy(this.removeSpinner, this)) :
				this.removeSpinner();

            var done = function() {
                that.$element.triggerHandler('loaded');
                that.position();
            }

            var that = this;

            $.support.transition ?
				this.$mask.one($.support.transition.end, done) :
				done();
        },

        position: function() {
            var boundingPositions = ['absolute', 'relative', 'fixed'];

            if ($.inArray(this.initialPos, boundingPositions) == -1) {
                if (this.isShown) {
                    this.$element.css('position', 'relative');
                } else {
                    this.$element.css('position', this.initialPos);
                }
            }
        },

        hideWithTransition: function($element, callback) {
            var that = this
				, timeout = setTimeout(function() {
				    $element.off($.support.transition.end)
				    callback()
				}, 500);

            $element.one($.support.transition.end, function() {
                clearTimeout(timeout)
                callback()
            });
        },

        removeMask: function() {
            if (this.$mask) {
                this.$mask.remove();
                this.$mask = null;
            }

        },

        removeSpinner: function() {
            if (this.$spinner) {
                this.$spinner.remove();
                this.$spinner = null;
            }
        },

        destroy: function() {
            var e = $.Event('destroy');
            this.$element.triggerHandler(e);
            if (e.isDefaultPrevented()) return;

            this.$element.off('.loading');
            this.$element.removeData('loading');
        }

    }


    /* LOADING PLUGIN DEFINITION
    * ======================== */

    $.fn.loading = function(option) {
        var args = arguments;
        return this.each(function() {
            var $this = $(this),
				data = $this.data('loading'),
				options = $.extend({}, $.fn.loading.defaults, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('loading', (data = new Loading(this, options)));
            if (typeof option == 'string') data[option].apply(data, Array.prototype.slice.call(args, 1));
            else if (options.show) data.show()
        })
    }

    $.fn.loading.defaults = {
        spinner: '<img class="loading-spinner fade" src="/webasp/images/oespinner-trans.gif" />',
        show: true,
        transparent: false
    }

    $.fn.loading.Constructor = Loading


    /* LOADING DATA-API
    * =============== */

    $(function() {
        $(document).on('click.loading.data-api', '[data-toggle^=loading]', function(e) {
            var $this = $(this),
				href = $this.attr('href'),
				$target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
				option = $target.data('loading') ? 'toggle' : undefined;

            e.preventDefault();
            $target.loading(option);
        })
    })

} (window.jQuery);