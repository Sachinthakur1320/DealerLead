(function(){
	var libs = {
		'ko': function(){ return !!window.ko },
		'Util': function(){ return !!window.Util },
		'jQuery': function(){ return !!window.jQuery },
		'placeholder': function(){ return !!(window.jQuery && window.jQuery.fn.placeholder) },
		'accordion': function(){ return !!(window.jQuery && window.jQuery.fn.accordion) },
		'tabs': function(){ return !!(window.jQuery && window.jQuery.fn.tabs) },
		'selectBox': function(){ return !!(window.jQuery && window.jQuery.fn.selectBox) },
		'menubutton': function(){ return !!(window.jQuery && window.jQuery.fn.menubutton) },
		'Modernizr': function(){ return !!window.Modernizr },
		'popUpCalendar': function(){ return !!window.popUpCalendar },
		'tooltip': function(){ return !!window.jQuery.fn.tooltip },
		'popover': function(){ return !!window.jQuery.fn.popover }
	};

	if (!libs.ko()) throw new Error("knockout must be included");



	/******************************/
	/***   Knockout Bindings    ***/
	/******************************/

	ko.bindingHandlers['class'] = {
		init: function(){
			if (!libs.jQuery()) throw new Error("jQuery must be included for placeholder binding");
		},
		'update': function(element, valueAccessor) {
			if (element['__ko__previousClassValue__']) {
				$(element).removeClass(element['__ko__previousClassValue__']);
			}
			var value = ko.utils.unwrapObservable(valueAccessor());
			$(element).addClass(value);
			element['__ko__previousClassValue__'] = value;
		}
	};

	// Placeholder binding must appear after the value binding!
	ko.bindingHandlers['placeholder'] = {
		init: function(){
			if (!libs.jQuery()) throw new Error("jQuery must be included for placeholder binding");
			if (!libs.placeholder()) throw new Error("jQuery.placeholder must be included for placeholder binding");
			//if (!libs.Modernizr()) throw new Error("Modernizr must be included for placeholder binding");
		},
		update: function(element, valueAccessor, allBindingsAccessor) {
			ko.bindingHandlers['attr']['update'](element, function() { return { placeholder: valueAccessor() } });

			//if (!Modernizr.input.placeholder){
				$(element).placeholder();
			//}
		}
	};

	ko.bindingHandlers['accordion'] = {
		init: function(){
			if (!libs.jQuery()) throw new Error("jQuery must be included for accordion binding");
			if (!libs.accordion()) throw new Error("jQuery.accordion must be included for accordion binding");
		},
		update: function(element, valueAccessor, allBindingsAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());
			options = typeof options === 'object' ? options : {};

			setTimeout(function(){
				$(element).accordion(options);
			}, 0);
		}
	};

	ko.bindingHandlers['tabs'] = {
		init: function(){
			if (!libs.jQuery()) throw new Error("jQuery must be included for tabs binding");
			if (!libs.tabs()) throw new Error("jQuery.tabs must be included for tabs binding");
		},
		update: function(element, valueAccessor, allBindingsAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());
			options = typeof options === 'object' ? options : {};

			setTimeout(function(){
				$(element).tabs(options);
			}, 0);
		}
	};

	ko.bindingHandlers['menubutton'] = {
		init: function(){
			if (!libs.jQuery()) throw new Error("jQuery must be included for menubutton binding");
			if (!libs.menubutton()) throw new Error("jQuery.menubutton must be included for menubutton binding");
		},
		update: function(element, valueAccessor, allBindingsAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());
			options = typeof options === 'object' ? options : {};

			setTimeout(function(){
				$(element).menubutton(options);
			}, 0);
		}
	};

	ko.bindingHandlers['selectBox'] = {
		init: function(element, valueAccessor, allBindingsAccessor){
			if (!libs.jQuery()) throw new Error("jQuery must be included for selectBox binding");
			if (!libs.selectBox()) throw new Error("jQuery.selectBox must be included for selectBox binding");

			var options = ko.utils.unwrapObservable(valueAccessor());
			options = typeof options === 'object' ? options : {};
			setTimeout(function(){
				$(element).selectBox(options);
			}, 0);
		},
		update: function(element, valueAccessor, allBindingsAccessor) {
			var options = ko.utils.unwrapObservable(allBindingsAccessor().options);
			var value = ko.utils.unwrapObservable(allBindingsAccessor().value);

			setTimeout(function(){
				$(element).selectBox('destroy');
				$(element).selectBox(options);
			}, 0);
		}
	};

	ko.bindingHandlers['selected'] = {
		'init': function (element, valueAccessor, allBindingsAccessor) {
			if (!libs.jQuery()) throw new Error("jQuery must be included for selected binding");

			$(element).click(function(){
				var valueToWrite = $(element).val(),
					value = valueAccessor();

				if (ko.isWriteableObservable(value) && value() !== valueToWrite) {
					value(valueToWrite);
				}
			});
		},
		'update': function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());

			if ($(element).val() == value){
				$(element).addClass('selected');
				$(element).attr('selected', true);
			} else {
				$(element).removeClass('selected');
				$(element).attr('selected', false);
			}
		}
	};

	/* DEPRECATED as the standard with binding works fine with knockout 2.2+*/
	ko.bindingHandlers['withlight'] = {
		'init': function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			return { 'controlsDescendantBindings': true };
		},
		'update': function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var bindingValue = ko.utils.unwrapObservable(valueAccessor());

			if (typeof bindingValue != 'object' || bindingValue === null) return;

			var innerContext = bindingContext['createChildContext'](bindingValue);
			ko.cleanNode(element);
			ko.applyBindingsToDescendants(innerContext, element);
		}
	};


	ko.bindingHandlers['date'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
			if (!libs.jQuery()) throw new Error("jQuery must be included for date binding");
			if (!libs.popUpCalendar()) throw new Error("popupCalendar must be included for date binding");

			var value = valueAccessor();

			$(element).click(function(e){
				if ($(this).attr('disabled')) return;
				var selectedDate = value();
				var dateStorage = {
					month: {value: (selectedDate ? selectedDate.getMonth() + 1 : '')},
					date: {value: (selectedDate ? selectedDate.getDate() : '')},
					year: {value: (selectedDate ? selectedDate.getFullYear() : '')}
				};

				popUpCalendar(element, dateStorage.month, dateStorage.date, dateStorage.year, 'd/mmm/yyyy');

				var baseCloseCalendar = window.closeCalendar;
				var basehideCalendar = window.hideCalendar;

				window.closeCalendar = function () {
					window.hideCalendar = basehideCalendar;
					window.closeCalendar = baseCloseCalendar;
					baseCloseCalendar();
					if (dateStorage.month.value) {
						value(new Date(dateStorage.year.value, (+dateStorage.month.value)-1, dateStorage.date.value));
					} else {
						value(null);
					}
				};

				window.hideCalendar = function () {
					window.hideCalendar = basehideCalendar;
					window.closeCalendar = baseCloseCalendar;
					basehideCalendar();
				};

				return false;
			});

			$(element).delegate('.remove', 'click', function(e){
				value(null);
				e.stopPropagation();
				e.preventDefault();
			});
		}
	};

	ko.bindingHandlers['stopBindings'] = {
		init: function() {
			return { controlsDescendantBindings: true };
		}
	};

	ko.bindingHandlers['async'] = {
		init: function(node, valueAccessor, parsedBindingsAccessor, viewModel, bindingContextInstance) {
			var parsedBindings = valueAccessor();
			function makeValueAccessor(bindingKey) {
				return function () { return parsedBindings[bindingKey] }
			}
			var binding, bindingKey;
			for (bindingKey in parsedBindings) {
				if (!(binding = ko.bindingHandlers[bindingKey])) {
					continue;
				}
				if (!ko.isObservable(parsedBindings[bindingKey])) {
					throw new Error('async binding must be used with observables only');
				}
				ko.dependentObservable((function(bindingKey, binding){
					var isInit = false;
					return function () {
						if (!isInit && typeof binding["init"] == "function") {
							var initResult = binding["init"](node, makeValueAccessor(bindingKey),
								parsedBindingsAccessor, viewModel, bindingContextInstance);
							isInit = true;
						}
						if (typeof binding["update"] == "function") {
							binding["update"](node, makeValueAccessor(bindingKey), parsedBindingsAccessor,
								viewModel, bindingContextInstance);
						}
					}
				})(bindingKey, binding), null, {'disposeWhenNodeIsRemoved': node});
			}
		}
	};

	ko.bindingHandlers['dynamicGrid'] = {
		instance: function (container, settings) {
			var $container = $(container);
			var queries = [];
			var defaults = {
				defaultLayout: 3,
				layoutOptions: {
					xs: 1,
					sm: 2
				},
				breakpoints: {
					xs: '(max-width: 767px)',
					sm: '(min-width: 768px) and (max-width: 991px)',
					md: '(min-width: 992px) and (max-width: 1199px)',
					lg: '(min-width: 1200px)'
				}
			};
			var options = $.extend({}, defaults, settings);
			var currentColCount = options.defaultLayout;

			var self = {};

			self.getItems = function () {
				var items = [];
				var cols = $container.find('.column').toArray();

				if (cols.length) {
					cols = cols.map(function (c) { return $(c).children(); });
					var maxLength = cols
						.map(function (c) { return c.length; })
						.reduce(function (a, b) { return Math.max(a, b); }, 0);

					for (var i = 0; i < maxLength; i++) {
						cols.forEach(function (c) {
							if (c[i]) { items.push(c[i]); }
						});
					}
				} else {
				  items = $container.children().toArray();
				}

				return items;
			};

			self.renderCols = function (colCount, itemsMapper) {
				var items = self.getItems();

				items.forEach(function (i) { $(i).detach(); });
				$container.empty();

				if (itemsMapper) {
					items = itemsMapper(items);
				}

				var cols = [];
				for (var i = 0; i < colCount; i++) {
					var $col = $('<div class="column">')
						.css('width', (100 / colCount) + '%')
						.appendTo($container);

			  		cols.push($col);
				}
				items.forEach(function (item, i) {
					cols[i % colCount].append(item);
				});

				currentColCount = colCount;
			};

			self.render = function () {
				var colCount;
				if (window.matchMedia) {
					for (var bp in options.breakpoints) {
						var query = window.matchMedia(options.breakpoints[bp]);
						if (query.matches) { colCount = options.layoutOptions[bp]; }
					}
				}
				if (typeof colCount === 'undefined') {
					colCount = options.defaultLayout;
				}
				self.renderCols(colCount);
			};

			self.addItem = function (item, index) {
				self.renderCols(currentColCount, function (items) {
					if (typeof index === 'undefined') {
						index = 0;
					} else if (typeof index !== 'number') {
						index =  items.indexOf($(index)[0]) + 1;
					}
					items.splice(index >= 0 ? index : items.length, 0, item);
					return items;
				});
			};

			self.removeItem = function (index) {
				self.renderCols(currentColCount, function (items) {
					if (typeof index === 'undefined') {
						index = 0;
					} else if (typeof index !== 'number') {
						index =  items.indexOf($(index)[0]);
					}
					items.splice(index >= 0 ? index : items.length, 1);
					return items;
				});
			};

			self.watch = function (bp, query) {
				var timeout;
				var queryObj = {};

				queryObj.query = query;
				queryObj.listener = function(mq){
					if (!mq.matches) return;
					if (timeout) clearTimeout(timeout);
						timeout = setTimeout(function () {
						self.renderCols(options.layoutOptions[bp] || options.defaultLayout);
					}, 50);
				};

				queryObj.query.addListener(queryObj.listener);

				queries.push(queryObj);
			};


			self.render();

			if (window.matchMedia) {
				for (var bp in options.breakpoints) {
					var query = window.matchMedia(options.breakpoints[bp]);
					self.watch(bp, query);
				}
			}
			
			// if (typeof currentColCount === 'undefined') {
			// 	currentColCount = options.defaultLayout;
			// }

			return self;
		},
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var allBindings = allBindingsAccessor();
			var $element = $(element);
			var $cleanNode = $element.children().clone();
			var dg = ko.bindingHandlers.dynamicGrid.instance(element, allBindings.dynamicGridOptions);
			var prevArray;

			var makeArrayItemAccessor = function (obj) {
				// var obs = ko.isObservable(obj) ? obj : ko.observable(obj);
				return obj;
			};

			var createNode = function (context, index, added) {
				var newContext = bindingContext.createChildContext(makeArrayItemAccessor(context));
				newContext['$index'] = index;
				newContext['$added'] = added;
				var $node = $cleanNode.clone();
				ko.applyBindings(newContext, $node[0]);
				return $node;
			};

			var subscribable = ko.computed(function () {
				var array = ko.utils.unwrapObservable(valueAccessor());

				if (!prevArray) {
					$element.empty();
					array.forEach(function (context, i) {
						createNode(context, i).appendTo($element);
					});
					dg.render();
				} else {
					var removedItems = 0;
					// figure out if any items have been removed or added
					prevArray.forEach(function (context) {
						if (array.indexOf(context) < 0) {
							removedItems += 1;
							var elementsToRemove = dg.getItems().filter(function (elem) {
								return ko.contextFor(elem).$rawData === context;
							});

							elementsToRemove.forEach(function (elem) {
								dg.removeItem(elem);
							});
						}
					});

					var isNewArray = (prevArray.length === removedItems);
					array.forEach(function (context, i) {
						if (prevArray.indexOf(context) < 0) {
							dg.addItem(createNode(context, i, !isNewArray), i);
						}
					});
				}

				prevArray = array.slice(0);

			}, null, { disposeWhenNodeIsRemoved: element });

			return { 'controlsDescendantBindings': true, subscribable: subscribable };
		}
	};

	ko.bindingHandlers['animate'] = {
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			if (!$.support.animation) { return; }

			var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			if (typeof options === 'string') { options = { name: options }; }

			var animationName = options.name || '';
			var animationDuration = options.duration || 1000;
			var animationFillMode = options.fillMode || 'both';
			var animationTimingFunction = options.timingFunction || '';
			var animationDelay = options.delay || 0;
			var animationIterationCount = options.iterationCount || '';
			var animationDirection = options.direction || '';
			var animationPlayState = options.playState || '';

			var applyCssWithPrefix = function (elem, prop, value) {
				$(elem).css(prop, value);
				$(elem).css('-webkit-' + prop, value);
			};

			applyCssWithPrefix(element, 'animation-name', animationName);
			applyCssWithPrefix(element, 'animation-duration', animationDuration + 'ms');
			applyCssWithPrefix(element, 'animation-fill-mode', animationFillMode);
			applyCssWithPrefix(element, 'animation-timing-function', animationTimingFunction);
			applyCssWithPrefix(element, 'animation-delay', animationDelay + 'ms');
			applyCssWithPrefix(element, 'animation-iteration-count', animationIterationCount);
			applyCssWithPrefix(element, 'animation-direction', animationDirection);
			applyCssWithPrefix(element, 'animation-play-state', animationPlayState);

			$(element).on($.support.animation.end, function () {
				applyCssWithPrefix(element, 'animation', '');
			});
		}
	};

	ko.bindingHandlers['transitionIn'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var toggle = ko.utils.unwrapObservable(valueAccessor());
			$element[toggle ? 'show' : 'hide']();
		},
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var options = valueAccessor();
			if (typeof options !== 'object' || !options) {
				options = { toggle: options };
			}
			var toggle = ko.utils.unwrapObservable(options.toggle);

			$(element).off('.transitionIn');
			if (toggle) {
				$element.show();
				$element[0].offsetWidth;
				$element.addClass('in');
			} else {
				$element.removeClass('in');

				if ($.support.transition && options.transitionOut !== false) {
					$(element).one($.support.transition.end + '.transitionIn', function () {
						$element.hide();
					}).emulateTransitionEnd(350);
				} else {
					$element.hide();
				}
			}
		}
	};

	ko.bindingHandlers['affix'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			$element.affix(options);
		}
	};

	ko.bindingHandlers['navmenu'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			$element.navmenu(options);
		}
	};

	ko.bindingHandlers['image'] = {
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			if (typeof options === 'string') {
				options = { src: options };
			}
			options.size = options.size || 'cover';
			options.position = options.position || 'center'
			options.repeat = options.repeat || 'no-repeat'

			var baseCss = {
				'position': 'absolute',
				'left': 0,
				'top': 0,
				'width': '100%'
			};


			if (Modernizr.backgroundsize) {
				$element.css(baseCss);
				$element.css({
					'width': '100%',
					'height': '100%',
					'background-image': 'url(' + options.src + ')',
					'background-size': options.size,
					'background-position': options.position,
					'background-repeat': options.repeat
				});
			} else {
				var image = $('<img />')
				$element.replaceWith(image);
				$element = image;
				$element.css(baseCss);
				$element.on('load', function () {
					alert('load');
					var ratio =  $element.width() / $element.height();
					var contextWidth = $element.parent().width();
					var contextHeight = $element.parent().height();

					$element.css({ width: contextWidth, height: contextWidth / ratio });

					var elementWidth = $element.width();
					var elementHeight = $element.height();

					// only support cover
					if (elementHeight < contextHeight) {
				  		$element.css({ width: contextHeight * ratio, height: '100%', 'margin-left': -((contextHeight * ratio) - contextWidth)/2, 'margin-top': '' }); 
					} else {
				  		$element.css({ width: '100%', height: contextWidth / ratio, 'margin-left': '', 'margin-top': -((contextWidth / ratio) - contextHeight)/2 });
					}
				});
				
				$element.attr('src', options.src);
			}
		}
	};


	ko.bindingHandlers['select2'] = {
	    init: function (element, valueAccessor, allBindings, viewModel) {
	        var data = ko.utils.unwrapObservable(valueAccessor().data);
	        if (data) {
	            $(element).select2({data: data});
	        } else {
	            $(element).select2({});
	        }
	        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
	            $(element).select2('destroy');
	        });
	    },
	    update: function (element, valueAccessor, allBindings, viewModel) {
	        // need to reinit select2 if options or value has changed to handle valueAllowUnset
	        var data = ko.utils.unwrapObservable(valueAccessor().data);

	    	var value = ko.utils.unwrapObservable(allBindings.get('value'));
	    	var selectedOptions = ko.utils.unwrapObservable(allBindings.get('selectedOptions'));
	    	var options = ko.utils.unwrapObservable(allBindings.get('options'));
	    	if (data) {
	    	    $(element).select2({ data: data });
	    	}
	        $(element).select2('val', value || selectedOptions);
	    }
	};

	ko.bindingHandlers['eventStream'] = {
	    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	       	var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			var rootModel = bindingContext.$root

			rootModel.metadata = rootModel.metadata || {};
			rootModel.metadata.stream = rootModel.metadata.stream || {};

			options.name.split(' ').forEach(function (name) {
				rootModel.metadata.stream[name] = rootModel.metadata.stream[name] || OLI.async.Subject();

				var eventStream = rootModel.metadata.stream[name];
				var handler = function (e) {
					if (options.preventDefault !== false) { e.preventDefault();	}
					if (options.stopPropagation === true) { e.stopPropagation(); }
					var bindingContext = ko.contextFor(e.currentTarget);
					var data = options.data 
					if (typeof data === 'undefined') {
						data = bindingContext['$rawData'] || bindingContext['$data'];
					}
					eventStream.next([data, e]); 
				};

				$element.on(options.event, options.delegate, options.data, handler);

				ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
					$element.off(options.event, options.delegate, handler);
				});
			});
	    }
	};

	// convience event bindings
	['keyup', 'keydown', 'keypress', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'submit', 'change'].forEach(function (event) {
		ko.bindingHandlers[event + 'Stream'] = {
	       	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var newValueAccessor = function () {
	                var options = valueAccessor();
					if (typeof options === 'string') {
						options = { name: options };
					}
	                var result = options;
	                result.event = event;
	                return result;
	            };
	            return ko.bindingHandlers.eventStream.init.call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
	        }
	    };
	});

	ko.bindingHandlers['module'] = {
	    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	       	var $element = $(element);
			var options = valueAccessor();
			var rootModel = bindingContext.$root
			if (typeof options === 'string') {
				options = { name: options };
			}

			rootModel.metadata = rootModel.metadata || {};
			rootModel.metadata.module = rootModel.metadata.module || {};
			rootModel.metadata.module[options.name] = rootModel.metadata.module[options.name] || {};

			var module = rootModel.metadata.module[options.name];
			module.$element = $element;

			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
				rootModel.module[options.name].$element = null;
			});

			return { 'controlsDescendantBindings': true };
	    }
	};

	ko.bindingHandlers['slider'] = {
		init: function(element, valueAccessor, allBinding, viewModel, bindingContext) {
			var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			// var $container = $('<div class="slider-edit-container"></div>');
			// var $toggleEditMode = $('<button type="button" class="btn btn-sm btn-link"><i class="glyphicon glyphicon-pencil"></i></button>');
			// $element.wrap($container);
			$element.slider(options);
			$element.slider('setValue', $element.val());

			var changeTimeout;
			$element.on('slide slideStop', function (e) {
				setTimeout(function () {
					$element.trigger('change');
				}, 0);
			});
			// $toggleEditMode.appendTo($element.closest('.slider-edit-container'));
			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
	            $element.slider('destroy');
	        });
		},
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var $element = $(element);
			var value = ko.utils.unwrapObservable(allBindings.get('value'));
			$element.slider('setValue', value);
	    }
	};

	ko.bindingHandlers['element'] = (function () {
		var namespaces = [];

		var getNamespace = function (namespace) {
			var ns = namespaces.filter(function (n) { return n.namespace === namespace; })[0];
			if (!ns) {
				ns = { namespace: namespace, channels: [] };
				namespaces.push(ns);
			}
			return ns;
		};

		var getChannel = function (namespace, channel) {
			var ns = getNamespace(namespace);
			var c = ns.channels.filter(function (c) { return c.channel === channel; })[0];
			if (!c) {
				c = { channel: channel, subscribers: [], value: undefined };
				ns.channels.push(c);
			}
			return c;
		};

		var on = function (namespace, channel, cb) {
			var c = getChannel(namespace, channel);
			c.subscribers.push(cb);
			if (c.value !== undefined) {
				cb.apply(null, [].concat(c.value));
			}
		};

		var off = function (namespace, channel, cb) {
			if (!channel) {
				// remove entire namepace
				var ns = getNamespace(namespace);
				namespaces = namespaces.filter(function (obj) { return obj !== ns; });
			} else if (!cb) {
				// remove a single channel in a namespace
				var ns = getNamespace(namespace);
				ns.channels = ns.channels.filter(function (c) { return c.channel !== channel; });
			} else {
				// remove a single listener in a channel
				var c = getChannel(namespace, channel);
				c.subscribers = c.subscribers.filter(function (s) { return s !== cb; });
			}
		};

		var notify = function (namespace, channel, value) {
			var c = getChannel(namespace, channel);
			c.value = c.value || $([]);
			c.value = c.value.add(value);
			c.subscribers.forEach(function (cb) {
				cb.apply(null, [].concat(value));
			});
		};

		return {
			getModelElement: function (viewModel, name, cb) {
				var listener = function (element) {
					cb(element);
					off(viewModel, name, listener)
				};
				on(viewModel, name, listener);
			},
			init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		       	var $element = $(element);
				var options = valueAccessor();
				var rootModel = bindingContext.$root
				if (typeof options === 'string') {
					options = { name: options };
				}

				var names = options.name.split(',');
				names.forEach(function (name) {
					// trim
					name = name.replace(/^\s+|\s+$/g, '');
					notify(rootModel, name, $element);

					ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
						off(rootModel, name);
					});
				});
			}
		};
	}());

	ko.bindingHandlers['tooltip'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var rootModel = bindingContext.$root
			var options = valueAccessor();
			var timeoutHandle;
			var observables = {
				title: options.title,
				placement: options.placement,
				container: options.container,
				duration: options.duration,
				hidden: options.hidden
			};

			ko.computed(function () {
				options.title = ko.utils.unwrapObservable(observables.title);
				options.placement = ko.utils.unwrapObservable(observables.placement);
				options.container = ko.utils.unwrapObservable(observables.container);
				options.duration = ko.utils.unwrapObservable(observables.duration);  //only applies when toggle exists
				options.hidden = ko.utils.unwrapObservable(observables.hidden); 						
				options.trigger = options.toggle ? 'manual' : options.trigger;

				if (options.hidden) {
					$element.tooltip('destroy');
					return;
				}

				if (options.container) {
					ko.bindingHandlers.element.getModelElement(rootModel, options.container, function (element) {
						options.container = element;
						$element.tooltip('destroy').tooltip(options);
					});
				} else {
					$element.tooltip('destroy').tooltip(options);
				}
			}, null, {'disposeWhenNodeIsRemoved': element});

			if (options.toggle) {
				options.toggle.subscribe(function (value) {
					if(!value){
						timeoutHandle && clearTimeout(timeoutHandle);
					}
					$element.tooltip(value ? 'show' : 'hide');
					if(value && options.duration){
						timeoutHandle && clearTimeout(timeoutHandle);
		    			timeoutHandle = setTimeout(function(){ $element.tooltip('hide'); }, options.duration);
					}
				});
			}

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				timeoutHandle && clearTimeout(timeoutHandle);
	        });
		}
	};

	ko.bindingHandlers['timedTooltipStream'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var options = valueAccessor();
			var rootModel = bindingContext.$root

			if (typeof options === 'string') {
				options = { name: options };
			}

			rootModel.metadata = rootModel.metadata || {};
			rootModel.metadata.stream = rootModel.metadata.stream || {};
			var stream = rootModel.metadata.stream[options.name] = rootModel.metadata.stream[options.name] || OLI.async.Subject();

			var toggleObservable = ko.observable();
			var newValueAccessor = function () {
				options.toggle = toggleObservable;
				return options;
			};
			
			var subscription = stream
				.doAction(function () { toggleObservable(true); })
				.throttle(options.delay || 2500)
				.doAction(function () { 
					// guard against bindign being destroyed
					if (toggleObservable) {
						toggleObservable(false); 						
					}
				})
				.subscribe();

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				toggleObservable = null;
				subscription.dispose();
			});
			return ko.bindingHandlers.tooltip.init.call(this, element, newValueAccessor, allBindingsAccessor, viewModel, bindingContext);
		}
	};

	ko.bindingHandlers['savedTooltipStream'] = {
		text: 'Saved',
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var options = valueAccessor();
			if (typeof options === 'string') {
				options = { name: options };
			}
			var newValueAccessor = function () {
				options.title = ko.bindingHandlers.savedTooltipStream.text;
				return options;
			};
			return ko.bindingHandlers.timedTooltipStream.init.call(this, element, newValueAccessor, allBindingsAccessor, viewModel, bindingContext);
		}
	};

	ko.bindingHandlers['pane'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			var rootModel = bindingContext.$root
			var count = 0;
			var hasContainerDefined = false;
			
			Object.keys(options).forEach(function (key) {
				if (/(container$)|(activator$)/ig.test(key)) {
					hasContainerDefined = true;
					count += 1;
					ko.bindingHandlers.element.getModelElement(rootModel, options[key], function (element) {
						count -= 1;
						options[key] = element;
						if (!count) {
							$element.data(options);
						}
					});
				}
			});

			if (!hasContainerDefined) {
				$element.data(options);
			}
		}
	};

	ko.bindingHandlers['loading'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var $element = $(element);
			var rootModel = bindingContext.$root
			var options = valueAccessor();
			var showStream;
			var hideStream;
			var subscriptions = [];

			if (typeof options === 'function') {
				options = { toggle: options };
			}

			if (options.toggle) {
				var obsStream = options.toggle.toStream();
				showStream = obsStream.filter(function (x) { return x; });
				hideStream = obsStream.filter(function (x) { return !x; });
			} else {
				showStream = rootModel.metadata.stream[options.showStream] = rootModel.metadata.stream[options.showStream] || OLI.async.Subject();
				hideStream = rootModel.metadata.stream[options.hideStream] = rootModel.metadata.stream[options.hideStream] || OLI.async.Subject();
			}
			
			subscriptions.push(showStream.subscribe(function () { $element.loading(); }));
			subscriptions.push(hideStream.subscribe(function () { $element.loading('hide'); }));

			options.show = false;
			$element.loading(options);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				subscriptions.forEach(function (s) {
					s.dispose();
				});
			});
		}
	};

	ko.virtualElements.allowedBindings.paginate = true;
	ko.bindingHandlers['paginate'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var paginate = {};

			var options = valueAccessor();
			
			options.items = ko.isSubscribable(options.items) ? options.items : ko.observableArray(options.items);
			options.itemsPerPage = ko.isSubscribable(options.itemsPerPage) ? options.itemsPerPage : ko.observable(options.itemsPerPage || 10);

			paginate.page = ko.observable(0);

			paginate.totalPages = ko.computed(function () {
				return Math.ceil(options.items().length / options.itemsPerPage());
			});

			paginate.items = ko.computed(function () {
				var index = paginate.page() * options.itemsPerPage();
				return options.items().slice(index, index + options.itemsPerPage());
			});

			paginate.hasPages = ko.computed(function () {
				return paginate.totalPages() > 1;
			});

			paginate.hasNextPage = ko.computed(function () {
				return ((paginate.page() * options.itemsPerPage()) + options.itemsPerPage()) < options.items().length;
			});

			paginate.hasPreviousPage = ko.computed(function () {
				return paginate.page() > 0;
			});

			paginate.nextPage = function () {
				if (paginate.hasNextPage()) {
					paginate.page(paginate.page() + 1);
				}
			};

			paginate.previousPage = function () {
				if (paginate.hasPreviousPage()) {
					paginate.page(paginate.page() - 1);
				}
			};

			var innerBindingContext = bindingContext.extend({ '$paginate': paginate });
	        ko.applyBindingsToDescendants(innerBindingContext, element);
	 
	        return { controlsDescendantBindings: true };
		}
	};


	ko.bindingHandlers['datepicker'] = {
	    init: function(element, valueAccessor, allBindings, viewModel) {
	    	var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());

	    	if (Object.prototype.hasOwnProperty.call(document.documentElement, 'ontouchstart')) {
				$element.prop('readonly', true);
			}

			$element.datepicker(options);
	    }
	};

	ko.bindingHandlers['timepicker'] = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    	var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());

			$element.timepicker(options);
	    }
	};

	ko.bindingHandlers['searchfield'] = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    	var $element = $(element);
	    	var rootModel = bindingContext.$root
			var options = ko.utils.unwrapObservable(valueAccessor());
			options.advancedOptions = ko.utils.unwrapObservable(options.advancedOptions);

			rootModel.metadata = rootModel.metadata || {};
			rootModel.metadata.stream = rootModel.metadata.stream || {};
			var searchStream = rootModel.metadata.stream[options.searchStream] = rootModel.metadata.stream[options.searchStream] || OLI.async.Subject();
			var processStream = rootModel.metadata.stream[options.processStream] = rootModel.metadata.stream[options.processStream] || OLI.async.Subject();
			var triggerSearchStream = rootModel.metadata.stream[options.triggerSearchStream] = rootModel.metadata.stream[options.triggerSearchStream] || OLI.async.Subject();

			options.fetchData = function (query) {
				searchStream.next(query);
			};

			var subscriptions = [];

			subscriptions.push(
			 	processStream.subscribe(function (results) {
					$element.searchfield('process', results);
				})
			);

			subscriptions.push(
			 	triggerSearchStream.subscribe(function (params) {
					$element.searchfield('syncInput', params);
					$element.searchfield('search', true, params);
				})
			);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				subscriptions.forEach(function (s) {
					s.dispose();
				});
			});

			$element.searchfield(options);
	    },
	    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    	var $element = $(element);
	    	var options = ko.utils.unwrapObservable(valueAccessor());
	    	options.advancedOptions = ko.utils.unwrapObservable(options.advancedOptions);
	    	var searchfield = $element.data('searchfield');
	    	searchfield.options.advancedOptions = options.advancedOptions;
	    	searchfield.renderAdvancedOptions();
	    }
	};

	ko.bindingHandlers['button'] = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    	var $element = $(element);
	    	var rootModel = bindingContext.$root
			var options = ko.utils.unwrapObservable(valueAccessor());

			rootModel.metadata = rootModel.metadata || {};
			rootModel.metadata.stream = rootModel.metadata.stream || {};
			var waitingStream = rootModel.metadata.stream[options.waitingStream] = rootModel.metadata.stream[options.waitingStream] || OLI.async.Subject();
			var doneStream = rootModel.metadata.stream[options.doneStream] = rootModel.metadata.stream[options.doneStream] || OLI.async.Subject();

			var subscriptions = [];

			var $waiting = $element.find('.btn-waiting-text');
			var $done = $element.find('.btn-done-text');
			var _waitingDisplay = $waiting.css('display');
			var _doneDisplay = $done.css('display');

			$waiting.css('display', 'none');
			$done.css('display', 'none');

			subscriptions.push(
			 	waitingStream.subscribe(function () {
			 		$waiting.css('display', _waitingDisplay);
			 		$element.addClass('btn-is-waiting');
					$element.prop('disabled', true);
				})
			);

			subscriptions.push(
			 	doneStream
			 		.doAction(function () {
			 			$waiting.css('display', 'none');
			 			$done.css('display', _doneDisplay);
			 			$element.removeClass('btn-is-waiting');
				 		$element.addClass('btn-is-done');
						$element.prop('disabled', false);
			 		})
			 		.delay(1000)
				 	.subscribe(function (error) {
				 		$done.css('display', 'none');
				 		$element.removeClass('btn-is-done');
					})
			);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				subscriptions.forEach(function (s) {
					s.dispose();
				});
			});
	    }
	};

	ko.bindingHandlers['appearStream'] = {
		isElementInView: function (element) {
			var bounds = element.getBoundingClientRect();
			var vBuffer = $(element).height() * 2;
			var hBuffer = $(element).width() * 2;
			return (
				(bounds.height > 0 || bounds.width > 0) &&
				bounds.top >= (0 - vBuffer) && 
				bounds.left >= (0 - hBuffer) && 
				bounds.bottom <= ($(window).height() + vBuffer) &&
				bounds.right <= ($(window).width() + hBuffer)
			);
		},
	    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	       	var $element = $(element);
			var options = ko.utils.unwrapObservable(valueAccessor());
			var rootModel = bindingContext.$root
			var isElementInView = ko.bindingHandlers.appearStream.isElementInView;
			var events = 'scroll resize orientationchange';

			if (typeof options === 'string') {
				options = { name: options };
			}

			rootModel.metadata = rootModel.metadata || {};
			rootModel.metadata.stream = rootModel.metadata.stream || {};
			var inViewStream = rootModel.metadata.stream[options.name] = rootModel.metadata.stream[options.name] || OLI.async.Subject();
			var evaluateStream = rootModel.metadata.stream[options.evaluateStream] = rootModel.metadata.stream[options.evaluateStream] || OLI.async.Subject();
			var sendDataSubject = OLI.async.Subject();

			var subscriptions = [];

			// throttle to avoid triggering inView more the once in a short amount of time
			// can happen if evaluateStream and init are called at the same time
			subscriptions.push(
				sendDataSubject.throttle(10).subscribe(inViewStream.next)
			);

			var checkInView = function () {
				if (isElementInView(element)) {
					var data = options.data 
					if (typeof data === 'undefined') {
						data = bindingContext['$rawData'] || bindingContext['$data'];
					}
					sendDataSubject.next([data]); 
					teardown();
				}
			};

			var debounceTimeout;
			var handler = function () {
				if (debounceTimeout) { clearTimeout(debounceTimeout); }
				debounceTimeout = setTimeout(checkInView, options.scrollThrottle || 50);
			};

			var teardown = function () {
				$(window).off(events, handler);
			};

			var init = function () {
				teardown();
		 		$(window).on(events, handler);
				setTimeout(checkInView, 0);
			};

			init();

			subscriptions.push(evaluateStream.subscribe(init));

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				teardown();
				subscriptions.forEach(function (s) {
					s.dispose();
				});
			});
	    }
	}

	ko.bindingHandlers['typeahead'] = {
	    init: function (element, valueAccessor, allBindingAccessor) {
	        var options = ko.unwrap(valueAccessor()) || {};
	        var $el = $(element);

	        var triggerChange = function () {
	            $el.change();
	        };

	        options.local = options.local || {};

	        $el.typeahead(options)
                .on("typeahead:autocompleted.typeahead", triggerChange)
                .on("typeahead:selected.typeahead blur.typeahead", triggerChange);

	        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
	            $el.off('.typeahead');
	            $el.typeahead("destroy");
	            $el.remove();
	        });
	    },
	    update: function (element, valueAccessor) {
	        var options = ko.unwrap(valueAccessor()) || {};
	        var $el = $(element);

	        var triggerChange = function () {
	            $el.change();
	        };

	        options.local = options.local || {};

	        $el.off('.typeahead');
	        $el.typeahead("destroy");
	        $el.typeahead(options)
                .on("typeahead:autocompleted.typeahead", triggerChange)
                .on("typeahead:selected.typeahead blur.typeahead", triggerChange);
	    }
	};

	ko.bindingHandlers['tagsManager'] = {
	    init: function (element, valueAccessor, allBindingAccessor) {
	        var options = allBindingAccessor().tagsManagerOptions || {};
	        var $el = $(element);
	        var observableArray = valueAccessor();
	        var allowUpdate = true;
	        var tagsListDelimiter = options.delimiters && options.delimiters[0] ? options.delimiters[0] : ',';

	        if (allBindingAccessor().typeahead && $el.parent().hasClass('twitter-typeahead')) {
	            options.tagsContainer = jQuery('<div>').insertBefore($el.parent()).addClass("tags");
	        } else {
	            options.tagsContainer = jQuery('<div>').insertBefore($el).addClass("tags");
	        }
	        options.output = jQuery('<input />');

	        $el.tagsManager(options);

	        $el.on('change.tagsManager', function () {
	            $el.tagsManager('pushTag', $(this).val());
	        });

	        $el.on('tm:refresh.tagsManager', function (e, tagsList) {
	            if (allowUpdate) {
	                allowUpdate = false;
	                observableArray(tagsList.split(tagsListDelimiter)
                        .filter(function (x) { return x; }));
	                allowUpdate = true;
	            }
	        });

	        var toDispose = observableArray.subscribe(function () {
	            if (allowUpdate) {
	                allowUpdate = false;
	                $el.tagsManager("empty");
	                observableArray().forEach(function (x) {
	                    $el.tagsManager('pushTag', x);
	                });
	                allowUpdate = true;
	            }
	        });

	        observableArray.notifySubscribers();

	        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
	            $el.off('.tagsManager');
	            options.tagsContainer.remove();
	            options.output.remove();
	            toDispose.dispose();
	        });
	    }
	};
	
	/******************************/
	/***   Knockout Extenders   ***/
	/******************************/

	ko.extenders.format = function(target, type){
		if (!libs.Util()) throw new Error("Util must be included for format extenders");

		var computed = {};
		computed.read = function() { return Util.format[type](target()) };

		if (Util.unformat[type] && ko.isWriteableObservable(target)){
			computed.write = function(value) {
				target(Util.unformat[type](value));
				// make sure ui is synced with computed
				result.notifySubscribers();
			}
		}

		var result = ko.computed(computed);

		if (Util.unformat[type] && ko.isWriteableObservable(target)){
			result(target());
			// target.valueHasMutated();
		}

		target.formatted = result;

		return target;
	};

	ko.extenders.validate = function(target, settings){
		var options = {
			validator: function(){ },
			evalImmediately: false,
			async: false,
			message: 'invalid'
		}

		if (typeof settings === 'function'){
			options.validator = settings;
		} else if (typeof settings === 'object'){
			$.extend(options, settings);
		} else if (settings === 'manual'){
			//do nothing
		} else {
			throw new Error("invalid parameters for validate extender");
		}

		if (typeof options.validator !== 'function') throw new Error("validator must be a function");

		target.validators = target.validators || [];
		var validatorId = target.validators.length;
		target.validators.push(options);

		target.isValid = target.isValid || ko.observable();
		target.message = target.message || ko.observable(options.message);

		var validate = (function(){
			var firstEvaluation = true;

			var setIsValid = function(isValid){
				if (options.evalImmediately || !firstEvaluation){
					target.isValid(isValid);
				}
			}

			var applyValidation = function(){
				//update observable is only when all validators have run
				if (validatorId == target.validators.length - 1){
					var passedValidation = true;
					for (var i = 0; i < target.validators.length; i++){
						if (!target.validators[i].isValid){
							passedValidation = false;
							setIsValid(false);
							target.message(target.validators[i].message);
						}
					}
					if (passedValidation){
						setIsValid(true);
					}
				}
			}

			return function(){
				var value = target();

				if (options.async){
					options.validator.call(this, value, function(isValid){
						target.validators[validatorId].isValid = isValid;
						applyValidation();
					});
				} else {
					target.validators[validatorId].isValid = !!options.validator.call(this, value);
					applyValidation();
				}

				firstEvaluation = false;
			}
		})();

		if (settings !== 'manual'){
			if (options.evalImmediately){
				ko.computed({ read: validate });
			} else {
				setTimeout(function(){
					ko.computed({ read: validate });
				}, 0);
			}
		}

		return target;
	};

	//Validation helpers

	var utils = {
		isEmptyVal: function (val) {
			if (val === undefined) {
				return true;
			}
			if (val === null) {
				return true;
			}
			if (val === "") {
				return true;
			}
		}
	};

	ko.extenders.required = function (target, required) {
		return ko.extenders.validate(target, {
			validator: function(val){
				var stringTrimRegEx = /^\s+|\s+$/g,
					testVal;

				if (val === undefined || val === null) {
					return !required;
				}

				testVal = val;
				if (typeof (val) == "string") {
					testVal = val.replace(stringTrimRegEx, '');
				}

				return required && (testVal + '').length > 0;
			},
			message: 'Required'
		});
	};

	ko.extenders.positive = function (target, positive) {
	    var result = ko.computed({
	        read: target,
	        write: function (newValue) {
	            var current = target();
	            if (newValue < 0 === !!positive) {
	                if (current === 0) {
	                    target.notifySubscribers(0);
	                } else {
	                    target(0);
	                }
	            } else {
	                target(newValue);
	            }
	        }
	    }).extend({ notify: 'always' });

	    result(target());

	    return result;
	};

	ko.extenders.minimum = function (target, value) {
	    var result = ko.computed({
	        read: target,
	        write: function (newValue) {
	            var current = target();
	            if (newValue <= value) {
	                if (current === value) {
	                    target.notifySubscribers(value);
	                } else {
	                    target(value);
	                }
	            } else {
	                target(newValue);
	            }
	        }
	    }).extend({ notify: 'always' });

	    result(target());

	    return result;
	};

	ko.extenders.numeric = function (target, precision) {
	    var result = ko.computed({
	        read: target,
	        write: function (newValue) {
	            var current = target(),
                    roundingMultiplier = Math.pow(10, precision),
                    newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                    valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

	            if (valueToWrite !== current) {
	                target(valueToWrite);
	            } else {
	                if (newValue !== current) {
	                    target.notifySubscribers(valueToWrite);
	                }
	            }
	        }
	    }).extend({ notify: 'always' });

	    result(target());

	    return result;
	};

	ko.extenders.number = function (target, validate) {
		return ko.extenders.validate(target, {
			validator: function(val){
				 return utils.isEmptyVal(val) || (validate && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(val));
			},
			message: 'Invalid Number'
		});
	};

	ko.extenders.email = function (target, validate) {
		return ko.extenders.validate(target, {
			validator: function(val){
				return utils.isEmptyVal(val) || (
					validate && /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(val)
				);
			},
			message: 'Invalid Email'
		});
	};
	
	ko.extenders.reset = function (target) {
		var initialValue = target();
		target.reset = function() {
			target(initialValue);
		};
		return target;
	};


	ko.extenders.dirty = function (target, dirtyObs) {
		dirtyObs = dirtyObs || ko.observable(false);
		
		var _initialValue = target();
		target.isDirty = dirtyObs;

		target.subscribe(function (value) {
			dirtyObs(value !== _initialValue);
		});

		return target;
	};


	/******************************/
	/***    Custom Functions    ***/
	/******************************/

	ko.subscribable.fn.validate = function (options) {
		var self = this;

		if (typeof options === 'function') {
			options = { validator: options };
		}

		// handle compounding validations
		var old = self.isValid || function () { return true; };

		self.isValid = ko.computed(function () {
			return old() && !!options.validator(ko.utils.unwrapObservable(self));
		});

		return self;
	};


	ko.subscribable.fn.toggle = function () {
		this(!this());
	};

	/******************************/
	/***   Library Extensions   ***/
	/******************************/

	ko.parentFor = function(node) {
		var context = ko.contextFor(node);
		return context ? context['$parent'] : undefined;
	};

	ko.rootFor = function(node) {
		var context = ko.contextFor(node);
		return context ? context['$root'] : undefined;
	};

	ko.dirtyFlag = function (root, isInitiallyDirty) {
		var result = function () {};
		var initialState = ko.observable(ko.toJSON(root));
		isInitiallyDirty = ko.observable(isInitiallyDirty);
		result.isDirty = ko.dependentObservable(function () {
			return isInitiallyDirty() || initialState() !== ko.toJSON(root);
		});
		result.reset = function () {
			initialState(ko.toJSON(root));
			isInitiallyDirty(false);
		};
		return result;
	};
}());