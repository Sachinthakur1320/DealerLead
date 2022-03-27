
// Cross-browser HTML5 placeholder for inputs and textareas by emulating
// WebKit's placeholder functionality. Will use browser's native
// implementation if available.

// USAGE:
// <input type="text" placeholder="username" />
// $('input[placeholder]').placeholder();
// $('input[placeholder]').placeholder({ css: { color: 'red' } })
// $('input').placeholder('username')

(function($){
	var hasPlaceholder = 'placeholder' in document.createElement('input');

	$.fn.placeholder = function(settings) {
		var options;

		if (+settings || typeof settings === 'string'){
			settings = { value: settings };
		}

		options = $.extend({}, $.fn.placeholder.defaults, settings);

		return this.each(function() {
			var $this = $(this),
				initalValue = options.value || $this.attr('placeholder');

			// if browser supports placeholders and element has a placeholder attribute and no value has been passed in, return
			if (hasPlaceholder && $this.attr('placeholder') && !initalValue) {
				return this;
			} else if (hasPlaceholder) {
				$this.attr('placeholder', initalValue);
				return this;
			}

			if (initalValue === undefined || initalValue === null){
				initalValue = '';
			}

			// if elements already exist, update the placeholder value and move on;
			if ($this.data('placeholder')){
				$this.data('placeholder').val(initalValue);
				$this.change();
				return this;
			}

			// configure css for positioning
			options.css.height = (!options.css.height || options.css.height == 0) ? options.css.height : $this.height();
			options.css.width = (!options.css.height || options.css.height == 0) ? options.css.width : $this.width();

			// create container element to anchor placeholder
			var $wrapper = $(options.wrapper).addClass('placeholder-wrapper'),
				$placeholder = $(options.placeholder).addClass('placeholder').css(options.css);

			$this.data('placeholder', $placeholder);

			$this.wrap($wrapper).after($placeholder);

			// transfer focus from placeholder to input
			$placeholder.focus(function(){ $this.focus(); });

			// capture text paste and drag and drop events on placeholder element
			$placeholder.bind('paste drop', function(){
				// save off current placeholder value and empty before applying the pasted text
				var value = $placeholder.val();
				$placeholder.val('');
				setTimeout(function(){
					$this.val($placeholder.val());
					$this.change();
					// reapply placeholder value after pasted text is applied
					$placeholder.val(value);
				}, 0);
			});

			// capture all mouse and keyboard events on input element
			$this.bind('paste drop change cut mouseup keydown', function(){
				setTimeout(function(){
					if ($this.val()){
						$placeholder.hide();
					} else {
						$placeholder.show();
					}
				}, 0);
			});

			// apply value
			$placeholder.val(initalValue);

			// trigger a change event for default behaviour
			$this.change();

		});
	};

	// override defaults for desired behaviour
	$.fn.placeholder.defaults = {
		wrapper: '<span style="position:relative; display:inline-block;"></span>',
		placeholder: '<input tabindex="-1" type="text" />',
		css: {
			'color': '#bababa',
			'background-color': 'transparent',
			'position': 'absolute',
			'left': 0,
			'top': 0,
			'padding': 4,
			'border': 0
		}
	};
})(jQuery);
