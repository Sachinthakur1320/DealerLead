!function ($) {

	"use strict"; // jshint ;_;

	/* ANIMATION SUPPORT 
	* ====================== */

	$(function () {

		$.support.animation = (function () {

			var animationEnd = (function () {

				var el = document.createElement('bootstrap'), 
					animsEndEventNames = {
				   		'WebkitAnimation'  : 'webkitAnimationEnd',
						'MozAnimation'     : 'animationend',
						'OAnimation'       : 'oAnimationEnd',
						'msAnimation'       : 'MSAnimationEnd',
						'animation'         : 'animationend'
					},
				  	name;

				for (name in animsEndEventNames){
					if (el.style[name] !== undefined) {
						return animsEndEventNames[name];
					}
				}

			}());

			return animationEnd && {
				end: animationEnd
			}

		})();

	});


	/* PANE CLASS DEFINITION
	* ====================== */

	var Pane = function (element, options) {
		this.init(element, options);
	};

	Pane.prototype = {

		constructor: Pane,

		init: function (element, options) {
			var that = this;
			
			this.options = options;

			this.$element = $(element)
				.on('click.dismiss.pane', '[data-dismiss="pane"]', function (e) {
					e.preventDefault();
					that.hide('backwards');
				});
		},

		toggle: function () {
			return this.isShown ? this.hide('backwards') : this.show('forwards');
		},

		show: function (direction) {
			var e = $.Event('show', { direction: direction }),
				direction = direction || 'forwards',
				that = this,
				animation,
				manager;

			if (this.isShown) return;

			this.$element.trigger(e);

			if (e.isDefaultPrevented()) return;

			if (direction === 'forwards') {
				// save off original parent
				this.$parent = this.$parent || this.$element.parent();

				manager = this.getManager();
				manager.addPane(this);
			}

			this.isShown = true;

			this.escape();

			if (this.options.loading) this.loading();

			if (this.options.remote && direction === 'forwards') {
				this.loading();

				$.ajax(this.options.remote, this.options.ajaxSettings)
					.done(function (data) {
						that.loading();
						// empty all but loading mask
						that.$element.children().not('.loading-mask').remove();
						that.$element.append(data);
					});
			}

			if ($.support.animation) this.$element[0].offsetWidth;

			animation = this.getAnimation(direction, false);

			this.$element.show()
				.addClass(animation);

			$.support.animation && animation ?
				this.withTransition('showPane', direction) :
				this.showPane(direction);
		},

		showPane: function (direction) {
			var that = this;

			this.$element
				.focus()
				.removeClass(this.options[direction + 'In'])
				.trigger('shown', { direction: direction });

		},

		hide: function (direction) {
			var e = $.Event('hide', { direction: direction }),
				animation, 
				manager;

			if (!this.isShown) return;

			this.$element.trigger(e);

			if (e.isDefaultPrevented()) return (this.isShown = false);

			if (direction === 'backwards') {
				manager = this.getManager();
				manager.removePane(this);
			}

			this.isShown = false;

			this.focused = $(document.activeElement);

			this.escape();

			if ($.support.animation) this.$element[0].offsetWidth; 

			animation = this.getAnimation(direction, true);

			this.$element
				.addClass('pane-out')
				.addClass(animation);

			$.support.animation && animation ?
				this.withTransition('hidePane', direction) :
				this.hidePane(direction);
		},

		hidePane: function (direction) {
			var e = $.Event('hidden', { direction: direction });

			this.$element
				.hide()
				.removeClass('pane-out')
				.removeClass(this.options[direction + 'Out'])
				.trigger(e);
		},

		withTransition: function (method, direction) {
			var that = this, 
				timeout = setTimeout(function () {
					that.$element.off($.support.animation.end);
					that[method](direction);
				}, 500);

			this.$element.one($.support.animation.end, function () {
				clearTimeout(timeout);
				that[method](direction);
			});
		},

		escape: function () {
			var that = this;
			if (this.isShown && this.options.keyboard) {
				if (!this.$element.attr('tabindex')) this.$element.attr('tabindex', -1);

				this.$element.on('keyup.dismiss.pane', function (e) {
					e.which == 27 && that.hide('backwards');
				});
			} else if (!this.isShown) {
				this.$element.off('keyup.dismiss.pane');
			}
		},

		loading: function (cb) {
			cb = cb || function () {};

			if (!this.isLoading) {
				this.$element
					.css('height', this.options.loadingHeight)
					.addClass('pane-loading');

				this.$loading = $('<div class="loading-mask fade">')
					.append(this.options.spinner)
					.appendTo(this.$element);

				if ($.support.transition) this.$loading[0].offsetWidth; // force reflow

				this.$loading.addClass('in');

				this.isLoading = true;

				$.support.transition ?
					this.$loading.one($.support.transition.end, cb) :
					cb();
			} else if (this.isLoading && this.$loading) {
				this.$loading.removeClass('in');

				var that = this;
				$.support.transition ? 
					this.$loading.one($.support.transition.end, function () { that.removeLoading() }) :
					that.removeLoading();

			} else if (cb) {
				cb(this.isLoading);
			}
		},

		removeLoading: function () {
			this.$element
				.css('height', '')
				.removeClass('pane-loading');

			this.$loading.remove();
			this.$loading = null;
			this.isLoading = false;
		},

		getAnimation: function (dir, out) {
			var bp = this.getBreakpoint(),
				dirCap = dir.charAt(0).toUpperCase() + dir.slice(1),
				suffix =  (out ? 'Out' : 'In'),
				animation;

			// check for breakpoint animations first (i.e mobileForwardsIn)
			animation = this.options[bp + dirCap + suffix];
			// fallback to default animation
			animation = animation || this.options[dir + suffix];

			return animation;
		},

		getManager: function () {
			var container;

			// reuse already assigned manager
			if (this.manager) return this.manager;
			// check for breakpoint container first
			container = this.options[this.getBreakpoint() + 'Container'];
			// fallback to provided container
			container = container || this.options.container;
			// fallback to parent as container
			container = container || this.$element.parent();

			return $(container).panemanager().data('panemanager');
		},

		getBreakpoint: function () {
			var bp = this.options.defaultBreakpoint;

			if (window.matchMedia) {
				for (bp in this.options.breakpoints) {
					var query = this.options.breakpoints[bp];
					if (window.matchMedia(query).matches) return bp;
				}
			}

			return bp;
		},

		destroy: function () {
			var e = $.Event('destroy');
			this.$element.trigger(e);
			if (e.isDefaultPrevented()) return;

			if (!this.$parent || !this.$parent.length){
				this.$element.remove();
				this.$element = null;
				return;
			}

			if (this.$parent !== this.$element.parent()){
				this.$element.appendTo(this.$parent);
			}

			this.$element.off('.pane');
			this.$element.removeData('pane');
		}
	};


	/* PANE PLUGIN DEFINITION
	* ======================= */

	$.fn.pane = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('pane'),
				options = $.extend({}, $.fn.pane.defaults, $this.data(), typeof option == 'object' && option);

			if (!data) $this.data('pane', (data = new Pane(this, options)));
			if (typeof option == 'string') data[option].apply(data, [].concat(args));
			else if (options.show) data.show('forwards');
		});
	};

	$.fn.pane.defaults = {
		show: true,
		keyboard: true,
		loading: false,
		loadingHeight: '200px',
		ajaxSettings: {
			cache: true
		},
		spinner: 
			'<div class="loading-spinner" style="width: 200px; margin-left: -100px;">' +  
				'<div class="progress progress-striped active">' +
					'<div class="bar" style="width: 100%;"></div>' +
				'</div>' +
			'</div>',
		breakpoints: {
			phone: '(max-width: 767px)',
			tablet: '(min-width: 768px) and (max-width: 979px)',
			desktop: '(min-width: 980px)'
		},
		defaultBreakpoint: 'desktop',
		forwardsIn: 'slideInLeft animated',
		forwardsOut: 'slideOutLeft animated',
		backwardsIn: 'slideInRight animated',
		backwardsOut: 'slideOutRight animated'
	};

	$.fn.pane.Constructor = Pane;


	/* PANE DATA-API
	* ============== */

	$(function () {
		$(document).on('click.pane.data-api', '[data-toggle="pane"]', function (e) {
			var $this = $(this),
				href = $this.attr('href'),
				$target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
				option = $target.data('pane') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

			e.preventDefault();

			$target.pane(option);
		});
	});

}(window.jQuery);
