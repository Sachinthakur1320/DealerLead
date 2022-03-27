(function($) {
	
	var oepopup = new function() {
		var loading = loadingInit = '<div style="position: relative; height: 80px; width: 80px; margin: 0 auto;">' +
					'<img style="position: absolute; left: 50%; top: 50%; margin-left: -12px; margin-top: -12px" src="/webasp/images/oespinner.gif"/>' +
				'</div>';
				
		var loadingUpdate = '<img style="position: absolute; left: 50%; top: 50%; margin-left: -12px; margin-top: -12px" src="/webasp/images/oespinner.gif"/>';
		
		var css = {
			mask: { 'z-index': 500, 'opacity': 0.6, 'position': 'absolute', 'padding':0, 'margin':0, 'top': 0, 'left': 0, 'bottom': 0, 'right': 0 },
			maskFixed: { 'z-index': 500, 'opacity': 0.6, 'position': 'fixed', 'padding':0, 'margin':0, 'top': 0, 'left': 0, 'bottom': 0, 'right': 0 },
			dummy: { 'z-index': 501, 'position': 'absolute', 'top': '-99999px', 'left': '-99999px'},
			content: { 'margin': 0 },
			popup: { 'z-index': 501, 'position': 'absolute' },
			popupFixed: { 'z-index': 501, 'position': 'fixed' }
		};

		this.defaults = {
			animate: true,
			position: 'top',
			minWidth: 0,
			minHeight: 0,
			offset: { top: 25, left: 0 },
			parent: 'body',
			mask: null,
			content: null,
			dummy: null,
			popup: null,
			url: '',
			clickOff: true,
			showClose: true,
			title: '',
			autoOpen: false,
			draggable: false,
			animateMask: true,
			slidwshow: false
		}
		
		var popupContext = (function(){
			var _context;
			return function(c){
				if (c){
					_context = c;
				} else {
					return _context;
				}
			}
		})();
		
		function removePopup(config, keepContent) {
			if (config.mask) {
				config.dummy.remove();
				if (config.animateMask){
					config.mask.fadeOut(250, function(){
						config.mask.remove();
						config.mask = null;	
					});
				} else {
					config.mask.remove();
					config.mask = null;	
				}
				
				if (config.animate) {		
					config.popup.css('overflow', 'hidden').find('.oepopup-close').hide();
					setTimeout(function(){
						if (config.popup){
							config.popup.slideUp('fast',
							function() {
								if (!keepContent){
									config.contentParent.append(config.content);
									config.contentParent = null;
									config.popup.remove();
									config.popup = null;
								}
							});
						}
					}, 0);
				} else {
					if (!keepContent){
						config.contentParent.append(config.content);
						config.contentParent = null;
						config.popup.remove();
						config.popup = null;
					}
				}
			}
			
			if (typeof config.onClose === 'function') {
				//Ensure that "this" in the function is the content
				config.onClose.call(config.content);
			}
		}
		
			
		function createUIForContent(config, content){
			var parent = $(config.parent);
			
			config.dummy = $('<div class="oepopup dummy"><div class="content-container"></div></div>').css(css.dummy);
			config.popup = $('<div class="oepopup"><div class="content-container"></div></div>').hide();
			
			$(config.content).css(css.content);
			
			if (config.showClose){
				var closeBtn = $('<a class="oepopup-close" href="javascript:;">&#215;</a>')
					.click(function() { 
						var config = popupContext(); 
						unloadPopup(config.target, true, false) 
					});
					
				config.popup.append(closeBtn);
			}
			
			if (config.title){
				var title  = $('<div class="title-container" />').append($('<div class="title" />').append(config.title));
				if (config.showClose){
					title.find('.title').css({ 'padding-right': '1.4em' });
				}
				config.dummy.prepend(title.clone());
				config.popup.prepend(title);
				
				if (config.draggable && config.popup.draggable){
					config.popup.draggable({ containment: config.mask, handle: title });
				}
			}
			
			if (config.slideshow){
				var next = $('<a class="oepopup slideshow next" href="javascript:;"><div class="arrow"></div></a>')
					.click(function(){ 
						var config = popupContext();

						config.next.popup = config.popup;
						config.next.mask = config.mask; 
						config.next.dummy = config.dummy; 
						
						if (config.next.url && config.url){
							config.next.content = config.content; 
						}
						updatePopup(config.next) 
						config.popup = config.mask = config.dummy = null;
					});
					
				var prev = $('<a class="oepopup slideshow prev" href="javascript:;"><div class="arrow"></div></a>')
					.click(function(){ 
						var config = popupContext();

						config.prev.popup = config.popup;
						config.prev.mask = config.mask; 
						config.prev.dummy = config.dummy; 
						if (config.prev.url && config.url){
							config.prev.content = config.content; 
						}
						updatePopup(config.prev);
						config.popup = config.mask = config.dummy = null;
					});
				
				if (!config.next) next.hide(); 
				if (!config.prev) prev.hide();
				
				config.popup.append(next).append(prev);
			}
			
			config.dummy.find('.content-container').append(config.content);
			parent.append(config.dummy).append(config.popup);
			
			var maskOffset = config.mask.position();
			
			if (config.location === 'center'){
				config.popup.css({ 
					'top': (maskOffset.top + (config.mask.height() - config.content.height()) / 2) + config.offset.top,
					'left': maskOffset.left + ((config.mask.width() - config.content.width()) / 2) + config.offset.left
				});
			} else {
				config.popup.css({ 
					'top': (maskOffset.top > $(window).scrollTop() ? maskOffset.top : $(window).scrollTop()) + config.offset.top,
					'left': maskOffset.left + ((config.mask.width() - config.content.width()) / 2) + config.offset.left
				});
			}
			
									
			/*if (parent[0].tagName === 'BODY'){
				config.popup.css(css.popupFixed);
				config.popup.css({ top: config.offset.top, left: config.offset.left });
			} else {*/
				config.popup.css(css.popup);
			//}
			
			//config.popup.children().hide();
		}
		
		function loadMask(config){
			var parent = $(config.parent);

			config.mask = $('<div class="oepopup-mask" />').hide();
			
			if (parent[0].tagName === 'BODY'){
				config.mask.css(css.maskFixed);
			} else {
				config.mask.css(css.mask);
			}
			
			parent.append(config.mask);
			
			if (config.clickOff){
				config.mask
					.click(function() { 
						var config = popupContext();
						unloadPopup(config.target, true, false) 
					});
			}
			
			//config.mask.height(parent.height()).width(parent.width())
			//		.css('left', parent.offset().left).css('top', parent.offset().top);
			
			if (config.animateMask){
				config.mask.fadeIn(250);
			} else {
				config.mask.show();
			}

		}
		
		function getSize(element, config, callback){
			var elem = $(element);
			var width = elem[0].scrollWidth > config.minWidth ? elem[0].scrollWidth : config.minWidth;
			elem.width(width);
			
			setTimeout(function(){
				var height = elem[0].scrollHeight > config.minHeight ? elem[0].scrollHeight : config.minHeight;
				if (typeof callback === 'function'){
					callback(width, height);
				}
			}, 0);
		}
		
		function loadIFrame(config){
			var loc = config.url;
			
			if (!config.mask) {
				loadMask(config);
				createUIForContent(config, $('<iframe id="frame" scrolling="no" frameborder="0" />').css(css.content));
			}
			
			config.popup.show();
			config.popup.find('.content-container').html(loading).show();
			config.popup.find('.oepopup-close').hide();
			config.content.attr('src', loc);
			config.content.load(function() {
				var that = this;
				try{
					//overwrite the default window.close() method to close the iframe instead.
					this.contentWindow.close = function(){$('.oepopup-close', config.popup).click();}
					var innerBody = config.content[0].contentDocument ? $(config.content)[0].contentDocument.body : document.frames['frame'].document.body;
				} catch (e) {
					innerBody = config.content;
				} finally {
					config.content.css({ 'width': '', 'height': '' });
					getSize(innerBody, config, function(newWidth, newHeight){
						
						config.content.css({ 'width': newWidth, 'height': newHeight });
						config.popup.css({ 'height': config.popup.height(), 'width': config.popup.width() })
							.find('.content-container').html('');
						
						var left = Math.max(config.mask.offset().left + ((config.mask.width() - newWidth) / 2), 0);
						
						//need to use the iframe to calculate size so we add the size of the title if there is one afterwards
						if (config.title){
							newHeight = newHeight + config.popup.find('.title').outerHeight();
						}
						
						if (config.animate){
							config.popup.animate({
								left: left,
								width: newWidth,
								height: newHeight
							}, 'fast', function() {
								//make sure the load event isnt triggered when moving the iframe
								config.content.unbind('load');
								config.dummy.find('.content-container').children().appendTo(config.popup.find('.content-container'));
								config.popup.find('.content-container, .oepopup-close').show();
								
								if (typeof config.onLoad === 'function') {
									config.onLoad.call(that);
								}
							});
						} else {
							config.dummy.find('.content-container').children().appendTo(config.popup.find('.content-container'));
							config.popup.find('.content-container').show();
							
							if (typeof config.onLoad === 'function') {
								config.onLoad.call(that);
							}
						}
					});
				}
			});
		}
	
		function loadDiv(config){
			var element;
			
			//check if updating content
			var isUpdate = true;
			if (!config.mask) {
				if (!$(config.content).length){
					element = $('<div />').append('<div style="padding: 0.2em 0.4em">' + config.content + '</div>');
				} else {
					element = $('<div />').append(config.content);
				}
				
				loadMask(config);
				createUIForContent(config, element);
				
				isUpdate = false;
			} 
			
			getSize(config.dummy, config, function(newWidth, newHeight){
				config.popup.show();
				var left = Math.max(config.mask.offset().left + ((config.mask.width() - newWidth) / 2), 10);
				if (config.animate){
					var cssObj = { left: left, width: newWidth };
					var animObj = {	height: newHeight };
					
					if (isUpdate){
						cssObj = {};
						animObj = {	left: left, width: newWidth, height: newHeight };
					}
					
					config.popup.css(cssObj)
					config.popup.animate(animObj, 'fast', function() {
						config.popup.find('.content-container').html(config.dummy.find('.content-container').children());
						config.popup.find('.content-container, .oepopup-close').show();
								
						if (typeof config.onLoad === 'function') {
							config.onLoad.call(config.popup);
						}
						
						if (!isUpdate){
							//allows popup to dynanically expand to content
							config.popup.css('height', 'auto');
						}
					});
				} else {
					config.popup.find('.content-container').html(config.dummy.find('.content-container').children());
					config.popup.find('.content-container').show();
					
					if (typeof config.onLoad === 'function') {
						config.onLoad.call(config.content);
					}
				}

			});
		}
		
		function loadPopup(config) {
			if (config.url){
				loadIFrame(config);
			}else{
				loadDiv(config);
			}
			
			loading = loadingInit;
			popupContext(config);
		}
		
		function unloadPopup(elem, animate, keepContent){	
			var config = elem.data('oepopup');
			if (!config) return;
			config.animate = animate === undefined ? config.animate : animate;
			
			removePopup(config, keepContent);
		}
		
		function updatePopup(config){
			config = $.extend({}, oepopup.defaults, config);
			var closeBtn = config.popup.find('.oepopup-close');
			if (config.showClose && !config.popup.find('.oepopup-close').length){
				closeBtn = $('<a class="oepopup-close" href="javascript:;">×</a>')
					.click(function() { var config = popupContext(); unloadPopup(config.target, true, false) })
				config.popup.append(closeBtn);
			}
			
			
			if (config.slideshow){
				var nextBtn = config.popup.find('.next');
				var prevBtn = config.popup.find('.prev');
				
				nextBtn.show();
				prevBtn.show();
				
				if (!config.next) nextBtn.hide(); 
				if (!config.prev) prevBtn.hide();
			}
			
			loading = loadingUpdate;
			
			popupContext(config);
			
			config.dummy.css({ 'width': '', 'height': '' });
			config.dummy.find('.content-container').html(config.content);
			config.popup.find('.content-container').hide();
			loadPopup(config);
		}
		
		var methods = {
			init: function(settings) {
				if (this.length && typeof this !== 'function') {
					var prev;
					return this.each(function() {
						var target = $(this),
							config = $.extend({}, oepopup.defaults, target.data('oepopup'), settings);
						
						config.url = config.url || target.attr('href');
						config.target = target;
						
						if (!config.content && !config.url) return;
						
						//save off previous content parent
						config.content = $(config.content);
						config.contentParent = config.content.parent();
						
						//close popup if open
						if (target.data('oepopup')){
							unloadPopup($(window), false);
						}
						
						target.data('oepopup', config);
						var parent = $(config.parent);
						
						target.bind('click.oepopup', function(e) {
							loadPopup(config);
							e.preventDefault();
						});
						
												
						config.prev = prev;
						if (prev) prev.next = config;
						
						prev = config;
						if (config.autoOpen){
							target.trigger('click');
						}
					})
				} else {
					var target = $(window),
						config = $.extend({}, oepopup.defaults, settings);

					if (!config.content && !config.url) return;
					
					//save off previous content parent
					config.content = $(config.content);
					config.contentParent = config.content.parent();
					
					config.target = target;
					loadPopup(config)
					//if (target.data('oepopup')){
					//	unloadPopup($(window), false);
					//}
					target.data('oepopup', config);
					
					return target;
				}
			},
			update: function(settings){
				if (this.length && typeof this !== 'function') {
					return this.each(function() {
						var target = $(this);
						var config = target.data('oepopup');
						
						if (!config || !config.popup) return;
						
						$.extend(config, settings);

						updatePopup(config);
					});
				} else {
					var target = $(window);
					var config = target.data('oepopup');
					
					//check to see if popup has been removed
					if (!config || !config.popup) return;
					
					$.extend(config, settings);
					
					updatePopup(config);
					
					return target;
				}
			},
			destroy: function(){
				if (this.length && typeof this !== 'function') {
					return this.each(function() {
						var target = $(this);
						unloadPopup(target);
						target.removeData('oepopup');
						target.unbind('.oepopup');
					})
				} else {
					var target = $(window);
					unloadPopup(target);
					target.removeData('oepopup');
					target.unbind('.oepopup');
					return target;
				}
			},
			hide: function(){
				if (this.length && typeof this !== 'function') {
					return this.each(function() {
						var target = $(this);
						unloadPopup(target, true, true);
					})
				} else {
					var target = $(window);
					unloadPopup(target, true, true);
					return target;
				}
			}
		}
		
		this.facade = function(method){
			if ( methods[method] ) {
				return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
			} else if ( typeof method === 'object' || ! method ) {
				return methods.init.apply( this, arguments );
			} else {
				$.error( 'Method ' +  method + ' does not exist on jQuery.oepopup' );
			}    
		}
	};
	
	//global helper classes
	
	//base class to be extended
	oepopup.facade.base = function(){
		this.content = '';
		this.message = '';
		this.title = '';
		this.url = '';
		this.draggable = true;
		this.destroy = function(){ oepopup.facade('destroy'); };
		this.hide = function(){ oepopup.facade('hide'); };
		this.show = function(){	oepopup.facade('init', this); };
		this.updateContent = function(message){	this.content = $(message); oepopup.facade('update', this);	};
	}
	
	oepopup.facade.alertBase = function(){
		this.showClose = false;
		this.clickOff = false;
		this.location = 'center';
		this.offset = { top: 100 };
	}
	oepopup.facade.alertBase.prototype =  new oepopup.facade.base();
	
	//simple dialog
	oepopup.facade.dialog = function(settings){
		this.title = 'Message';
		$.extend(this, settings);
		this.show = function(){
			this.content = $('<div class="message"><span class="text"></span></div>');		
			this.content.find('.text').html(this.message);
			oepopup.facade('init', this);
		}
	}
	oepopup.facade.dialog.prototype =  new oepopup.facade.base();
	
	//alert
	oepopup.facade.alert = function(settings){
		this.title = 'Error';	
		
		$.extend(this, settings);
		this.show = function(callback){
			this.content = $(
				'<div class="content hasActions">' +
					'<div class="message"><span class="text"></span></div>' + 
					'<div class="actions-container">'+ 
						'<div class="actions">' +
							'<button class="oebutton ok">Ok</button>' + 
						'</div>' +
					'</div>' +
				'</div>'
			);
			
			this.content.find('.text').html(this.message);

			this.content.find('button').click(function(){
				if (typeof callback === 'function'){
					callback(true);
				}
				$.oepopup('destroy');
			});
		
			oepopup.facade('init', this);
		}
	};
	oepopup.facade.alert.prototype =  new oepopup.facade.alertBase();
	
	//confirm
	oepopup.facade.confirm = function(settings){
		this.title = 'Confirm';	
		
		$.extend(this, settings);
		this.show = function(callback){
			callback = callback || this.onResponse;
			
			this.content = $(
				'<div class="content hasActions">' +
					'<div class="message"><span class="text"></span></div>' + 
					'<div class="actions-container">'+ 
						'<div class="actions">' +
							'<button class="oebutton yes">Yes</button> ' + 
							'<button class="oebutton no">No</button>' + 
						'</div>' +
					'</div>' +
				'</div>'
			);
			
			this.content.find('.text').html(this.message);
			
			this.content.find('button').click(function(){
				if (typeof callback === 'function'){
					callback($(this).hasClass('yes'));
				}
				$.oepopup('destroy');
			});
		
			oepopup.facade('init', this);
		}
	};
	oepopup.facade.confirm.prototype =  new oepopup.facade.alertBase();
	
	//prompt
	oepopup.facade.prompt = function(settings){
		this.title = 'Prompt';	
		
		$.extend(this, settings);
		this.show = function(callback){
			callback = callback || this.onResponse;
			
			var content = this.content = $(
				'<div class="content hasActions">' +
					'<div class="message"><span class="text"></span><br /><input type="text" class="input" /></div>' + 
					'<div class="actions-container">'+ 
						'<div class="actions">' +
							'<button class="oebutton ok">Ok</button>' + 
						'</div>' +
					'</div>'+
				'</div>'
			);
			
			this.content.find('.text').html(this.message);
			
			var closePrompt = function(){
				if (typeof callback === 'function'){
					callback(content.find('.input').val());
				}
				$.oepopup('destroy');
			}
			
			var input = this.content.find('.input');
			input.keypress(function(e){
				var code = e.which;
				if (code === 13) {
					closePrompt();
				}
			});
			
			this.onLoad = function(){
				//fix for ie focus
				input.focus().blur().focus();
			};
			
			this.content.find('button').click(closePrompt);
		
			oepopup.facade('init', this);
		}
	};
	oepopup.facade.prompt.prototype =  new oepopup.facade.alertBase();
	
	//Block UI
	oepopup.facade.blockUI = function(settings){
		if (!(this instanceof arguments.callee)){
			settings.showOnInit = true;
			return new oepopup.facade.blockUI($.extend(settings));
		}
		
		this.draggable = false;
		this.message = 'Blocked..';
		
		$.extend(this, settings);
		this.show = function(callback){
			this.content = $('<div class="message block"><span class="text">' + this.message + '</span></div>');
			oepopup.facade('init', this);
		}
		
		if (this.showOnInit){
			this.show();
		}
	};
	oepopup.facade.blockUI.prototype =  new oepopup.facade.alertBase();
	
	//Unblock UI
	oepopup.facade.unblockUI = function(){
		oepopup.facade('destroy');
	}
	
	//IFrame
	oepopup.facade.iframe = function(settings){
		this.url = '#';
		$.extend(this, settings);
	}
	oepopup.facade.iframe.prototype =  new oepopup.facade.base();
	
	//AJAX
	oepopup.facade.ajax = function(settings){
		if (!this.title.length)
			this.showClose = false;
		
		$.extend(this, settings);
		this.show = function(callback){
			this.content = $(
				'<div style="position: relative; height: 80px; width: 80px; margin: 0 auto;">' +
					'<img style="position: absolute; left: 50%; top: 50%; margin-left: -12px; margin-top: -12px" src="/webasp/images/oespinner.gif"/>' +
				'</div>'
			);
			
			oepopup.facade(this);
		}
		this.updateContent = function(message){
			if (message){
				this.message = message || this.message;
				this.content = $('<div class="message"><span class="text">' + this.message + '</span></div>');		
			}
			oepopup.facade('update', this);
		}
	}
	
	//Slideshow
	oepopup.facade.slideshow = function(settings){
		this.slideshow = true;
		
		$.extend(this, settings);
		
		var slides = [];
		this.addSlide = function(config){
			config = $.extend({}, this, config);
			
			if (slides.length){
				config.prev = slides[slides.length -1];
				slides[slides.length -1].next = config;
			}
			
			slides.push(config);
		};
		
		this.show = function(callback){
			oepopup.facade('init', slides[0]);
		}
	}
	oepopup.facade.slideshow.prototype =  new oepopup.facade.base();
	
	oepopup.facade.ajax.prototype =  new oepopup.facade.base();
	$.extend({oepopup: oepopup.facade});
	$.fn.extend({oepopup: oepopup.facade});
})(jQuery);