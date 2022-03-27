(function($){
	$.fn.tabs = function(options) {
		var options = $.extend({}, $.fn.tabs.defaults, options);
		
		return this.each(function() {
			var $this = $(this);
			
			$this.delegate('.tabs > li > a', 'click', function(e){
				e.preventDefault();
				
				var $tab = $(this),
					tabPaneSel = $tab.attr('href') || $tab.attr('data-target'),
					$parent = $tab.closest('li');

				$this.find('> .tab-content > .tab-pane, > .tabs > li').removeClass('active');
				
				$parent.addClass('active');
				$this.find('> .tab-content > ' + tabPaneSel).addClass('active');
			})
			
		});
	};

	// override defaults for desired behaviour 
	$.fn.tabs.defaults = {
		
	};
})(jQuery);
