!function ($) {

	"use strict"; // jshint ;_;

	/* PANE MANAGER CLASS DEFINITION
	* ====================== */

	var PaneManager = function (element, options) {
		this.init(element, options);
	};

	PaneManager.prototype = {

		constructor: PaneManager,

		init: function (element, options) {
			this.$element = $(element);
			this.options = $.extend({}, $.fn.panemanager.defaults, this.$element.data(), typeof options == 'object' && options);
			this.stack = [];

			if (this.options.defaultPane) {
				this.stack.push(this.createDefaultPane());
			}
		},

		addPane: function (pane) {
			var that = this,
				outPane = that.getCurrentPane();

			this.stack.push(pane);


			this.$element.addClass('pane-transition')
				.css('min-height', this.$element.height());

			if (outPane) {
				// if (this.options.preserveScroll) {
				// 	outPane.scrollTop = $(this.options.preserveScroll)[0].scrollTop;
				// }
				outPane.hide('forwards');
			}

			if (pane.$element.parent()[0] !== this.$element[0]){
				pane.$element.appendTo(this.$element);
			}

			pane.$element.on('shown.panemanager', targetIsSelf(function (e) {
				that.$element
					.removeClass('pane-transition')
					.css('min-height', '');
			}));
		},

		removePane: function (pane) {
			var that = this,
				inPane = that.getPreviousPane(pane);

			// if (this.options.preserveScroll) {
			// 	setTimeout(function () {
			// 		$(that.options.preserveScroll)[0].scrollTop = inPane.scrollTop;
			// 	}, 0);
			// }

			this.$element.addClass('pane-transition')
				.css('min-height', this.$element.height());

			inPane.show('backwards');

			pane.$element.on('hidden.panemanager', targetIsSelf(function (e) {
				that.$element
					.removeClass('pane-transition')
					.css('min-height', '');

				that.stack.splice(that.getIndexOfPane(pane), 1);

				pane.$element.off('.panemanager');
				pane.destroy();

				if (inPane.isDefault) {
					that.destroy();
					// inPane.$element.off('.panemanager');
					// inPane.destroy();
				}
			}));
		},

		getCurrentPane: function () {
			// get most recent pane
			for (var i = this.stack.length - 1; i >= 0; i--) {
				if (this.stack[i].isShown) {
					return this.stack[i];
				}
			}
		},

		getPreviousPane: function (pane) {
			var currentIndex = this.getIndexOfPane(pane);

			for (var i = currentIndex; i >= 0; i--) {
				if (!this.stack[i].isShown) {
					return this.stack[i];
				}
			}
		},

		getPreviousPaneForContainer: function ($container) {
			var currentPane = this.getCurrentPaneForContainer($container),
				currentIndex = this.getIndexOfPane(currentPane);

			for (var i = currentIndex + 1; i >= 0; i--) {
				if (!this.stack[i].isShown && this.stack[i].$container[0] === $container[0]) {
					return this.stack[i];
				}
			}
		},

		getIndexOfPane: function (pane) {
			for (var i = 0; i < this.stack.length; i++) {
				if (this.stack[i] === pane) return i;
			}

			return -1;
		},

		createDefaultPane: function () {
			var pane, 
				wrapperCreated,
				options = {},
				$pane = this.$element.children();

			if ($pane.length > 1 || !$pane.hasClass('pane')) {
				wrapperCreated = true;

				$pane = $('<div class="pane">')
					.append($pane)
					.appendTo(this.$element);

				// set all breakpoints to pane manager
				for (var bp in $.fn.pane.defaults.breakpoints) {
					options[bp + 'Container'] = this.$element;
				}
			}

			options.show = false;

			pane = $pane.pane(options).data('pane');

			pane.isDefault = true;
			pane.isShown = true;
			pane.wrapperCreated = wrapperCreated;
			pane.$parent = this.$element;
			// pane.$container = basePane.$container;

			// manually add pane before the pane were trying to show
			// this.addPane(pane, 0);

			return pane;
		},

		destroy: function () {
			var e = $.Event('destroy');
			this.$element.trigger(e);
			if (e.isDefaultPrevented()) return;

			for (var i = 0; i < this.stack.length; i++) {
				var pane = this.stack[i];
				if (pane.wrapperCreated) {
					pane.$element.children().appendTo(pane.$parent);
					pane.$parent = null;
				}	
				pane.$element.off('.panemanager');
				pane.destroy();
			}

			this.$element.off('.panemanager');
			this.$element.removeData('panemanager');
		}
	};

	
	// make sure the event target is the modal itself in order to prevent
	// other components such as tabs from triggering the modal manager.
	// if Boostsrap namespaced events, this would not be needed.
	function targetIsSelf (callback) {
		return function (e) {
			if (this === e.target){
				return callback.apply(this, arguments);
			}
		}
	}


	/* PANE MANAGER PLUGIN DEFINITION
	* ======================= */

	$.fn.panemanager = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('panemanager');

			if (!data) $this.data('panemanager', (data = new PaneManager(this, option)));
			if (typeof option === 'string') data[option].apply(data, [].concat(args));
		})
	};

	$.fn.panemanager.defaults = {
		preserveScroll: 'body',
		defaultPane: true
	};

	$.fn.panemanager.Constructor = PaneManager

}(jQuery);
