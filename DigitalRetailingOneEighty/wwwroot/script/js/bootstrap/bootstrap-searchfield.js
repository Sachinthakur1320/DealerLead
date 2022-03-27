
!function ($) {

	"use strict"; // jshint ;_;

	var SearchField = function (element, options) {
		this.init(element, options);
	}

	// expose to global scope
	window.SearchField = SearchField;

	/* SEARCHFIELD CLASS DEFINITION
	* =========================== */

	SearchField.prototype = {

		constructor: SearchField,

		init: function(element, options){
			var $element = this.$element = $(element);
			this.options = $.extend(true, {}, $.fn.searchfield.defaults, $element.data(), options);

			var that = this;
			if (this.options.datagrid){
				if (this.options.datagrid instanceof DataGrid) {
					this.datagrid = this.options.datagrid;
					this.options.schema = this.datagrid.options.schema;
					this.options.data = this.datagrid.options.data;
					this.options.executeClientSearch = function(){ that.datagrid.filterData.apply(that.datagrid, arguments) };
				} else if ($(this.options.datagrid).data('datagrid') instanceof DataGrid){
					this.datagrid = $(this.options.datagrid).data('datagrid');
					this.options.schema = this.datagrid.options.schema;
					this.options.data = this.datagrid.options.data;
					this.options.executeClientSearch = function(){ that.datagrid.filterData.apply(that.datagrid, arguments) };
				} else {
					throw new Error('SearchField: provided datagrid is not of type DataGrid');
				}
			}

			this.searchParams = [];
			this.serverParams = [];

			var $searchField = this.$searchField = $(supplant(this.options.template, $.fn.searchfield.i18n[this.options.i18n]));
			$element.replaceWith($searchField);
			$element.appendTo($searchField.find('.input-holder'));

			if (this.options.placeholder){
				$element.attr('placeholder', this.options.placeholder);
			}

			if (this.options.showAdvancedSearch){
				var $advanced = this.$advanced = $searchField.find('.advanced');
				$advanced.show();

				$advanced.delegate('.value input', 'keydown.searchfield', function(e){
					if (e.which == 13){
						e.preventDefault();
						that.addNewKey();
					}
				});

				$advanced.delegate('.type', 'change.searchfield', function(e){
					var $target = $(this),
						$key = $target.closest('.key'),
						$value = $key.find('.value');

					var value;
					if ($value.find('.between').length){
						value = $value.find('.start').val() + '..' + $value.find('.end').val();
					} else {
						value = $value.find('input').val();
					}
					$key.find('.value').html(that.generateValueInput(value, $target.val()));
				});

				// fix to stop dropdown dismiss when inside is clicked
				var $clickable = $advanced.find('.dropdown-content');

				$clickable.delegate('.remove', 'click.searchfield', function(e){
					var $target = $(this),
						$key = $target.closest('.key');

					$key.remove();
					if ($key.hasClass('newKey')){
						that.addNewKey();
					}
				});

				$clickable.delegate('.search', 'click.searchfield', function(e){
					e.preventDefault();
					that.buildSearchAndApply();
					$advanced.click(); //dismiss popup
				});

				$clickable.click(function(e){
					e.stopPropagation();
				});
			}

			// events

			$searchField.bind('submit.searchfield', function(e){
				e.preventDefault();
				return false;
			});

			$searchField.delegate('.input-holder input', 'keydown.searchfield', function(e){
				if (e.which == 13){
					e.preventDefault();
					that.search();
				}
			});

			if (this.options.searchOnBlur){
				$searchField.delegate('.input-holder input', 'blur.searchfield', function(){
					if ($.trim($(this).val())){
						that.search();
					}
				});
			}

			$searchField.delegate('.input-append .search', 'click.searchfield', function(e){
				e.preventDefault();
				that.search(true);
			});

			$searchField.delegate('.advanced', 'click.searchfield', function(e){
				e.preventDefault();
				that.renderAdvanced();
			});

			$searchField.find('.hidden-absolute').on('keydown', function(e){
				e.stopPropagation();
				if (that.$element.is(':visible')){
					that.$element.focus();
				}
			});

			if (this.options.consumeDocumentKeypress){
				$(document).on('keydown',function(e){
					var element = document.activeElement;
					if((element && element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea' && element.contentEditable !== 'true'
						&& !$('body').hasClass('modal-open')))
					{
						if (typeof e.which == "number" && e.which > 0 && !e.ctrlKey && !e.metaKey && !e.altKey){
							if (that.$element.is(':visible')){
								that.$element.focus();
							}
						}
					}
				});
			}

			// publish events
			$element.triggerHandler('initialized');
		},

		buildSearchAndApply: function(){
			var $createSearch = this.$advanced.find('.create-search'),
				$advancedOptions = this.$advanced.find('.advanced-options'),
				advancedOptions = this.options.advancedOptions,
				searchParams = this.options.searchParams;

			var that = this;

			searchParams = [];
			$createSearch.find('.key').each(function(){
				var $target = $(this),
					field = $target.find('.field').val() || '',
					type = $target.find('.type').val() || '',
					value = $target.find('.value input')
								.map(function(){ return $(this).val() })
								.toArray().join('..') || '';

				if (type === 'exists') value = '';
				if (value || field || type !== 'contains'){
					searchParams.push({ field: field, type: type, value: value});
				}
			});
			this.syncInput(searchParams);
			this.search(true, searchParams);
		},

		addNewKey: function(){
			var $createSearch = this.$advanced.find('.create-search'),
				hasEmptyInput = false;

			$createSearch.find('input').each(function(){
				if (!$.trim($(this).val())){
					hasEmptyInput = true;
					$(this).focus();
				}
			});
			if (!hasEmptyInput){
				//$createSearch.find('.newKey .remove').removeClass('disabled');
				$createSearch.append(this.generateKey());
				$createSearch.find('.newKey select').trigger('change');
				setTimeout(function(){
					$createSearch.find('.newKey input').focus();
				}, 0);
			}
		},

		getHeader: function(index){
			var field, mapping = this.options.mapping;
			if (mapping[index]){
				field = mapping[index];
			} else {
				field = this.getKeyFromSchema(index) || {};
			}

			return unwrapFunction.call(this, field.header, index) || index;
		},

		generateFieldSelect: function(selected){
			var r = [], schema = this.options.schema;

			r.push('<select class="field">');
			r.push('<option value="">' + $.fn.searchfield.i18n[this.options.i18n].anyCategory + '</option>');

			var newList = JsLinq(schema).groupBy(function(o){return o.grouping || 'xxx'}).orderBy(function(a,b){return a.key =='xxx'?-1:0}).select(function(o){return o.toArray()}).toArray();
			for (var j=0; j<newList.length; j++){
				if (newList[j][0].grouping){ r.push('<optgroup label="--------"></optgroup>'); }
				schema = newList[j];
				for (var i = 0; i < schema.length; i++){
					if (schema[i].index){
						r.push('<option value="' + schema[i].index + '"');
						if (schema[i].index == selected){
							r.push(' selected="selected"');
						}
						r.push('>');
						r.push(this.getHeader(schema[i].index));
						r.push('</option>');
					}
				}
			}
			r.push('</select> ');

			return r.join('');
		},

		generateTypeSelect: function(selected){
			var r = [], searchTypes = this.options.searchTypes;
			
			r.push('<select class="type">');
			for (var type in searchTypes){
				if (searchTypes[type]) {
					r.push('<option value="' + type + '"');
					if (type == selected){
						r.push(' selected="selected"');
					}
					r.push('>');
					r.push($.fn.searchfield.i18n[this.options.i18n][type]);
					r.push('</option>');
				}
			}
			r.push('</select> ');

			return r.join('');
		},

		generateValueInput: function(value, type){
			var r = [];

			r.push('<span class="value">');
			var between = (value || '').split('..');

			if (type === 'between' || type === 'notBetween'){
				r.push('<input class="between start" type="text" value="' + (between[0] || '') + '" /><span class="syntax">..</span>');
				r.push('<input class="between end" type="text" value="' + (between[1] || '') + '" />');
			} else if (type === 'exists' || type === 'notExists'){
				r.push('<input type="text" value="" class="disabled" disabled="disabled"/>');
			} else {
				r.push('<input type="text" value="' +  (between[0] || '') + '" />');
			}
			r.push('</span>');

			return r.join('');
		},

		generateKey: function(key){
			var k = key || {};
			var r = [],
				field = k.field || '',
				type = k.type || '',
				value = k.value || '';

			r.push('<div class="key' + (!key ? ' newKey' : '') + '">');
			r.push(this.generateFieldSelect(field));
			r.push(this.generateTypeSelect(type));
			r.push(this.generateValueInput(value, type));
			r.push(' <button class="btn remove" type="button" tabindex="-1"><i class="glyphicon-remove"></i></button>');
			r.push('</div>');

			return r.join('');
		},

		renderCreateSearch: function(){
			var searchParams = this.options.searchParams,
				r = [];

			for (var i = 0; i < searchParams.length; i++ ){
				r.push(this.generateKey(searchParams[i]));
			}
			r.push(this.generateKey());

			return r.join('');
		},

		renderAdvancedOptions: function(){
			var r = [], advancedOptions = this.options.advancedOptions;

			for (var i = 0; i < advancedOptions.length; i++){
				r.push('<div class="option">');
				r.push(unwrapFunction.call(advancedOptions[i], advancedOptions[i].view));
				r.push('</div>');
			}

			return r.join('');
		},

		renderAdvanced: function(){
			var	advancedOptions = this.options.advancedOptions,
				$advancedOptions = this.$advanced.find('.advanced-options'),
				$createSearch = this.$advanced.find('.create-search');

			$createSearch.html(this.renderCreateSearch());

			if (advancedOptions.length){
				this.$advanced.find('.advanced-options-container').show();

				var $options = $(this.renderAdvancedOptions());
				$advancedOptions.html($options);
				for (var i = 0; i < advancedOptions.length; i++){
					unwrapFunction.call(advancedOptions[i], advancedOptions[i].init, [ $advancedOptions.find('.option:nth-child(' + (i + 1) + ')'), this.options ]);
				}

			} else {
				this.$advanced.find('.advanced-options-container').hide();
			}


			this.$advanced.find('.dropdown-menu').css({ 'left': -this.$element.width() - 1 });
		},

		syncInput: function(searchParams){
			var searchParams = searchParams || this.options.searchParams,
				text = [];

			this.options.searchParams = searchParams;

			for (var i = 0; i < searchParams.length; i++){
				text.push($.trim(searchParams[i].value));
			}

			this.$element.val(text.join(' ')).change();
		},

		parseInput: function(){
			var keys = [];
			var text = $.trim(this.$element.val());

			text.replace(/[A-Za-z0-9-_,.]+([A-Za-z0-9-_,.])*|"[A-Za-z0-9-_,.\s]+"/g, function($0) {
				$0 = $0.replace(/_/g, '[_]');
				keys.push($0.replace(/"/g, ''));
			});

			return keys;
		},

		getKeyIndex: function(value) {
			var searchParams = this.options.searchParams,
				idx = -1;

			for (var i = 0; i < searchParams.length; i++) {
				if (searchParams[i].value == value) {
					idx = i;
					break;
				}
			}

			return idx;
		},

		getKeyFromSchema: function(index){
			for (var i = 0; i < this.options.schema.length; i++){
				var field = this.options.schema[i];
				if (field.index === index){
					return field;
				}
			}
		},

		getSearchParams: function(){
			var searchParams = this.options.searchParams,
				keys = this.parseInput(), keysChanged = 0,
				keysChangedIndex = -1, mappedKeys = '',
				search = [];

			for (var i = 0; i < keys.length; i++) {
				if (keys[i]) {
					var value = keys[i], field = '', type = 'contains', typeOverride;
					var keyIndex = this.getKeyIndex(value);

					if (value.match(/\w\.\./)) {
						typeOverride = 'between';
					} else if (value === '*') {
						typeOverride = 'exists';
					}
					
					if (keyIndex >= 0) {
						mappedKeys += keyIndex + '|';
						var key = searchParams[keyIndex];

						if (key.field.length && !this.getKeyFromSchema(key.field)) {
							key.field = '', type = key.type = 'contains';
						}

						if (!typeOverride && key.type == 'between') key.type = 'contains';

						key.type = typeOverride || key.type;
						value = key.value, field = key.field, type = key.type;
					} else {
						keysChanged++;
						if (keysChangedIndex) keysChangedIndex = i;
					}

					search.push({ value: value, field: field, type: typeOverride || type });
				}
			}

			//map changed key in input to unmapped key in stucture
			if (keysChanged == 1 && search.length == searchParams.length) {
				for (var i = 0; i < mappedKeys.length; i++) {
					if (mappedKeys.indexOf(i + '|') < 0) {
						var typeOverride = '', key = searchParams[i],
							value = search[keysChangedIndex].value;

						if (value.match(/\w\.\./)) typeOverride = 'between';
						if (!typeOverride && key.type == 'between') typeOverride = 'contains';

						key.type = typeOverride || key.type;
						search[keysChangedIndex].field = key.field;
						search[keysChangedIndex].type = key.type;

						break;
					}
				}
			}

			return search;
		},

		isAppendedFilter: function(filter1, filter2){
			var hasAllKeys = true, hasExpandedBinding = false, hasExpandedType = false;
			for (var i = 0; i < filter1.length; i++){
				var hasKey = false;
				for (var j = 0; j < filter2.length; j++){
					if (filter1[i].value == filter2[j].value){
						hasKey = true;
						if (filter1[i].field !== '' && filter2[j].field !== filter1[i].field){
							hasExpandedBinding = true;
						}
						if (filter1[i].type !== 'contains' && (filter2[j].type === 'beings' || filter2[j].type === 'ends' || filter2[j].type === 'exact')){
							hasExpandedType = true;
						}
					}
				}
				hasAllKeys = hasAllKeys && hasKey;
			}

			return filter1.length && filter2.length && hasAllKeys && !hasExpandedBinding && !hasExpandedType;
		},

		deepEquals: function(obj1, obj2){
			return JSON.stringify(obj1) === JSON.stringify(obj2);
		},

		search: function(forceSearch, params){
			var searchParams = this.options.searchParams = params || this.getSearchParams(),
				data = this.options.data;

			//append hidden filters;
			var finalSearch = [];

			finalSearch.push.apply(finalSearch, searchParams);
			for (var field in this.options.appendSearch){
				finalSearch.push(this.options.appendSearch[field]);
			}

			if (!forceSearch && this.deepEquals(this.searchParams, searchParams)) return;

			// map to serverside/clientside serach interface
			var mappedSearch = $.extend(true, [], finalSearch);
			for (var i = 0; i < mappedSearch.length; i++) {
				if (mappedSearch[i].value) {
					mappedSearch[i].value = mappedSearch[i].value.split(/\.\.|\,/);
				}
			}

			var that = this;
			if (typeof this.options.fetchData !== 'function'){
				that.options.executeClientSearch(mappedSearch, function(){
					that.$searchField.removeClass('searching');
					that.$searchField.find('.hidden').focus();
				})
			} else {
				// ALWAYS DO SERVER SEARCH
				// if (!forceSearch && data.length && searchParams && this.isAppendedFilter(this.serverParams, searchParams)){
				// 	this.$searchField.addClass('searching');
				// 	setTimeout(function(){
				// 		that.options.executeClientSearch(mappedSearch, function(){
				// 			that.$searchField.removeClass('searching');
				// 			that.$searchField.find('.hidden-absolute').focus();
				// 		});
				// 	}, 0);
				// } else {
					//deep copy array in order to compare previous serverside search
					this.serverParams = $.extend(true, [], finalSearch);
					this.$searchField.addClass('searching');
					setTimeout(function(){ that.options.fetchData(mappedSearch); }, 0);
				// }
			}
			this.searchParams = $.extend(true, [], searchParams);
		},

		process: function(result){
			var data = result || [];

			this.$searchField.removeClass('searching');
			this.$searchField.find('.hidden-absolute').focus();

			this.options.data = data;

			if (this.datagrid){
				// clear where clause
				this.options.executeClientSearch([]);
				this.datagrid.setData(data);
				this.datagrid.render();
			}
		},

		destroy: function(){
			this.$element.unbind('.searchfield');
			this.$element.empty();

			this.$element.removeData('searchfield');

			// publish events
			this.$element.triggerHandler('destroyed');
		}
	}


	/* SEARCHFIELD PRIVATE METHODS
	* =========================== */

	function unwrapFunction(f, args){
		if (!(args instanceof Array)){
			args = [args];
		}
		return typeof f === 'function' ? f.apply(this, args) : f;
	}
	
	function supplant(str, o) {
		var replacer = (typeof o === 'function')
			? function (a, b) { return o(b); }
			: function (a, b) {
				var r = o[b];
				return (typeof r === 'string' || typeof r === 'number') ? r : a;
			};
		return str.replace(/{([^{}]*)}/g, replacer);
	}

	/* SEARCHFIELD PLUGIN DEFINITION
	* =========================== */

	$.fn.searchfield = function (option) {
		var options = typeof option == 'object' && option;

		if (options){
			return this.each(function () {
				var $this = $(this),
					data = $this.data('searchfield');

				if (!data) $this.data('searchfield', new SearchField(this, options));
			})
		} else if (typeof option == 'string') {
			var $this = $(this),
				data = $this.data('searchfield');

			if (data) return data[option].apply(data, Array.prototype.slice.call(arguments, 1));
		}
	}

	$.fn.searchfield.defaults = {
		data: [],
		schema: [],
		searchParams: [],
		appendSearch: {},
		consumeDocumentKeypress: false,
		placeholder: 'Search...',
		showAdvancedSearch: true,
		searchOnBlur: true,
		searchTypes: {
			contains: true, 
			begins: true,
			exact: true, 
			between: true, 
			exists: true,
			notContains: true, 
			notBegins: true,
			notExact: true, 
			notBetween: true, 
			notExists: true
		},
		mapping: {},
		advancedOptions: [],
		template: [
			'<form class="searchfield" style="margin: 0; position: relative;">',
				'<div class="input-append">',
					'<span class="input-holder"></span>',
					'<button type="button" class="btn search"><i class="glyphicon-search"></i></button>',
				'</div>',
				'<div class="advanced" style="display: none">',
					'<a href="javascript:;" data-toggle="dropdown">',
						'<span class="caret"></span>',
					'</a>',
					'<div class="dropdown-menu">',
						//'<button type="button" class="close" style="padding: 3px 6px">&times;</button>',
						'<div class="dropdown-content">',
							'<div class="modal-body">',
								'<div class="advanced-options-container">',
									'<h6 style="margin-top: 0">{searchOptions}</h6>',
									'<p class="advanced-options"></p>',
								'</div>',
								'<div class="create-search-container">',
									'<h6>{createSearch}</h6>',
									'<p class="create-search form-inline"></p>',
								'</div>',
							'</div>',
							'<div class="modal-footer">',
								'<button type="button" class="btn btn-primary search">{search}</button>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="indicator"><img src="/webasp/images/oespinner-small.gif" /></div>',
				'<input type="checkbox" style="position: absolute; left: -9999px" class="hidden-absolute" tabindex="-1" />', //used to focus on instead of blur after search (checkbox is used so the keyboard will not show)
			'</form>'
		].join(''),
		i18n: 'fr'
	};
	
	$.fn.searchfield.i18n = {
		en: {
			advancedSearch: 'Advanced Search',
			anyCategory: 'Any Category',
			begins: 'starts with',
			between: 'between',
			collapseAll: 'Collapse All',
			contains: 'contains', 
			createSearch: 'Create Search',
			displayColumn: 'Display Column',
			ends:'ends with',
			exact:'equals', 
			exists: 'exists',
			expandAll: 'Expand All',
			groupBy: 'Group By',
			not: 'doesn\'t exist',
			notBegins: 'doesn\'t start with',
			notBetween: 'isn\'t between', 
			notContains:'doesn\'t contain', 
			notExact: 'doesn\'t equal',
			notExists: 'doesn\'t exist',
			pressEnterToSearch: 'Press Enter to Search...',
			range:'between', 
			search: 'Seach',
			searchOptions: 'Seach Options',
			showHide: 'Show/Hide'
		},
		fr: {
			advancedSearch: 'Recherche avancée',
			anyCategory: 'Toute catégorie',
			begins:'commence par',
			between: 'entre',
			collapseAll: 'Créduire tout',
			contains: 'contient', 
			createSearch: 'Créer une recherche',
			displayColumn: 'Display Column',
			ends:'finit par',
			exact:'égal à', 
			exists: 'existe',
			expandAll: 'Tout afficher',
			groupBy: 'Grouper par',
			not: 'n\'existe pas',
			notBegins: 'ne commence pas par',
			notBetween: 'n\'est pas entre', 
			notContains: 'ne contient pas', 
			notExact: 'n\'est pas égal à',
			notExists: 'n\'existe pas', 
			pressEnterToSearch: 'Appuyer sur la touche "Entrée" pour rechercher',
			range: 'entre', 
			search: 'Recherche',
			searchOptions: 'Recherche d\'options',
			showHide: 'Afficher/Masquer'
		}
	};

	$.fn.searchfield.Constructor = SearchField

}(window.jQuery);