(function($) {

	var obj = new function() {
		var _content = '<div style="padding:60px 60px 70px;">' +
							'<img style="float:left" src="/webasp/images/oespinner.gif"/>' +
						'</div>';
		var _css = {
			mask: { 'z-index': 500, 'background-color': '#666', 'opacity': 0.5, 'position': 'absolute', 'padding': 0, 'margin': 0 },
			fixedMask: { 'z-index': 500, 'background-color': '#666', 'opacity': 0.5, 'position': 'fixed', 'padding': 0, 'margin': 0, 'top': 0, 'bottom': 0, 'left': 0, 'right': 0 },
			popupDummy: { 'z-index': 501, 'background-color': '#FFF', 'border': '2px solid #111', 'position': 'absolute' },
			popup: { 'margin': 0 },
			popupContainer: { 'z-index': 501, 'background-color': '#fff', 'border': '2px solid #111', 'position': 'absolute', 'top': '-9999px' },
			close: { 'position': 'absolute', 'padding': '2px', 'top': -4, 'right': 3, 'color': '#555', 'font-family': 'comic Sans MS', 'font-weight': 'bold', 'font-size': '14px', 'outline': 'none', 'text-decoration': 'none' }
		};

		this.defaults = {
			animate: true,
			minWidth: 0,
			minHeight: 0,
			offset: { top: 10, left: 0 },
			parent: 'body',
			mask: '',
			popup: '',
			popupDummy: '',
			popupContainer: '',
			href: '',
			clickOff: true,
			allowClose: true,
			fixedMask: false
		}

		var _removeUI = function(animate, config) {
			if (config.mask) {
				config.mask.remove();
				config.mask = null;
				config.popupDummy.remove();
				if (animate) {
					config.popupContainer.css('overflow', 'hidden').find('.close').hide();
					setTimeout(function() {
						config.popup.slideUp('fast',
						function() {
							config.popupContainer.remove();
						});
					}, 0);
				} else {
					config.popup.hide();
					config.popupContainer.remove();
				}
			}
			if (typeof config.onclose === 'function') {
				//Ensure that "this" in the function is really the iframe
				config.onclose.call(config.popup);
			}
		}

		var _loadIFrame = function(config) {
			var loc = config.href;
			var parent = $(config.parent);
			if (!config.mask) {
				if (config.fixedMask) {
					config.mask = $('<div class="ipopup-mask"/>').css(_css.fixedMask);
				}
				else {
					config.mask = $('<div class="ipopup-mask"/>').css(_css.mask);
				}							
				if (config.clickOff) {
					config.mask.click(function() { _removeUI(true, config) });
				}
				config.popupDummy = $('<div />').css(_css.popupDummy);
				config.popup = $('<iframe id="frame" scrolling="no" frameborder="0" />').css(_css.popup);
				config.popupContainer = $('<div class="ipopup"/>').css(_css.popupContainer);
				if (config.allowClose) {
					var closeBtn = $('<a class="close" href="javascript:;">x</a>').css(_css.close)
						.click(function() { _removeUI(true, config) })
						.hover(function() { $(this).css('color', '#333') }, function() { $(this).css('color', '#555') });
					config.popupContainer.append(closeBtn);
				}
				config.popupContainer.append(config.popup);
				parent.append(config.mask).append(config.popupDummy).append(config.popupContainer);
			}

			//If the body is being masked, mask the height/width of the window rather than the body
			//var maskContainer = parent[0].nodeName.toUpperCase() == 'BODY' ? $(window) : parent;

			if (!config.fixedMask) {
				config.mask.height(parent.height()).width(parent.width())
					.css('left', parent.offset().left).css('top', parent.offset().top)
					.show();
			}

			var maskOffset = config.mask.offset();
			config.popupDummy.html(_content)
				.css({ 'top': (maskOffset.top > $(window).scrollTop() ? maskOffset.top : $(window).scrollTop()) + config.offset.top,
					'left': maskOffset.left + ((config.mask.width() - config.popupDummy.width()) / 2)
				});

			config.popup.attr('src', loc);

			config.popup.load(function() {
				//overwrite the default window.close() method to close the iframe instead.
				this.contentWindow.close = function() { $('.close', config.popupContainer).click(); }
				var that = this;
				var innerBody = $(config.popup)[0].contentDocument ? $(config.popup)[0].contentDocument.body : document.frames['frame'].document.body;
				//use inner document body to set height and width of its container
				var newWidth = innerBody.scrollWidth > config.minWidth ? innerBody.scrollWidth : config.minWidth;
				config.popup.css({ 'width': newWidth });
				config.popupDummy.css({ 'height': $(config.popupDummy).height(), 'width': $(config.popupDummy).width() }).html('');

				//if for some reason config.mask was not initiallized or removed, abort
				if (!config.mask) return false;

				config.popupDummy.animate({
					'left': maskOffset.left + ((config.mask.width() - newWidth) / 2),
					width: newWidth
				}, 'fast', function() {
					var newHeight = innerBody.scrollHeight > config.minHeight ? innerBody.scrollHeight : config.minHeight;
					config.popup.css({ 'height': newHeight });

					config.popupDummy.animate({
						height: newHeight
					}, 'fast', function() {
						config.popupContainer.css({ 'top': config.popupDummy.css('top'), 'left': config.popupDummy.css('left') });
						config.popupDummy.remove();

						if (typeof config.onload === 'function') {
							//Ensure that "this" in the function is really the iframe
							config.onload.call(that);
						}
					});
				});
			});
		}

		var _loadDiv = function(config) {
			var element = config.href;
			var parent = $(config.parent);
			var that = this;
			if (!config.mask) {
				if (config.fixedMask) {
					config.mask = $('<div class="ipopup-mask"/>').css(_css.fixedMask);
				}
				else {
					config.mask = $('<div class="ipopup-mask"/>').css(_css.mask);
				}
				
				if (config.clickOff) {
					config.mask.click(function() { _removeUI(true, config) });
				}
				config.popupDummy = $('<div />').css(_css.popupDummy);
				config.popup = $(element).css(_css.popup);
				config.popupContainer = $('<div class="ipopup"/>').css(_css.popupContainer);
				if (config.allowClose) {
					var closeBtn = $('<a class="close" href="javascript:;">x</a>').css(_css.close)
						.click(function() { _removeUI(true, config) })
						.hover(function() { $(this).css('color', '#333') }, function() { $(this).css('color', '#555') });
					config.popupContainer.append(closeBtn);
				}
				config.popupContainer.append(config.popup);
				parent.append(config.mask).append(config.popupDummy).append(config.popupContainer);
			}

			//If the body is being masked, mask the height/width of the window rather than the body
			//var maskContainer = parent[0].nodeName.toUpperCase() == 'BODY' ? $(window) : parent;

			if (!config.fixedMask) {
				config.mask.height(parent.outerHeight()).width(parent.outerWidth())
				.css('left', parent.offset().left).css('top', parent.offset().top)
				.show();
			}
			var maskOffset = config.mask.offset();
			config.popupDummy.html(_content)
				.css({ 'top': (maskOffset.top > $(window).scrollTop() ? maskOffset.top : $(window).scrollTop()) + config.offset.top,
					'left': maskOffset.left + ((config.mask.width() - config.popupDummy.width()) / 2)
				});

			var innerBody = $(config.popup)[0];
			//use inner document body to set height and width of its container
			var newWidth = innerBody.scrollWidth > config.minWidth ? innerBody.scrollWidth : config.minWidth;
			if (innerBody.scrollWidth < config.minWidth)
				config.popup.css({ 'width': newWidth });
			config.popupDummy.css({ 'height': $(config.popupDummy).height(), 'width': $(config.popupDummy).width() }).html('');

			//if for some reason config.mask was not initiallized or removed, abort
			if (!config.mask) return false;

			config.popupDummy.animate({
				'left': maskOffset.left + ((config.mask.width() - newWidth) / 2),
				width: newWidth
			}, 'fast', function() {
				var newHeight = innerBody.scrollHeight > config.minHeight ? innerBody.scrollHeight : config.minHeight;
				if (innerBody.scrollHeight < config.minHeight)
					config.popup.css({ 'height': newHeight });
				config.popupDummy.animate({
					height: newHeight
				}, 'fast', function() {
					config.popupContainer.css({ 'top': config.popupDummy.css('top'), 'left': config.popupDummy.css('left') });
					config.popupDummy.remove();

					if (typeof config.onload === 'function') {
						config.onload.call(that);
					}

				});
			});

			if (typeof closePopup === 'function') {
				closePopup = function() { $('.close', config.popupContainer).click(); }
			}
		}

		var _loadPopup = function(config) {
			if (typeof config.href !== 'string') {
				_loadDiv(config);
			} else {
				_loadIFrame(config);
			}
		}


		this.construct = function(settings) {
			if (this.length && typeof this !== 'function') {
				return this.each(function() {
					var config = $.extend({}, obj.defaults, settings);
					config.href = config.href || $(this).attr('href');
					if (!config.href) return;

					var parent = $(config.parent);
					$(this).click(function(e) {
						var that = this;
						_loadPopup(config);
						e.preventDefault();
						return false;
					});
				})
			} else {
				var config = $.extend({}, obj.defaults, settings);
				_loadPopup(config)
			}
		};
	};

	$.extend({ ipopup: obj.construct });
	$.fn.extend({ ipopup: obj.construct });
})(jQuery);