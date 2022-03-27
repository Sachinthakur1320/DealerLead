/**

Example Use:

var orderByField = function (field, dir) {
	return function (a, b) {
		a = a[field] || '';
		b = b[field] || '';
		if (a < b) { return -dir; }
		else if (a > b) { return dir; }
		else { return 0; }
	};
};

var data = [{ id: 0, name: 'John', address: '123 Test Street' }, { id: 0, name: 'Jimmy', address: '456 Hello Cr' }]

var dataGrid = new DataGrid($('.container'));
dataGrid.schema = {
	fields: [
		{
			index: 'id',
			header: 'Customer ID'
		},
		{
			index: 'name',
			header: 'Name',
			view: function(index, data){ return '<a href="customerview.asp?id=' + data.id + '">' + index + '</a>' },
			sort: function(dir){ return orderByField('name', dir) },
			hidden: false,
			groupBy: true
		{
			index: 'address',
			header: 'Address',
			hidden: true,
			sort: function(dir){ return orderByField('address', dir) },
			className: 'Address',
			groupBy: true
		}
	]
}

dataGrid.enableCustomization = true;

dataGrid.data = data;
dataGrid.render();

**/



/* Data grid */
var DataGrid = function () {
	var supplant = function (str, o) {
		var replacer = (typeof o === 'function') ? 
			function (a, b) { return o(b); } : 
			function (a, b) {
				var r = o[b];
				return (typeof r === 'string' || typeof r === 'number') ? r : a;
			};
		return str.replace(/{([^{}]*)}/g, replacer);
	};


	//Public Variable Defaults;
	this.container = [];
	this.data = [];
	this.schema = {};
	this.enableSearch = false;
	this.enableCustomization = false;

	this.search = {
		ui: $(supplant([
			'<div class="dataSearch">',
				'<div class="searchContainer">',
					'<form class="search">',
						'<div class="advancedContainer">',
							'<a class="advancedOptions oebutton" href="javascript:;"><img src="/webasp/images/icons/asc-grey.png" /></a>',
							'<div class="advancedPopup shadow">',
								'<div class="searchOptions" />',
								'<div class="createSearch" />',
								'<div class="applySearch"><button class="oebutton">{search}</button></div>',
							'</div>',
						'</div>',
						'<input type="checkbox" style="position: absolute; left: -9999px" class="hidden" />', //used to focus on instead of blur after search (checkbox is used so the keyboard will not show)
						'<input type="search" class="input" placeholder="{pressEnterToSearch}" type="search" />',
						'<div class="searchIndicator" />',
					'</form>',
				'</div>',
				'<div class="resultText" />',
				'<div class="addtionalText" />',
			'</div>'
		].join(''), DataGrid.i18n[DataGrid.defaults.i18n])),
		mapping: null,
		process: null,
		filter: null,
		autoSearch: false,
		hiddenFilter: {},
		searchOptions: [],
		searchTypes: {
			contains: true, 
			begins: true/*, ends: true*/,
			exact: true, 
			not: true, 
			range: true, 
			exists: true
		}
	};

	this.customization = {
		ui: $(supplant([
			'<div class="dataOptions oegroup">',
				'<button class="option showHide oebutton first" title="{showHide}"><img src="/webasp/images/icons/eye.png" /></button>',
				//'<button class="option sortBy oebutton" title="Sort By"><img src="/webasp/images/icons/sortBy.png" /></button>',
				'<button class="option groupBy oebutton" title="{groupBy}"><img src="/webasp/images/icons/group6.png" /></button>',
				'<button class="option expandAll oebutton" title="{expandAll}"><img src="/webasp/images/icons/arrow_out.png" /></button>',
				'<button class="option collapseAll oebutton last" title="{collapseAll}"><img src="/webasp/images/icons/arrow_in.png" /></button>',
			'</div>'
		].join(''), DataGrid.i18n[DataGrid.defaults.i18n])),
		groupBy: true,
		showHide: true
	};

	this.ui = {
		controls: $('<div class="dataControls" />')
	};

	var settings = {};
	if (arguments.length === 1 && typeof arguments[0] === 'object' && !arguments[0].length){
		settings = arguments[0];
	} else {
		settings.container = arguments[0];
		settings.data = arguments[1];
		settings.schema = arguments[2];
	}

	//Override Defaults;
	$.extend(this, settings);

	this.dataMutated = this.data;
	this.container = $(this.container);
	this.container.empty();

	//Object Initialization
	var _groupRows = [];
	var _table, _options = {},
		_maskVisible = false,
		_lastMessage = null,
		_mask, _message;

	var self = this;

	//Private Variables
	var useClasses = !($.browser.msie && (parseInt($.browser.version, 10) <= 7));
	var mutators = {};

	//Private Methods
	var renderData = function (data, fields) {
		var r = [];
		var field;

		var firstIndex = 99999, lastIndex = -1, hidden;
		for (var field = 0; field < fields.length; field++) {
			if (typeof fields[field].hidden === 'function') {
				hidden = !!fields[field].hidden();
			} else {
				hidden = fields[field].hidden;
			}

			if (field < firstIndex && !hidden){
				firstIndex = field;
			}
			if (field > lastIndex && !hidden){
				lastIndex = field;
			}
		}

		for (var i = 0; i < data.length; i++) {
			r.push('<tr');
			if (self.schema.rows && typeof self.schema.rows.className === 'function') {
				r.push(' class="' + self.schema.rows.className(i, data[i]) + '"');
			}
			r.push(' dataIndex="' + i + '"');
			r.push('>');

			for (var field = 0; field < fields.length; field++) {
				if (fields[field] && fields[field].hidden !== undefined) {
					if (typeof fields[field].hidden === 'function') {
						if (fields[field].hidden()) { continue; }
					} else if (fields[field].hidden) {
						continue;
					}
				}

				r.push('<td');

				var className = '';
				if (fields[field].className) {
					if (typeof fields[field].className === 'function'){
						className += ' ' + fields[field].className(data[i][fields[field].index], data[i]);
					} else {
						className += ' ' + fields[field].className;
					}
				}

				if (field == firstIndex){
					className += ' first';
				}

				if (field == lastIndex){
					className += ' last';
				}

				r.push(' class="' + className + '"');

				if (typeof fields[field].action == 'function') {
					//r.push(' style="cursor:pointer;"');
					r.push(' fieldId="' + field + '"');
				}

				if (fields[field] && fields[field].width !== undefined) {
					if (typeof fields[field].width == 'function') {
						r.push(' style="width: ' + fields[field].width() + '"')
					} else if (fields[field].width) {
						r.push(' style="width: ' + fields[field].width + '"')
					}
				}

				r.push('>');

				if (fields[field] && fields[field].view) {
					html = fields[field].view(data[i][fields[field].index], data[i]);
					if (html) {
						r.push(html);
					}
				} else {
					r.push(data[i][fields[field].index]);
				}
				r.push('</td>');
			}

			r.push('</tr>');
		}


		return r.join('');
	};

	var renderHeader = function (table, fields) {
		var field;
		var r = [];

		r.push('<tr>');
		for (field = 0; field < fields.length; field++) {
			if (fields[field] && fields[field].hidden !== undefined) {
				if (typeof fields[field].hidden == 'function') {
					if (fields[field].hidden()) { continue; }
				} else if (fields[field].hidden) {
					continue;
				}
			}

			r.push('<th');

			var className = '';
			if (fields[field] && fields[field].sort !== undefined) {
				className += ' sortable';
				if (fields[field].direction > 0){
					className += ' sortUp';
				} else if (fields[field].direction < 0){
					className += ' sortDown';
				}
			}


			if (fields[field].className) {
				if (typeof fields[field].className === 'function'){
					className += ' ' + fields[field].className();
				} else {
					className += ' ' + fields[field].className;
				}
			}

			if (field == 0){
				className += ' first';
			}

			if (field == fields.length - 1){
				className += ' last';
			}

			r.push(' class="' + className + '"');

			if (fields[field] && fields[field].width !== undefined) {
				if (typeof fields[field].width == 'function') {
					r.push(' style="width: ' + fields[field].width() + '"')
				} else if (fields[field].width) {
					r.push(' style="width: ' + fields[field].width + '"')
				}
			}

			r.push(' fieldId="' + field + '"');
			r.push('>');

			if (fields[field] && typeof fields[field].header === 'string') {
				r.push(fields[field].header)
			} else if (fields[field] && typeof fields[field].header === 'function') {
				r.push(fields[field].header());
			} else {
				r.push(field);
			}

			//r.push('<div class="toggle"></div>');

			r.push('</th>');
		}
		r.push('</tr>');
		table.append(r.join(''));
	}

	var renderControls = function(){
		self.container.prepend(self.ui.controls);

		if (self.enableSearch){
			renderSearch();
		}

		if (self.enableCustomization){
			renderCustomization();

			if (self.customization.groupBy){
				self.customization.ui.find('.groupBy').show();
			} else {
				self.customization.ui.find('.groupBy').hide();
			}

			if (self.customization.showHide){
				self.customization.ui.find('.showHide').show();
			} else {
				self.customization.ui.find('.showHide').show();
			}
		}

		self.container.append('<div class="dataControlsBorder" />');
	};

	var renderSearch = function(){
		var $searchInput = self.search.ui.find('.input'),
			$advancedPopup = self.search.ui.find('.advancedPopup');

		var filterTimeout, filterParams = [],
			requestStack = [], waitingForResponse = false;

		var parseInput = function(){
			var keys = [];
			var text = $.trim($searchInput.val());

			text.replace(/[A-Za-z0-9-_,.]+([A-Za-z0-9-_,.])*|"[A-Za-z0-9-_,.\s]+"/g, function($0) {
				$0 = $0.replace(/_/g, '[_]');
				keys.push($0.replace(/"/g, ''));
			});

			return keys;
		}

		var syncInput = function(){
			var text = [];
			for (var i = 0; i < filterParams.length; i++){
				text.push($.trim(filterParams[i].value));
			}
			$searchInput.val(text.join(' ')).change();
		}

		var getKeyIndex = function(value) {
			var idx = -1;
			for (var i = 0; i < filterParams.length; i++) {
				if (filterParams[i].value == value) {
					idx = i;
					break;
				}
			}
			return idx;
		}

		var getFilterParams = function(){
			var keys = parseInput(), keysChanged = 0,
				keysChangedIndex = -1, mappedKeys = '',
				filter = [];

			for (var i = 0; i < keys.length; i++) {
				if (keys[i] != '') {
					var value = keys[i], field = '', type = 'contains', typeOveride = '';
					var keyIndex = getKeyIndex(value);

					if (value.match(/\w\.\./)){
						typeOveride = 'range';
					} else if (value === '*'){
						typeOveride = 'exists';
					}

					if (keyIndex >= 0) {
						mappedKeys += keyIndex + '|';
						var key = filterParams[keyIndex];

						if (key.field.length && !getKeyFromSchema(key.field)) {
							key.field = '', type = key.type = 'contains';
						}

						if (!typeOveride && key.type == 'range') key.type = 'contains';

						key.type = typeOveride || key.type;
						value = key.value, field = key.field, type = key.type;
					} else {
						keysChanged++;
						if (keysChangedIndex) keysChangedIndex = i;
					}

					filter.push({ value: value, field: field, type: typeOveride || type});
				}
			}

			//map changed key in input to unmapped key in stucture
			if (keysChanged == 1 && filter.length == filterParams.length) {
				for (var i = 0; i < mappedKeys.length; i++) {
					if (mappedKeys.indexOf(i + '|') < 0) {
						var typeOveride = '', key = filterParams[i],
							value = filter[keysChangedIndex].value;

						if (value.match(/\w\.\./)) typeOveride = 'range';
						if (!typeOveride && key.type == 'range') typeOveride = 'contains';

						key.type = typeOveride || key.type;
						filter[keysChangedIndex].field = key.field;
						filter[keysChangedIndex].type = key.type;

						break;
					}
				}
			}

			return filter;
		}

		var filterData = function(filter){
			var finalFilter = [];

			var isMatch = function(values, fieldValue, type){
				var regexp, match = false,

				values = values.map(function (x) { return x.toUpperCase(); });
				fieldValue = (''+fieldValue).toUpperCase();

				var match = false;
				for (var i = 0, j = values.length; i < j; i++){
					if (type === 'begins') {
						regexp = new RegExp('^' + values[i]);
						match = match || regexp.test(fieldValue);
					} else if (type === 'ends') {
						regexp = new RegExp(values[i] + '$');
						match = match || regexp.test(fieldValue);
					} else if (type === 'exact') {
						regexp = new RegExp('^' + values[i] + '$');
						match = match || regexp.test(fieldValue);
					} else if (type === 'not') {
						regexp = new RegExp('^((?!' + values[i] + ').)*$');
						match = match || regexp.test(fieldValue);
					} else if (type === 'exists') {
						match = match || !!fieldValue;
					} else if (type === 'range') {
						var bounds = value.split('..');

						if (!isNaN(bounds[0]) && !isNaN(bounds[1]) && !isNaN(fieldValue)){
							bounds[0] = +bounds[0];
							bounds[1] = +bounds[1]
							fieldValue = +fieldValue;
						}
						match = match || (fieldValue >= bounds[0] && fieldValue <= bounds[1]);
					} else {
						regexp = new RegExp(values[i]);
						match = match || regexp.test(fieldValue);
					}
				}
				return match;
			};

			self.where(function(row){
				var rowMatch = true;
				for (var i = 0, j = filter.length; i < j; i++){
					var f = filter[i];
					if (f.field){
						var match = isMatch(f.value, row[f.field], f.type);
						rowMatch = rowMatch && match;
					} else {
						var inRow = false;
						for (var field in row){
							var match = isMatch(f.value, row[field], f.type);
							if (match){
								inRow = true;
							}
						}
						rowMatch = rowMatch && inRow;
					}
				}
				return rowMatch;
			}).render();

			self.search.ui.find('.searchIndicator').removeClass('searching');
		};

		var isAppendedFilter = function(filter1, filter2){
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
		}


		var deepEquals = function(obj1, obj2){
			return JSON.stringify(obj1) === JSON.stringify(obj2);
		}

		var filterHandler = (function(){
			var _serverParams = [];
			var _filterParams = [];
			return function(forceFilter, params){
				filterParams = params || getFilterParams();

				//append hidden filters;
				var finalFilter = [];
				finalFilter.push.apply(finalFilter, filterParams);
				for (var field in self.search.hiddenFilter){
					finalFilter.push(self.search.hiddenFilter[field]);
				}

				if (!forceFilter && deepEquals(_filterParams, filterParams)) return;

				if (typeof self.search.getData !== 'function'){
					filterData(finalFilter);
				} else {
					if (!forceFilter && self.data.length && filterParams && isAppendedFilter(_serverParams, filterParams)){
						//console.log('client', finalFilter, _serverParams);
						setTimeout(function(){ filterData(finalFilter) }, 0);
						self.search.ui.find('.searchIndicator').addClass('searching');
					} else {
						//console.log('server', finalFilter);
						//deep copy array in order to compare previous serverside search
						//_serverParams = $.extend(true, [], filterParams);
						_serverParams = $.extend(true, [], finalFilter);
						self.where(null);
						setTimeout(function(){ self.search.getData(finalFilter); }, 0);
						self.search.ui.find('.searchIndicator').addClass('searching');
					}
					_filterParams = $.extend(true, [], filterParams);

				}
			}
		})();

		self.search.filter = function(){
			if (arguments.length){
				filterParams = arguments[0];
				syncInput();
				filterHandler(true, filterParams);
			} else {
				return filterParams;
			}
		}

		self.search.process = function(result){
			result = result || {};
			var data = result.data || [];

           // if (requestStack.length) {
               // (requestStack.pop())();
                //requestStack = [];
           // } else {
				waitingForResponse = false;
				self.search.ui.find('.searchIndicator').removeClass('searching');
				//self.search.ui.find('input').blur();
				self.search.ui.find('.hidden').focus();

				self.data = data;
				self.render();
			//}
		}

		var hasBindings = function(filter){
			for (var i = 0; i < filter.length; i++){
				if (filter[i].type || filter[i].field){
					return true;
				}
			}
			return false;
		};

		var getKeyFromSchema = function(index){
			for (var i = 0; i < self.schema.fields.length; i++){
				var field = self.schema.fields[i];
				if (field.index === index){
					return field;
				}
			}
		}

		var getHeader = function(index){
			var field;
			if (self.search.mapping && self.search.mapping[index]){
				field = self.search.mapping[index];
			} else {
				field = getKeyFromSchema(index) || {};
			}

			if (field && typeof field.header === 'string') {
				 return field.header;
			} else if (field && typeof field.header === 'function') {
				return field.header();
			} else {
				return index;
			}
		};

		var getKeyFromFilter = function(value){
			for (var i = 0; i < filterParams.length; i++){
				if (filterParams[i].value === value){
					return filterParams[i];
				}
			}
			return {};
		};

		var generateFieldSelect = function(selected){
			var r = [], fields = self.schema.fields;

			//r.push('<span class="styledSelect">');
			//r.push('<span class="selected"></span>');
			//r.push('<select tabindex="-1">');
			r.push('<select>');
			r.push('<option value="">' + DataGrid.i18n[DataGrid.defaults.i18n].anyCategory + '</option>');

			var newList = JsLinq(fields).groupBy(function(o){return o.grouping || 'xxx'}).orderBy(function(a,b){return a.key =='xxx'?-1:0}).select(function(o){return o.toArray()}).toArray();
			for (var j=0; j<newList.length; j++){
				if (newList[j][0].grouping){ r.push('<optgroup label="--------"></optgroup>'); }
				fields = newList[j];
				for (var i = 0; i < fields.length; i++){
					if (fields[i].index){
						r.push('<option value="' + fields[i].index + '"');
						if (fields[i].index == selected){
							r.push(' selected="selected"');
						}
						r.push('>');
						r.push(getHeader(fields[i].index));
						r.push('</option>');
					}
				}
			}
			r.push('</select>');
			//r.push('</span>');

			return r.join('');
		}

		var generateTypeSelect = function(selected){
			var r = [];

			//r.push('<span class="styledSelect">');
			//r.push('<span class="selected"></span>');
			//r.push('<select tabindex="-1">');
			r.push('<select>');
			for (var type in self.search.searchTypes){
				if (self.search.searchTypes[type]) {
					r.push('<option value="' + type + '"');
					if (type == selected){
						r.push(' selected="selected"');
					}
					r.push('>');
					r.push(DataGrid.i18n[DataGrid.defaults.i18n][type]);
					r.push('</option>');
				}
			}
			r.push('</select>');
			//r.push('</span>');

			return r.join('');
		}

		var generateValueInput = function(value, type){
			var r = [];

			var range = (value || '').split('..');
			if (type === 'range'){
				r.push('<input class="range start" type="text" value="' + (range[0] || '') + '" /><span class="syntax">..</span>');
				r.push('<input class="range end" type="text" value="' + (range[1] || '') + '" />');
			} else if (type === 'exists'){
				r.push('<input type="text" value="" class="disabled" disabled="disabled"/>');
			} else {
				r.push('<input type="text" value="' +  (range[0] || '') + '" />');
			}

			return r.join('');
		}

		var generateKey = function(key){
			var k = key || {};
			var r = [],
				field = k.field || '',
				type = k.type || '',
				value = k.value || '';

			r.push('<div class="key' + (!key ? ' newKey' : '') + '">');
			r.push('<span class="field">' + generateFieldSelect(field) + '</span>');
			r.push('<span class="type">' + generateTypeSelect(type) + '</span>');
			r.push('<span class="value">' + generateValueInput(value, type) + '</span>');
			r.push('<a class="remove" href="javascript:;" tabindex="-1">×</a>');
			r.push('</div>');

			return r.join('');
		}

		var renderCreateSearch = function(){
			var r = [];
			r.push('<div class="optionTitle">' + DataGrid.i18n[DataGrid.defaults.i18n].createSearch + '</div>');
			for (var i = 0; i < filterParams.length; i++ ){
				r.push(generateKey(filterParams[i]));
			}
			r.push(generateKey());

			return r.join('');
		}

		var renderSearchOptions = function(){
			var r = [];

			r.push('<div class="optionTitle">' + DataGrid.i18n[DataGrid.defaults.i18n].searchOptions + '</div>');
			r.push('<div class="options">');
			for (var i = 0; i < self.search.searchOptions.length; i++){
				var option = self.search.searchOptions[i];

				r.push('<div class="option">');
				if (typeof option.view === 'function'){
					r.push(option.view(option.state));
				} else {
					r.push(option.view);
				}
				r.push('</div>');
			}
			r.push('</div>');

			return r.join('');
		}

		self.ui.controls.append(self.search.ui);

		//Register Events
		var allowSplit;

		self.search.ui.delegate('form', 'submit', function(e){
			e.preventDefault();
			return false;
		});

		self.search.ui.delegate('.input', 'keydown.dataGrid', function(e){

			var code = e.which, $target = $(this);
			var caretPos = $target.caret(); //caret position before key is processed


			if (code == 32) {
				var splitKey = false, text = $target.val();

				if ((allowSplit > 0 && caretPos > 0 && caretPos < text.length && text.charAt(caretPos - 1) != ' ' && text.charAt(caretPos) != ' ') || text.charAt(caretPos - 1) == ',') {
					var quoteNum = 0;
					for (var i = 0; i < caretPos; i++) {
						if (text.charAt(i) == '"') quoteNum++;
					}
					if (quoteNum % 2 == 0) splitKey = true;
				}

				if (splitKey) {
					var wordStart = 0,
						wordEnd = text.length;

					for (var i = caretPos - 1; i > 0; i--) {
						if (text.charAt(i) == ' ') {
							wordStart = i + 1;
							break;
						}
					}

					for (var i = caretPos; i < text.length; i++) {
						if (text.charAt(i) == ' ') {
							wordEnd = i;
							break;
						}
					}

					var key = text.substring(wordStart, wordEnd);

					keyCaretPos = caretPos - wordStart;
					key = key.substring(0, keyCaretPos) + " " + key.substring(keyCaretPos, key.length);

					$(this).val(text.substr(0, wordStart) + '"' + key + '"' + text.substr(wordEnd, text.length));
					var that = $(this);
					setTimeout(function() {
						that.caret(caretPos + 2);
					}, 1);
				}
			}else if (code == 37 || code == 39) { //left arrow, right arrow
				allowSplit = code;
			} else if (code == 13){
				if (filterTimeout) clearTimeout(filterTimeout);
				filterHandler();
			} else {
				allowSplit = 0;
			}

			if (self.search.autoSearch){
				if (filterTimeout) clearTimeout(filterTimeout);
				filterTimeout = setTimeout(function(){ filterHandler() }, 400);
			}

			e.stopPropagation();
		});

		self.search.ui.delegate('.input', 'blur.dataGrid', function(){
			filterHandler(false);
		});

		self.search.ui.delegate('.searchIndicator', 'click.dataGrid', function(e){
			filterHandler(true);

			e.stopPropagation();
		});

		self.search.ui.delegate('.advancedOptions', 'click.dataGrid', function(e){
			var $target = $(this);

			if ($target.hasClass('selected')){
				$target.removeClass('selected');
				$advancedPopup.hide();
			} else {
				$target.addClass('selected');
				var $createSearch = $(renderCreateSearch());
				$advancedPopup.find('.createSearch').html($createSearch);

				if (self.search.searchOptions.length){
					var $searchOptions = $(renderSearchOptions());
					$advancedPopup.find('.searchOptions').html($searchOptions);

					var $container = $searchOptions.filter('.options');
					for (var i = 0; i < self.search.searchOptions.length; i++){
						if (typeof self.search.searchOptions[i].init === 'function'){
							self.search.searchOptions[i].init($container, self.search, self.schema);
						}
					}
				}

				$createSearch.find('select').trigger('change');
				$advancedPopup.show();
			}
			e.stopPropagation();
		});

		self.search.ui.delegate('.advancedContainer .value input', 'keydown.dataGrid', function(e){
			var code = e.which;
			if (code === 13){
				var $createSearch = $(this).parents('.createSearch');
				var hasEmptyInput = false;
				$createSearch.find('input').each(function(){
					if (!$.trim($(this).val())){
						hasEmptyInput = true;
						$(this).focus();
					}
				});
				if (!hasEmptyInput){
					$createSearch.find('.newKey').removeClass('newKey');
					$createSearch.append(generateKey());
					$createSearch.find('.newKey select').trigger('change');
					setTimeout(function(){
						$createSearch.find('.newKey input').focus();
					}, 0);
				}
				e.preventDefault();
			}

		});

		self.search.ui.delegate('.advancedContainer .type select', 'change.dataGrid', function(e){
			var $target = $(this),
				$key = $target.parents('.key'),
				$value = $key.find('.value');

			var value;
			if ($value.find('.range').length){
				value = $value.find('.start').val() + '..' + $value.find('.end').val();
			} else {
				value = $value.find('input').val();
			}
			$key.find('.value').html(generateValueInput(value, $target.val()));
		});

		self.search.ui.delegate('.advancedContainer .remove', 'click.dataGrid', function(e){
			var $target = $(this),
				$key = $target.parents('.key');

			$key.remove();
		});

		self.search.ui.delegate('.advancedContainer .styledSelect select', 'change.dataGrid', function(e){
			var $target = $(this),
				$parent = $target.parent(),
				$selected = $parent.find('.selected');

			$selected.html($target.find('option:selected').html());
		});

		self.search.ui.delegate('.advancedContainer .applySearch button', 'click.dataGrid', function(e){
			var $createSearch = $(this).parents('.advancedPopup').find('.createSearch');
			var $searchOptions = $(this).parents('.advancedPopup').find('.searchOptions');

			$searchOptions.find('.option').each(function(i, value){
				if (typeof self.search.searchOptions[i].action === 'function'){
					self.search.searchOptions[i].action($(value).children(), self.search, self.schema);
				}
			});

			filterParams = [];
			$createSearch.find('.key').each(function(){
				var $target = $(this),
					field = $target.find('.field select').val() || '',
					type = $target.find('.type select').val() || '',
					value = $target.find('.value input')
								.map(function(){ return $(this).val() })
								.toArray().join('..') || '';

				if (type === 'exists') value = '';
				if (value || field || type !== 'contains'){
					filterParams.push({ field: field, type: type, value: value});
				}
			});
			syncInput();
			filterHandler(true, filterParams);

			self.search.ui.find('.advancedOptions').removeClass('selected');
			$advancedPopup.hide();
		});

		$(document).bind('mousedown touchstart',function(e){
			var $target = $(e.target);
			if ($target && !$target.hasClass('advancedContainer') && !$target.parents('.advancedContainer').length){
				self.container.find('.advancedOptions').removeClass('selected');
				$advancedPopup.hide();
			}
			if ($target && !$target.hasClass('typeSelector') && !$target.parents('.typeSelector').length){
				self.container.find('.typeSelector').remove();
			}
		});

		$(document).bind('keydown',function(e){
			var element = document.activeElement;
			if((element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea' && element.contentEditable !== 'true') || $(e.target).hasClass('hidden')) {
				if (typeof e.which == "number" && e.which > 0 && !e.ctrlKey && !e.metaKey && !e.altKey){
					if (self.search.ui.find('.input').is(':visible')){
						self.search.ui.find('.input').focus();
					}
				}
			}
		});
	}

	var renderCustomization = function(){

		if (!self.customization.showHide){
			self.customization.ui.remove('.showHide');
		}

		if (!self.customization.groupBy){
			self.customization.ui.remove('.groupBy, .expandAll, .collapseAll');
		}

		self.ui.controls.append(self.customization.ui);

		//Register Events
		self.container.delegate('.dataOptions .showHide', 'click.dataGrid', function(e){
			self.container.find('.columnSelector').remove();
			self.container.find('.option').removeClass('selected');

			var $target = $(this);
			$target.addClass('selected');

			var r = [];
			r.push('<ul class="columnSelector sh shadow">');
			for (var i = 0, j = self.schema.fields.length; i < j; i++){
				if (self.schema.fields[i].hidden !== undefined && typeof self.schema.fields[i].hidden !== 'function'){
					var id = 'fieldId' + i;

					r.push('<li fieldId="' + i + '"');
					if (!self.schema.fields[i].hidden){
						r.push(' class="checked"');
					}
					r.push('>');
					r.push('<span>' + self.schema.fields[i].header + '</span>');
					r.push('</li>');
				}
			}
			r.push('</ul>');

			var selector = $(r.join('')).show();
			$target.parent().append(selector);
			e.stopPropagation();
		});

		self.container.delegate('.dataOptions .groupBy', 'click.dataGrid', function(e){
			self.container.find('.columnSelector').remove();
			self.container.find('.option').removeClass('selected');

			var $target = $(this);
			$target.addClass('selected');

			var r = [];
			r.push('<ul class="columnSelector gb shadow">');
			for (var i = 0, j = self.schema.fields.length; i < j; i++){
				if (self.schema.fields[i].groupBy){
					var id = 'fieldId' + i;

					r.push('<li fieldId="' + i + '"');

					var groupBy;
					if (typeof self.schema.fields[i].groupBy === 'function'){
						groupBy = self.schema.fields[i].groupBy();
					} else {
						groupBy = self.schema.fields[i].index;
					}
					if (mutators.groupBy === groupBy){
						r.push(' class="checked"');
					}
					r.push('>');
					r.push('<span>' + self.schema.fields[i].header + '</span>');
					r.push('</li>');
				}
			}
			r.push('</ul>');

			var selector = $(r.join('')).show();
			$target.parent().append(selector);
			e.stopPropagation();
		});

		self.container.delegate('.dataOptions .expandAll', 'click.dataGrid', function(e){
			self.container.find('.columnSelector').remove();
			self.container.find('.option').removeClass('selected');

			self.expandAll();
			e.stopPropagation();
		});

		self.container.delegate('.dataOptions .collapseAll', 'click.dataGrid', function(e){
			self.container.find('.columnSelector').remove();
			self.container.find('.option').removeClass('selected');

			self.collapseAll();
			e.stopPropagation();
		});

		self.container.delegate('.dataOptions .sh.columnSelector li', 'click.dataGrid', function(e){
			var $target = $(this);
			var fieldId = $target.attr('fieldId');

			if (self.schema.fields[fieldId]) {
				self.schema.fields[fieldId].hidden = !self.schema.fields[fieldId].hidden;
				if (self.schema.fields[fieldId].hidden){
					$target.removeClass('checked');
				} else {
					$target.addClass('checked');
				}
				self.render();
			}

			e.stopPropagation();
		});

		self.container.delegate('.dataOptions .gb.columnSelector li', 'click.dataGrid', function(e){
			var $target = $(this);
			var fieldId = $target.attr('fieldId');


			if ($target.hasClass('checked')){
				self.groupBy(null).render();
				$target.removeClass('checked');
				return;
			}

			$target.parents('.gb.columnSelector').find('li').removeClass('checked');

			var field = self.schema.fields[fieldId];
			var groupBy = typeof field.groupBy === 'function' ? field.groupBy : field.index;
			if (field && groupBy) {
				$target.addClass('checked');
				if (typeof groupBy === 'function'){
					self.groupBy(groupBy(self.schema));
				} else {
					self.groupBy(groupBy);
				}
				self.render();
			}

			e.stopPropagation();
		});

		$(document).bind('mousedown touchstart',function(e){
			var $target = $(e.target);
			if ($target && !$target.hasClass('dataOptions') && !$target.parents('.dataOptions').length){
				self.container.find('.columnSelector').remove();
				self.container.find('.option').removeClass('selected');
			}
		});
	}

	var applyMutators = function(data){
		var dataMutated = JsLinq(data);

		if (mutators.select){
			dataMutated = dataMutated.select(mutators.select);
		}

		if (mutators.where){
			dataMutated = dataMutated.where(mutators.where);
		}

		if (mutators.orderBy){
			dataMutated = dataMutated.orderBy(mutators.orderBy);
		}

		if (mutators.groupBy){
			if (!self.schema.group){
				self.schema.group = {};
			}

			self.schema.group.collapsed = true;

			dataMutated = dataMutated.groupBy(mutators.groupBy);
		} else if (mutators.groupBy === null) {
			self.schema.group.collapsed = false;
		}

		if (typeof self.mutator === 'function'){
			dataMutated = self.mutator.call(self, dataMutated, self.schema);
		}

		return dataMutated;
	}

	//Define Interface
	this.render = function () {
		//perf.start('render');

		if (self.container.length !== 1) { return; }

		var fields = self.schema.fields || {};
		var field;
		var tr;

		_options.accordion = self.schema.group && self.schema.group.accordion;
		if (_options.accordion) {
			self.schema.group.collapsed = true;
		}

		var table = $('<table />'),
			tbody = $('<tbody />'),
			thead = $('<thead />'),
			tfoot = $('<tfoot />');

		var visibleFields = [];
		for (var i = 0, j = self.schema.fields.length; i < j; i++){
			//table.append('<colgroup fieldId="' + i + '" />');
			var isHidden;
			if (typeof self.schema.fields[i].hidden === 'function'){
				isHidden = self.schema.fields[i].hidden();
			} else {
				isHidden = self.schema.fields[i].hidden;
			}

			if (!isHidden){
				visibleFields.push([fields[i]]);
			}
		}

		_groupRows.length = 0;

		table.addClass('dataTable');
		//table.css({ 'width': '100%' });

		table.append(thead).append(tbody).append(tfoot);
		//Header
		renderHeader(thead, fields);


		//Body
		self.dataMutated = applyMutators(self.data);
		if (self.dataMutated.length > 0) {
			if (self.schema.group && self.dataMutated[0].key !== undefined) {
				//Grouped Data

				var rows;
				for (var i = 0; i < self.dataMutated.length; i++) {
					//Generate group header
					if (typeof self.schema.group.header == "function") {
						tr = $(self.schema.group.header(self.dataMutated[i].key, self.dataMutated[i], visibleFields));
					} else {
						tr = $('<tr><td colspan="' + visibleFields.length + '"><span>' + self.dataMutated[i].key + '</span></td></tr>');
					}
					tr.addClass("header").addClass("collapsable");
					tr.attr("groupIndex", i);
					tr.find('td:first').addClass("first");

					tbody.append(tr);
					//Generate group data view and link to header
					(function (index, headerRow) {
						rows = function () {
							var dataRows;
							if (typeof self.schema.group.expandedView === 'function') {
								var placeHolder = $('<div class="placeholder" />');
								//placeHolder.css({ 'padding-left': '12px', 'padding-top': '10px', 'background-color': '#FAFAFA', 'background-image': 'url("/webasp/images/icons/tree_lastnode.png")', 'background-repeat': 'no-repeat' });
								dataRows = $('<tr/>');
								var mainCell = $('<td colspan="' + visibleFields.length + '"></td>');
								dataRows.append(mainCell);
								self.schema.group.expandedView(placeHolder, self.dataMutated[index]);
								mainCell.append(placeHolder);
							} else {
								dataRows = $(renderData(self.dataMutated[index], fields));
							}
							dataRows.insertAfter(headerRow);
							_groupRows.push(dataRows);
							return dataRows;
						};
					})(i, tr);

					if (self.schema.group.collapsed && !tr.hasClass("startExpanded")) {
						tr.addClass("collapsed");
					} else {
						rows = rows();
					}

					(function (rows, tr) {
						tr.click(function () {
							if (_options.accordion && tr.hasClass("collapsed")) {
								self.collapseAll();
							}
							collapsed = tr.hasClass("collapsed");
							if (typeof rows === 'function') {
								rows = rows();
							}
							if (useClasses) {
								if (collapsed) { rows.removeClass('hidden'); }
								else { rows.addClass('hidden'); }
							} else {
								rows.toggle(collapsed);
							}
							tr.toggleClass("collapsed", !collapsed);
						});//.css('cursor', 'pointer');
					})(rows, tr);
				}
			} else {
				//Non-grouped data

				tbody.append(renderData(self.dataMutated, fields));
			}
		}

		if (self.schema.footer){
			var tr = [];
			tr.push('<tr class="footer">');
			if (typeof self.schema.footer === 'function'){
				tr.push(self.schema.footer(self.dataMutated, visibleFields, self.schema));
			} else {
				tr.push(self.schema);
			}
			tr.push('</tr>');
			tfoot.append(tr.join(''));

		}

		if (_table) {
			_table.replaceWith(table);
		} else {
			renderControls();
			self.container.append($('<div class="dataTableContainer" />').append(table));
		}
		_table = table;

		self.showLoading(false);

		if (typeof self.afterRender === 'function'){
			self.afterRender(self);
		}

		//perf.get('render');
		return table;
	};

	this.collapseAll = function () {
		if (_table) {
			_table.find('tr.header:not(.collapsed)').click();
		}
	};

	this.expandAll = function () {
		if (_table) {
			_table.find('tr.header.collapsed').click();
		}
	};

	this.showLoading = function (state, message) {
		if (state && (!_maskVisible | (message && message !== _lastMessage))) {
			_lastMessage = message;
			_maskVisible = true;
			message = message || '<img style="float:left" src="/webasp/images/oespinner.gif"/>';
			if (!_mask) {
				_mask = $('<div />')
					.css({
						'z-index': 500,
						'background-color': '#666',
						'opacity': 0.5,
						'position': 'absolute'
					});
				_message = $('<div/>')
					.css({
						'z-index': 501,
						'background-color': '#FFF',
						'padding': '5px',
						'border': '5px solid #111',
						'position': 'absolute'
					})
				self.container.append(_mask).append(_message);
			}
			_mask.height(self.container.height()).width(self.container.width())
				.css('left', self.container.offset().left).css('top', self.container.offset().top)
				.show();
			var maskOffset = _mask.offset();
			_message.slideDown('fast')
				.html(message)
				.css('top', maskOffset.top + 10).css('left', maskOffset.left + ((_mask.width() - _message.width()) / 2));
		} else if (!state && _maskVisible) {
			_maskVisible = false;
			if (_mask) { _message.slideUp(250, function(){_message.hide()}); _mask.hide(); }
		}
	};

	this.select = function(prop){
		mutators.select = prop;
		return this;
	}

	this.where = function(prop){
		mutators.where = prop;
		return this;
	}

	this.groupBy = function(prop){
		mutators.groupBy = prop;
		return this;
	}

	this.orderBy = function(prop){
		mutators.orderBy = prop;
		return this;
	}

	this.orderByProperty = function(prop, dir){
		dir = dir || 1;
		var orderByFunc = function(a, b){
			a = a[prop];
			b = b[prop];

			if (a < b) { return -dir; }
			else if (a > b) { return dir; }
			else { return 0; }
		}

		return this.orderBy(orderByFunc);
	}

	this.destroy = function(){
		self.container.empty();
		self.container.unbind('.dataGrid');
	}

	//Register Events

	//Register grid action dispatch
	/*this.container.delegate('.dataTable', 'click.dataGrid', function(e){
		var schema = self.schema;
		var $target = $(e.target);
		if ($target[0].tagName && $target[0].tagName.toUpperCase() !== 'TD') {
			$target = $target.parents('td:first');
		}
		//Only handle if the cell is a direct decendant of this table, not a child table
		if ($target.parents('table:first')[0] !== this) { return; }

		var groupIndex = $target.parent().prevAll('tr[groupIndex]:first').attr('groupIndex');
		var dataIndex = $target.parent().attr('dataIndex');
		var fieldId = $target.attr('fieldId');

		if (schema.fields[fieldId] && typeof schema.fields[fieldId].action == 'function') {
			if (groupIndex) {
				schema.fields[fieldId].action(self.dataMutated[groupIndex][dataIndex][schema.fields[fieldId].index], self.dataMutated[groupIndex][dataIndex], e);
			} else {
				schema.fields[fieldId].action(self.dataMutated[dataIndex][schema.fields[fieldId].index], self.dataMutated[dataIndex], e);
			}
		}
	});*/

	this.container.delegate('.dataTable > tbody > tr > td', 'click.dataGrid', function(e){
		var schema = self.schema;
		var $target = $(this);

		var groupIndex = $target.parent().prevAll('tr[groupIndex]:first').attr('groupIndex');
		var dataIndex = $target.parent().attr('dataIndex');
		var fieldId = $target.attr('fieldId');

		if (schema.fields[fieldId] && typeof schema.fields[fieldId].action == 'function') {
			if (groupIndex) {
				schema.fields[fieldId].action(self.dataMutated[groupIndex][dataIndex][schema.fields[fieldId].index], self.dataMutated[groupIndex][dataIndex], e);
			} else {
				schema.fields[fieldId].action(self.dataMutated[dataIndex][schema.fields[fieldId].index], self.dataMutated[dataIndex], e);
			}
		}
	});

	this.container.delegate('.dataTable > thead > tr > th', 'click.dataGrid', function(e){
		var schema = self.schema;
		var $target = $(this);

		var fieldId = $target.attr('fieldId');

		for (var i = 0, j = schema.fields.length; i < j; i++){
			if (i != fieldId && typeof schema.fields[i].sort == 'function') {
				schema.fields[i].direction = 0;
			}
		}

		if (schema.fields[fieldId] && typeof schema.fields[fieldId].sort == 'function') {
			schema.fields[fieldId].direction = (schema.fields[fieldId].direction || -1) * -1;
			self.orderBy(schema.fields[fieldId].sort(schema.fields[fieldId].direction)).render();
		}

		e.stopPropagation();
		return false;

	});
};


DataGrid.defaults = {
	i18n: 'en'
};

DataGrid.i18n = {
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

