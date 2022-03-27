(function($){
	$.fn.accordion = function(options) {
		var options = $.extend({}, $.fn.accordion.defaults, options);
		
		return this.each(function() {
			var $this = $(this);
			
			var maxHeight = 0;
					
			//save heights
			$this.find('> li > .section').each(function(){
				var $section = $(this),
					$wrapper = $('<div class="section-wrapper" />');
				
				if (options.scrollContent){
					$wrapper.css({ 'overflow': 'auto' });
				}
				
				// REMOVE WHEN FIX FOR INVISIBLE SCROLL BAR IS MADE
				$wrapper.css({ 'overflow': 'hidden' });
				
				
				// make sure element isnt hidden to determine it's height
				$section.css({'position':'absolute','visibility':'hidden','display':'block'});
				var height = $section.outerHeight();
				$section.css({'position':'','visibility':'','display':''});
				
				// if height can't be determined, a parent element may be hidden.
				// fallback to cloning and appending to body in order to detmine the height.
				// caveat: css rules may not be taken into consideration with this method
				if (!height){
					$clone = $section.clone();
					$clone.css({ 'position':'absolute' });
					$clone.appendTo($('body'));
					height = $clone.outerHeight();
					$clone.remove();
				}
				
				$section.data('height', height);
				maxHeight = Math.max(maxHeight, height);		
				
				$section.wrap($wrapper);			
			});

			if (options.fixedHeight && typeof options.fixedHeight === 'boolean'){
				$this.find('> li  > .section-wrapper > .section').each(function(){
					$(this).data('height', maxHeight);
				});				
			} else if (options.fixedHeight){
				$this.find('> li  > .section-wrapper > .section').each(function(){
					$(this).data('height', options.fixedHeight);
				});	
			}
			
			// apply default css rules
			$this.find('> li > .section-wrapper').css({ 'display': 'none', 'height': 0 });
			$this.find('> li.active > .section-wrapper').each(function(){
				$(this).css({ 'display': 'block', 'height': $(this).find('> .section').data('height') });
			});
			$this.find('> li  > .section-wrapper > .section').css({ 'display': 'block' });
			
			var $accordion = $this;
			
			var isAnimating = false;
			$accordion.delegate('li > a', 'click', function(e){
				e.preventDefault();
				
				var $selected = $(this).closest('li'),
					$selectedSection = $selected.find('> .section-wrapper'),
					$unselected = $accordion.find('> li.active'),
					$unselectedSection = $unselected.find('> .section-wrapper');
				
				if ($selected.hasClass('active') || isAnimating) return false;
			
				isAnimating = true;
				
				$unselected.removeClass('active');
				$selected.addClass('active');	
				
				var newHeight = $selectedSection.find('> .section').data('height');
				$selectedSection.show();
				
				var selectedOverflow = 	$selectedSection.css('overflow'),
					unselectedOverflow = $unselectedSection.css('overflow');
					
				$selectedSection.css({ 'overflow': 'hidden' });
				$unselectedSection.css({ 'overflow': 'hidden' });
				
				$('<div>').animate({ height : 1 }, {
					duration  : 300, 
					step      : function(now) {
						var stepSelectedHeight = Math.round(newHeight * now);
						$selectedSection.height(stepSelectedHeight);
						$unselectedSection.height(newHeight - Math.round(newHeight * now));
					},
					complete  : function() {
						// Temporarily taken out until a fix is made to prevent the weird imaginary scroll bar that appears when changing overflow to auto
						//$selectedSection.css({ 'overflow': selectedOverflow });
						//$unselectedSection.css({ 'overflow': unselectedOverflow });
						
						$unselectedSection.css({ 'display': 'none', 'height': 0 });
						isAnimating = false;
					}
				});
			});
			
		});
	};

	// override defaults for desired behaviour 
	$.fn.accordion.defaults = {
		fixedHeight: true,
		scrollContent: true
	};
})(jQuery);
