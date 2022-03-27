jQuery(function($) {
    $.extend($.fn, {
		splitbutton: function() {
			var openMenu = function(e) {
				var $container = $(e.target).closest('.splitbutton');
				var $button = $container.find('.splitbutton-button');
				var $menu = $container.find('.splitbutton-menu');
				var $dropdown = $container.find('.splitbutton-dropdown');
				var offset = $button.offset();
				var h = ($button.outerHeight) ? $button.outerHeight() : $button.height();

				if ($(e.target).closest('.splitbutton-dropdown')[0] == $dropdown[0]) {
					$container.addClass('active');
					e.stopPropagation();e.stopPropagation();
					$menu.css({'top': h, 'left': 0}); //$menu.css({'top': offset.top + h, 'left': offset.left})
				
					$(document).bind('mousedown touchstart', {container: $container, button: $button, menu: $menu, handler: closeMenu}, closeMenu);
				}
			}
			var closeMenu = function(e) {
				var $target = $(e.target).closest('.splitbutton');
				var $oldContainer = e.data.container;
				var $oldMenu = e.data.menu;
				
				if ($target[0] !== $oldContainer[0]) {
					var $oldButton = e.data.button;
					var $oldMenu = e.data.menu;
					var handler = e.data.handler;
					
					$(document).unbind('mousedown touchstart', handler);
					$oldContainer.removeClass('active');
					$oldMenu.css({'top': '', 'left': ''})
				}
			}
			
			$(this).each( function() {
				$(this).find('.splitbutton-button').after('<div class="oebutton splitbutton-dropdown"><div></div>');
				$(this).bind('click', openMenu);
			});
		}
	});
});