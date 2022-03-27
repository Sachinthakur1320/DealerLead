jQuery(function($) {
    $.extend($.fn, {
		menubutton: function() {
			var openMenu = function(e) {
				e.stopPropagation();e.stopPropagation();
				var $container = $(e.target).closest('.menubutton').addClass('active');
				var $button = $container.find('.menubutton-button');
				var $menu = $container.find('.menubutton-menu');
				var offset = $button.offset();
				var h = ($button.outerHeight) ? $button.outerHeight() : $button.height();
				$menu.css({'top': h, 'left': 0}); //$menu.css({'top': offset.top + h, 'left': offset.left})
				
				$(document).bind('mousedown touchstart', {container: $container, button: $button, menu: $menu, handler: closeMenu}, closeMenu);
			}
			var closeMenu = function(e) {
				var $target = $(e.target).closest('.menubutton');
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
				$(this).find('.menubutton-button').append('<div class="menubutton-dropdown"></div>');
				$(this).bind('click', openMenu);
			});
		}
	});
});