/*
	TableFilter (server-side filter version)
	
	settings = {
		getSearchResults: function(), 			// the rpc function that will be called to retrieve search results 
		searchFields: ['a', 'b', 'c'],			// the list of fields that are searchable
		hiddenFields: ['c'],					// a subset of searchFields that indicate which fields will initially be hidden
		schema: {								// schema object representing the format of the rows and cells within the table
			fields: {a: 'Apple', b:'Banana'},		// list of column -> language label pairs
			formatFields: {a: function()},			// list of column -> function pairs to format the cell for each column, returns a string represting the formatted data
			formatRows: {							// object representing any row level display options
				attributes: function(),					// function to add any additional attributes to the current row, returns a string (i.e. 'class="group" id="3423"')
				display: function(),					// function to determine if row is drawn, returns true or false
				zebra: true								// indicates whether or not to add zebra (a.k.a piano key) formatting to the table
			}
		},										
		container: $('container'),				// the container of the table
		example: '"Red Delicious"',				// optional example search to help indicate what the user can type in
		hiddenFilter: [{type:'contains', value:'Grape', hidden:'true'}] 	//filter that will be applied in addition to user input
		globalOptions: [{ui: '<input type="checkbox" />Add Orange', func: function(config){config.hiddenFilter.push({type:'contains', value:'Orange', hidden:'true'})} }] 
				//Allows you to specify global search options that can modify the current config object
		text: '<div>Anything you want</div> 	//optional text that will appear at the top right of the table that can be used to additional user information
	}

	var filter = tablefilter(settings);
*/

var tablefilter = function (settings, callback) {

    /*******     Private Variables      *******/

    var defaults = {
        getSearchResults: null,
        hiddenFilter: [],
        searchFields: [],
        hiddenFields: [],
		displayField: '',
        schema: {fields:{}, formatFields:{}, formatRows:{}},
        container: $('body'),
        example: '',
        maxRows: 100,
		globalOptions:[],
		advancedContainer: $([]),
		text:'',
        simpleMode: false,
        hiddenButtonAvancedSearch: false
    }
	
    var config = {};
	
    var resultsUITimeout,
        filterTimeout,
		$toggleContainer = $([]),
		$resultsContainer = $([]),
		$message,
		$resultText,
		$table,
		$filter,
		$search,
		$input,
		$toggle,
		$globalOptions,
		$localOptions,
		orgFilterWidth,
		waitingForResults = false,
		UIStruct = { input: { reDraw:function(){} }, results: { reDraw:function(){}, keys:[] }, toggle: { reDraw:function(){} } },
		requestStack = [],
		prevFilter = null,
		allowSplit = 0;
	
	var searchTypes = {
		contains: true, 
		begins: true,
		ends: true,
		exact: true, 
		not: true, 
		range: true, 
		exists: true
	};
	
	$.trim = function(str){
		if (!str) return '';
		return str.replace(/^[\s\xA0]*/, '').replace(/[\s\xA0]*$/, '')
	}
	
    /*******     Private Functions      *******/
	
    var supplant = function (str, o) {
		var replacer = (typeof o === 'function') ? 
			function (a, b) { return o(b); } : 
			function (a, b) {
				var r = o[b];
				return (typeof r === 'string' || typeof r === 'number') ? r : a;
			};
		return str.replace(/{([^{}]*)}/g, replacer);
	};

	var stripHTML = function(str){
		return str.replace(/(<([^>]+)>)/ig,"")
	}
	
	var keydownHandler = function(e){
		var code = e.which;
		var caretPos = $(this).caret(); //caret position before key is processed
		var processKey = true;
		var text;
		
		if (config.simpleMode){
			text = $(this).val();
			if (code == 32) {
				var splitKey = false;
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
			} else {
				allowSplit = 0;
			}
			text =  stripHTML($.trim(text));
		}else{
			text = stripHTML($.trim($(this).text()));
			var keyList = $('.input-text-field');
			if (keyList.length) {
				navPos = keyList.index($(this));
			}
			
			if (code == 39 && (caretPos == text.length) && navPos < keyList.length - 1){ //right arrow
				keyList[navPos + 1].focus();
				$(keyList[navPos + 1]).caret(0);
				processKey = false;
			}else if (code == 37 && caretPos == 0 && navPos > 0){ //left arrow
				keyList[navPos - 1].focus();
				$(keyList[navPos - 1]).caret($(keyList[navPos - 1]).text().length)
				processKey = false;
			}else if ( code == 8 && caretPos == 0 && navPos == keyList.length - 1){
				$(keyList[navPos - 1]).parent().find('.remove').trigger('click');
			} else if (code == 13 || (code == 32 && caretPos >= text.length && $(this).parent().hasClass('newkey'))) { //enter or space	
				if (code == 13 || (((text.charAt(0) == '"' && text.charAt(text.length - 1) == '"') || text.charAt(0) != '"') && text.charAt(text.length - 1) != ',')){
					saveEntries();
					addKey(true);		
					$(this).trigger('blur');		
				}
			}
		}
		
		if (code == 38 || code == 40) { //arrow up, down
			var matchedList = $resultsContainer.find('.category a.searchField, .category[collapse=close]');
			
			var current = $resultsContainer.find('.hover');
			var resultsPos = -1;
			if (current.length) {
				resultsPos = matchedList.index(current);
			}
			matchedList.removeClass('hover');

			var n = matchedList.length;

			if (resultsUITimeout) {
				clearTimeout(resultsUITimeout);
			}

			if (code == 38 && resultsPos < 0) resultsPos = 0;

			var dir = code == 40 ? 1 : -1;
			if (!$resultsContainer.is(':visible')) {
				$(matchedList[resultsPos]).addClass('hover');
				$resultsContainer.show();
			} else {
				//fix for javascript modulo with negative values (i.e -1 % mod 5 = -1 but should be 4)
				resultsPos = (((resultsPos + dir) % n) + n) % n;
				$(matchedList[resultsPos]).addClass('hover');
			}
		} else if (code == 27) { //escape
			hideUI();
			//TODO: potentially remove all keys when esc is pressed (similar to how text boxes work by default
		}else if (code == 13){
			var current = $resultsContainer ? $resultsContainer.find('.hover') : [];
			if (current.length) {
				current.trigger('click');
			} else {
				searchTable(true);
			}
			processKey = false;
		} else {
			if (filterTimeout) clearTimeout(filterTimeout);
			filterTimeout = setTimeout(function(){searchTable()}, 400);
			hideUI();
		}

		var ubound = code == 13 || 32 ? 60 : 10;
		if (($filter.width() - $input.width()) < 20){
			$filter.width($filter.width() + 50);
		}else{
			if (($filter.width() - $input.width()) >= 100){
				var lbound = $input.width() + 20;
				$filter.css('width', (lbound < orgFilterWidth ? orgFilterWidth : lbound) + 'px');
			}
		}
		
		return processKey;
	}
	
	var saveEntries = function(){
		$input.find('.input-entry').each(function(){
			var $text = $(this).find('.input-text');
			var $textField = $text.find('.input-text-field');
			
			var newText = $.trim($textField.text());		
			
			if (newText == '' || newText == ' '){
				if (!$text.hasClass('newkey'))
					$(this).remove();
			}else{
				if ($text.hasClass('editable')){
					$text.removeClass('editable');
					$text.removeClass('newkey');
					if (!$text.find('.remove').length){
						var $removeKey = $('<a href="javascript:;" class="remove" />');
						
						//register events
						$removeKey.click(function(e){
							$(this).parent().parent().remove();
							if (!$('.input-text-field').length) addKey(true);

							if ($filter.width() - $input.width() >= 40){
								var lbound = $input.width() + 20;
								$filter.css('width', (lbound < orgFilterWidth ? orgFilterWidth : lbound) + 'px');
							}
							
							if (filterTimeout) clearTimeout(filterTimeout);
							filterTimeout = setTimeout(function() { searchTable() }, 650);	
							e.stopPropagation();
						});
						
						$text.append($removeKey)
					}
				}		
			}				
		});
	}
	
	var addKey = function(setFocus, text){
		if (!$input.find('.newkey').length){
			if (text === undefined) text = '';
			var $newkey = $('<li class="input-entry"><div class="input-text editable newkey"><div class="input-text-field" contenteditable="true">' + text + '</div></div></li>');
						
			$input.append($newkey);
			
			//register events
			$newkey.find('.input-text-field')
				.bind('blur', function(){
					var $this = $(this);
					if (!$this.parent().hasClass('newkey')){
						$this.text($.trim($this.text()).replace(/"/g, ''));
						//$this.html($this.text().replace(/\.\./, '<span style="margin:0 3px">..</span>'));
					}
					//$(this).text($.trim($(this).text().replace(/"/g, '')));
					saveEntries();
					$input.find('.input-text').removeClass('focus');
				})
				.bind('click', function(e){ 
					$(this).parent().addClass('editable');					
					e.stopPropagation();
					hideUI();
					UIStruct.results.reDraw(true);

				})
				.bind('focus', function(){ 
					if (!$(this).html().length && $(this).parent().hasClass('newkey')){
						$(this).html('&nbsp;');
					}
					$input.find('.input-text').removeClass('focus');
					$(this).parent().addClass('focus');	
				})
				.bind('keydown', keydownHandler);
		}
		if (setFocus) setTimeout(function(){$input.find('.newkey .input-text-field').focus()}, 1);
	}
	
    var buildFilterUI = function() {
        var fieldsNum = 0;

        for (var f in config.schema.fields) {
            fieldsNum++;
        }
		
		/*var setupTableSorter = $.extend({}, config.sortOptions);
		if (!$table.find('tbody tr').length) {
			setupTableSorter.sortList = [];
		}
		$table.tablesorter(setupTableSorter);*/
        
		swapColumns(UIStruct.toggle.selected);

        $table.find('tr th:nth-child(2)').each(function() {
            $('<th class="spacerCol" style="border:none;background:transparent;width:1px;padding:0;font-size:1px;line-height:1px;">&nbsp;</th>').insertBefore($(this));
        });

        $table.find('tr td:nth-child(2)').each(function() {
            $('<td class="spacerCol" style="border:none;background:transparent;width:1px;padding:0;font-size:1px;line-height:1px;">&nbsp;</th>').insertBefore($(this));
        });

        $table.find('thead').prepend('<tr class="spacerRow" style="height:1px;">' +
			'<th style="height:1px;padding:0;border:none;border-right:1px solid #B8B8B8;background:#d8d8d8"><div class="floater" style="height:1px;line-height:1px;font-size:1px;width:100%;position:relative;z-index:1;background:#D8D8D8;top:-1px;"></div></th>' +
			'<th class="spacerCol" colspan="' + fieldsNum + '" style="border:none;background:transparent;padding:0;font-size:1px;line-height:1px;" >&nbsp;</th></tr>');

        //var mySorter = tableSort($table);
        /*$table.find('th').each(function(k, v) {
            if ($(this).attr('class') != 'usr_Picture') {
                $(this).click(
				function() {
				    if ($(this).attr('sort') == 'up') {
				        mySorter.sort([[$(this).attr('class').replace(' hide', ''), -1], ["Age", -1]])();
				        $(this).attr('sort', 'down')
				    } else {
				        mySorter.sort([[$(this).attr('class').replace(' hide', ''), 1], ["Age", -1]])();
				        $(this).attr('sort', 'up');
				    }

				    $table.find('tbody tr').removeClass('even');
				    $table.find('tbody tr:odd').addClass('even');
				});
                $(this).hover(function() {
                    $(this).css('cursor', 'pointer');
                },
				function() {
				    $(this).css('cursor', 'default');
				});
            }
        });*/
    }

    var createTableAndUI = function(object) {
        var fields = config.schema.fields || {};
        var format = config.schema.formatFields || {};
        var rowFormat = config.schema.formatRows || {};
        var strRow, arrTable = [];

        config.container.find('.dataTable').remove();
		
		var fieldOrder = [];
		for (var field in fields) {
			var f = fields[field];
			fieldOrder.push({name:field, text:f.text, index:f.index});
		}
		fieldOrder.sort(function(a, b){ return a.index < b.index ? -1 : 1 });
		
		arrTable.push('<table class="dataTable"><thead>');
        strRow = '<tr>';
		
        for (var i=0; i<fieldOrder.length; i++) {
            strRow += '<th class="' + fieldOrder[i].name + '">' + fieldOrder[i].text + '</th>';
        }

        strRow += '</tr>';
		
		arrTable.push(strRow);
		arrTable.push('</thead><tbody>');

        if (object && object.length) {
            var rowDisplay, rowAttributes, value;
            for (i = 0; i < object.length; i++) {

                rowDisplay = ('display' in rowFormat) ? rowFormat['display'](object[i]) : true;
                rowAttributes = ('attributes' in rowFormat) ? rowFormat['attributes'](object[i]) : '';

                if (rowDisplay) {
                    strRow = '';
                    if (rowAttributes) {
                        strRow += '<tr ' + rowAttributes + '>';
                    } else {
                        strRow += '<tr>';
                    }

                    for (var j=0; j<fieldOrder.length; j++) {
                        value = '';
                        if (!(fieldOrder[j].name.substr(0, 4) == 'usr_')) value = object[i][fieldOrder[j].name];

                        if (value != null) {
                            for (var fieldFormat in format) {
                                if (fieldOrder[j].name == fieldFormat) {
                                    value = format[fieldFormat](value, object[i]);
                                    break;
                                }
                            }
                        }
                        strRow += '<td class="' + fieldOrder[j].name + '">' + (value == null ? '' : value) + '</td>';
                    }
                    strRow += '</tr>';
					arrTable.push(strRow);
                }
            }
        }

		arrTable.push('</tbody></table>');
		$table = $(arrTable.join(''));
        config.container.append($table);
        buildFilterUI();
    }
	
    var swapColumns = function(showCols) {
        var $cloneable = $table.find('.' + showCols);
		var $showCols = $cloneable.clone();
		
		//var $showCols = $table.find('.' + showCols).clone();
        var insertClass;
        var $hideCols = $table.find('.hide');
        var remove = true;
        var sameCol = $hideCols.hasClass(showCols);
		
        if (!$hideCols.length) {
            $hideCols = $table.find('tr td:first-child, tr:not(".spacerRow") th:first-child');
            remove = false;
            sameCol = false;
        }

        if (!sameCol) {
            var $rows = $table.find('tr');
            for (var i = 0; i < $table.find('tr:not(".spacerRow")').length; i++) {
                $($showCols[i]).insertBefore($hideCols[i]);
            }

            $showCols.addClass('hide');
            $showCols.show();
            if (remove) {
                $hideCols.remove();
            }
        }
		
		$showCols.filter('th').click(function(){
			$cloneable.filter('th').click();
		});
	}

    var hideUI = function(animate) {
        if (animate) {
            if ($resultsContainer) $resultsContainer.fadeOut();
            if ($toggleContainer) $toggleContainer.fadeOut();
        } else {
            if ($resultsContainer) $resultsContainer.hide();
            if ($toggleContainer) $toggleContainer.hide();
        }
    }
	
	var parseInput = function(){
		var keys = [];
		//text.replace(/\w+([,-]\w+)*|"[\w\s,-]*"/g, function($0) {
		//text.replace(/[A-Za-z0-9-,.]+([A-Za-z0-9-,.])*|"[A-Za-z0-9-,.\s]+"/g, function($0) {
		if (config.simpleMode){
			var text = $.trim($filter.find('.input-text').val());
			text.replace(/[A-Za-z0-9-_,.]+([A-Za-z0-9-_,.])*|"[A-Za-z0-9-_,.\s]+"/g, function($0) {
				$0 = $0.replace(/_/g, '[_]');
				keys.push($0.replace(/"/g, ''));
			});
			
		}else{
			$('.input-text-field').each(function(){ 
				var arrText = $(this).text().split(',');
				var newText = [];
				for (var i = 0; i < arrText.length; i++){
					var t = $.trim(arrText[i])
					if (t.length){
						newText.push(t);
					}
				}
				newText = $.trim(newText.join(',').replace(/"/g, ''));
				if (newText.length){
					keys.push(newText);
				}
				
			});
		}
		return keys;
	}
	
    var searchTable = function(forceSearch, callback) {
        var userFilter = [];
        keyNum = 0;

        var keys = parseInput();

        var keysChanged = 0;
        var keysChangedIndex = -1;
        var mappedKeys = '';
		
		if (forceSearch === undefined) forceSearch = false;
		
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] != '') {
                var val = keys[i], col = '', type = 'contains', typeOveride = '';
				if (val.match(/\w\.\./)) typeOveride = 'range';
                var keyIndex = getKeyIndex(val);
                if (keyIndex >= 0) {
                    mappedKeys += keyIndex + '|';
                    var key = UIStruct.results.keys[keyIndex];
                    if (key.selected.length && !(key.selected in config.schema.fields)) {
                        key.selected = '', type = key.type = 'contains', key.collapse = '';
                    }
					
					if (!typeOveride && key.type == 'range') key.type = 'contains';
					key.type = typeOveride || key.type;
                    val = key.name, col = key.selected, type = key.type;
                } else {
                    keysChanged++;
                    if (keysChangedIndex) keysChangedIndex = i;
					//if (!UIStruct.results.keys) UIStruct.results.keys = []
					//UIStruct.results.keys.push({name: valOveride || val, selected:col, type:typeOveride || type});
                }
                userFilter.push({ value: val, column: col, type: typeOveride || type});
            }
        }

        //map changed key in input to unmapped key in stucture
        if (keysChanged == 1 && UIStruct.results.keys && userFilter.length == UIStruct.results.keys.length) {
            for (var i = 0; i < mappedKeys.length; i++) {
                if (mappedKeys.indexOf(i + '|') < 0) {
					var typeOveride = '';
                    var key = UIStruct.results.keys[i];
					var name = userFilter[keysChangedIndex].value;
					if (name.match(/\w\.\./)) typeOveride = 'range';	
					if (!typeOveride && key.type == 'range') typeOveride = 'contains';
					key.type = typeOveride || key.type;
                    userFilter[keysChangedIndex].column = key.selected;
                    userFilter[keysChangedIndex].type = key.type;         
                    break;
                }
            }
        }
		
		//convert object to array
		var hiddenFilterArray = [];
		for (var field in config.hiddenFilter){
			hiddenFilterArray.push(config.hiddenFilter[field]);
		}
		
        var filter = hiddenFilterArray.concat(userFilter);
        if (forceSearch || (JSON.stringify(prevFilter) != JSON.stringify(filter))) {
            requestStack.push(function() {
                prevFilter = filter;
				waitingForResults = true;
				config.getSearchResults(filter, callback);
				$search.css('background', 'url(\'/webasp/images/oespinner-small.gif\') center no-repeat #fff');			
            });

            if (forceSearch || (!waitingForResults && requestStack.length)) {
                (requestStack.pop())();
            }
        }

    }

    var getKeyIndex = function(name) {
        var idx = -1;
		for (var i = 0; i < UIStruct.results.keys.length; i++) {
			if (UIStruct.results.keys[i].name == name) {
				idx = i;
				break;
			}
		}
        return idx;
    }
	
	var showAdvanced = function(){
		var removeKey = function(){
			var $this = $(this);
			var $container = $this.parents('.local');
			$this.parent().remove();
			if (!$container.find('.range').length){ 
				$container.removeClass('hasBetween');
			}
			return false;
		}
		
		var addKey = function(){
			var $this = $(this);
			var $key = $this.parents('.local').find('input[type=text]');
			var $emptyKeys = $key.filter(function() { return $.trim($(this).val()) == ""; });
			if (!$emptyKeys.length){
				var $removeKey = $('<a class="removeKey" href="javascript:;" />')
					.click(removeKey)
					.hover(function(){$(this).parents('.row').addClass('hover')}, function(){$(this).parents('.row').removeClass('hover')});
				var $newRow = $(generateRow());
				$this.parents('.local').append($newRow);
				$this.parents('.row').removeClass('add').addClass('remove').append($removeKey);
				setTimeout(function(){$newRow.find('input[type=text]').focus()}, 100);
			}else{
				if ($emptyKeys.length)
					$emptyKeys.get(0).focus();		
			}
			return false;
		}

		var generateColSelect = function (selected){
			var strSelect = '<span><span class="select selected"><span class="text" /></span>';
			strSelect += '<select class="styled selected">';
			strSelect += '<option value="">' + tablefilter.i18n[tablefilter.defaults.i18n].anyCategory + '</option>';
			var list = [];
			for (var i = 0; i < config.searchFields.length; i++){
				list.push({name: stripHTML(config.schema.fields[config.searchFields[i]].text), col:config.searchFields[i]});
			}
			list.sort(function(a, b){return (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)) });
			for (var i = 0; i < list.length; i++){
				strSelect += '<option value="' + list[i].col + '">' + list[i].name + '</option>';
			}
			strSelect += '</select></span>';
			
			var $select = $(strSelect);
			$select.find('select').val(selected)
				.change(function(){ $(this).parent().find('.text').html($(this).find('option:selected').text()); $(this).trigger('blur'); })
				.bind('mousedown', function(){ $(this).parent().find('.select').addClass('focus') })
				.blur(function(){ $(this).parent().find('.select').removeClass('focus') })
				.hover(function(){ $(this).parent().find('.select').addClass('hover') }, function(){ $(this).parent().find('.select').removeClass('hover') });	
			
			$select.find('.text').html($select.find('option:selected').text());
			return $select;
		}
		
		var generateTypeSelect = function (selected){

			var strSelect = '<span><span class="select type"><span class="text" /></span>';
			strSelect += '<select class="styled type">';
			for (var type in searchTypes){
				strSelect += '<option value="' + type + '" ' + (type == selected ? 'selected="selected"' : '') + '>' + tablefilter.i18n[tablefilter.defaults.i18n][type] + '</option>';
			}
			strSelect += '</select></span>';
			
			var $select = $(strSelect);
			$select.find('select').val(selected)
				.change(function(){ $(this).parent().find('.text').html($(this).find('option:selected').text()); $(this).trigger('blur'); })
				.bind('mousedown', function(){ $(this).parent().find('.select').addClass('focus') })
				.blur(function(){ $(this).parent().find('.select').removeClass('focus') })
				.hover(function(){ $(this).parent().find('.select').addClass('hover') }, function(){ $(this).parent().find('.select').removeClass('hover') });	
			
			$select.find('.text').html($select.find('option:selected').text());
			return $select;
		}
		
		var generateRow = function(key){
			var $row = $('<div class="row" />');
			var $removeKey = $('<a class="removeKey" href="javascript:;" />')
				.hover(function(){$(this).parents('.row').addClass('hover')}, function(){$(this).parents('.row').removeClass('hover')});
			if (key){
				$row.addClass('remove');
			}else{
				key = key || {selected:'', type:'', name:''};
				$row.addClass('add');
			}
			$removeKey.click(removeKey);

			var $typeSelect = $(generateTypeSelect(key.type));
			$typeSelect.find('select').change(function(){
				var $row = $(this).parents('.row');
				var $name = $row.find('.name');
				var $newInput = $([]);
				var $container = $row.parents('.ft-advancedContainer');
				if ($(this).val() == 'range'){		
					if (!$container.find('.range').length){ 
						//$container.parent().position({left: $container.position().left - 25, top:$container.position().top});
						$container.find('.local').addClass('hasBetween');
					}
						
					$newInput = $('<span class="range">' +
									'<input class="start" type="text" value="' + $name.val() + '">' + 
									'<input class="syntax" tabindex="-1" value=".." /> ' +
									'<input class="end" type="text" value="">' +
								'</span>');
					$row.append($newInput); 
					$name.remove();
				}else if (!$name.length){
					var $range = $row.find('.range');
					$newInput = $('<span class="single"><input class="name" type="text" value="' + $range.find('.start').val() + '" /></span>');
					$row.append($newInput); 
					$range.remove();
					if (!$container.find('.range').length){ 
						//$container.parent().position({left: $container.position().left + 25, top:$container.position().top});
						$container.find('.local').removeClass('hasBetween');
					}
				}

				$newInput.find('input').keydown(function(e){
					var code = e.which;
					if (code == 13){
						addKey.call(this);
					}
				});
				
				var $key = $row.find('input[type=text]');
				var $emptyKeys = $key.filter(function() { return $.trim($(this).val()) == ""; });
				
				if ($emptyKeys.length)
					$emptyKeys.get(0).focus();	
			});
			
			var $inputArea;
			if (key.type == 'range'){
				var range = key.name.split('..');
				$inputArea = $('<span class="range">' +
									'<input class="start" type="text" value="' + range[0] + '">' + 
									'<input class="syntax" tabindex="-1" value=".." /> ' +
									'<input class="end" type="text" value="' + range[1] + '">' +
								'</span>');
			}else{
				$inputArea = $('<span class="single"><input class="name" type="text" value="' + key.name + '" /></span>');
			}
			$inputArea.find('input').keydown(function(e){
				var code = e.which;
				if (code == 13){
					addKey.call(this);
				}
			});
			
			$row.append($(generateColSelect(key.selected))).append($typeSelect).append($inputArea);
			if ($row.hasClass('remove')){
				$row.append($removeKey);
			}
			
			return $row;
		}
		
		
		
        var $advancedUI;
		if ($(this).hasClass('vehicleMax')){
			$advancedUI =
				$('<div class="ft-advancedContainer">' +
					'<div class="pop-title">Vehicle Maximizer</div>' +
					'<div class="global-heading">Payment Options</div>' +
					'<div style="padding:0 8px">' + 
						'<table>' +
							'<tr><td>Monthly Payment:</td><td><input class="payment" type="text" style="width:85px" /></td></tr>' +
							'<tr><td>Down Payment:</td><td><input class="down" type="text" style="width:85px" /></td></tr>' +
						'</table>' +
					'</div>' +
					'<div style="padding:0 8px">' + 
					'</div>' +
					'<div class="search"><input class="vehMax" type="button" value="Search" /></div>' +
				'</div>');
        }else{
			$advancedUI =
				$('<div class="ft-advancedContainer">' +
					'<div class="pop-title">' + tablefilter.i18n[tablefilter.defaults.i18n].advancedSearch + '</div>' +
					'<div class="global-heading">' + tablefilter.i18n[tablefilter.defaults.i18n].searchOptions + '</div>' +
					'<div class="global"></div>' +
					'<div class="local-heading">' + tablefilter.i18n[tablefilter.defaults.i18n].createSearch + '</div>' +
					'<div class="local"></div>' +
					'<div class="search"><input class="advSearch lwButton" type="button" value="' + tablefilter.i18n[tablefilter.defaults.i18n].search + '" /></div>' +
				'</div>');
		}
		
		var $global = $advancedUI.find('.global');
		if (config.globalOptions.length){
			if ($globalOptions){
				$global.html($globalOptions);		
			}else{
				for (var i = 0; i < config.globalOptions.length; i++){
					$global.append($('<div class="row" />').append(config.globalOptions[i].ui));
				}
			}
		} else {
			$advancedUI.find('.global-heading').remove();
			$global.remove();
		}
		
		var $local = $advancedUI.find('.local');	
		if (UIStruct.results.keys){
			for (var i = 0; i < UIStruct.results.keys.length; i++){
				var key = UIStruct.results.keys[i];
				var $row = generateRow(key);	
				$local.append($row);
			}
		}
		$local.append(generateRow());
		
		//global function to be overriden by iPopup
		closePopup = function(){};
		$.ipopup({ 
			href:$advancedUI, 
			parent:(config.advancedContainer.length ? config.advancedContainer : config.container),
			onload: function(){
				if ($advancedUI.find('.add input').length){
					$advancedUI.find('.add input').get(0).focus();
				}
			}
		});
		
		if ($advancedUI.find('.range').length){ 
			$advancedUI.find('.local').addClass('hasBetween');
		}
		
		$advancedUI.find('.search .vehMax').click(function(e){	
			var payment = parseFloat($advancedUI.find('.payment').val()),
				down = parseFloat($advancedUI.find('.down').val()),
				keys = UIStruct.results.keys,
				min = parseFloat((payment * 24) + down).toFixed(2),
				max = parseFloat((payment * 48) + down).toFixed(2);
			
			keys.push({
				name: min + '..' + max, 
				selected: 'Price', 
				type: 'range', 
				cols:[], 
				collapse: ''
			});
			
			UIStruct.input.reDraw();
			if (typeof closePopup === 'function'){
				closePopup();
			}
			
			config.schema.fields['Lease'] = {text:'Lease', index:10.5}
			
			config.hiddenFilter = [{vehicleMax: true, down:down, payment:payment}]
			setTimeout(function(){searchTable(true)}, 300);
		});
		
		$advancedUI.find('.search .advSearch').click(function(e){	
			$(this).parent().parent().find('.add .removeKey').click();
			
			$advancedUI.find('.global .row').each(function(i){
				config.globalOptions[i].func.call($(this).contents(), config);
			});
			
			if (config.displayField.length){
				UIStruct.toggle.selected = config.displayField;
			}
			
			UIStruct.toggle.selected = (UIStruct.toggle.selected in config.schema.fields) ? UIStruct.toggle.selected : config.hiddenFields[0];
			
			var keys = [];
			var inputText = [];
			$advancedUI.find('.local .row').each(function(){
				var $this = $(this);				
				var selected = $this.find('select.selected').val();
				var type = $this.find('select.type').val();
				var start = $.trim($this.find('.start').val());
				var end = $.trim($this.find('.end').val());
				type = type == 'range' && (!start || !end) ? 'contains' : type;
				var name = type == 'range' ? start + '..' + end : $.trim($this.find('.name').val());
				if (name.length){		
					keys.push({
						name: name, 
						selected: selected, 
						type: type, 
						cols:[], 
						collapse: ''
					});
				}
			});
			UIStruct.results.keys = keys;
			UIStruct.input.reDraw();
			$globalOptions = $global.contents();
			$localOptions = $local.contents().filter('.remove');
			if (typeof closePopup === 'function'){
				closePopup();
			}
			
			setTimeout(function(){searchTable(true)}, 300);
			//$filter.focus();
			return false;
		});
	}
	
	
    UIStruct.input.reDraw = function() {
		if (!UIStruct.results.keys) return;
		if (config.simpleMode){
			var text = [];
			for (var i = 0; i < UIStruct.results.keys.length; i++){
				var key = UIStruct.results.keys[i].name;
				if (key.indexOf(' ') >= 0)
					key = '"' + key + '"';
				text.push(key);
			}
			$filter.find('.input-text').val(text.join(' '));
		}else{
			$input.empty();
			for (var i = 0; i < UIStruct.results.keys.length; i++){
				var name = UIStruct.results.keys[i].name;
				addKey(false, name);
				saveEntries();
			}
			addKey(true);
			
			var ubound = 60;
			if (($filter.width() - $input.width()) < 20){
				$filter.width($filter.width() + 50);
			}else{
				if (($filter.width() - $input.width()) >= 100){
					var lbound = $input.width() + 20;
					$filter.css('width', (lbound < orgFilterWidth ? orgFilterWidth : lbound) + 'px');
				}
			}
		}
	}
	
    UIStruct.results.reDraw = function(show, fromKeypress) {

        //draw results area
        var resultsUI = UIStruct.results;
        if (!config.container.is(':visible') || UIStruct.results.totalRows === undefined) return;

        if (!$resultsContainer.length) {
            $resultsContainer = $('<ul class="ft-resultsContainer"/>');
            $resultsContainer.bind('mouseenter', function(){
				if (resultsUITimeout) clearTimeout(resultsUITimeout);
			});
			$resultsContainer.bind('mouseleave', function(){
				resultsUITimeout = setTimeout(function() { $resultsContainer.fadeOut() }, 2000);
			});
            $filter.parent().append($resultsContainer);
        }

        var left = $filter.position().left;
        var top = $filter.position().top + $filter.outerHeight() - 1;
        $resultsContainer.css({ 'left': left, 'top': top });
        $resultsContainer.width($filter.outerWidth() - 2);
        $resultsContainer.empty();
	   
		if (resultsUI.keys && resultsUI.keys.length){
			for (var i = 0; i < resultsUI.keys.length; i++) {
				var key = resultsUI.keys[i];
				var category = '';
				var collapse;
				var selected;
				if (key.collapse === '' && key.cols.length === 1){
					collapse = true;
					selected = key.cols[0].name;
				}else{
					collapse = key.collapse;
					selected = key.selected;
				}
				if (selected.length || collapse || (key.type != 'contains' && key.type != 'range')) {
					var type = '';
					if (key.type === 'begins'){
						type = tablefilter.i18n[tablefilter.defaults.i18n].begins;
					}else if (key.type === 'ends'){
						type = tablefilter.i18n[tablefilter.defaults.i18n].ends;
					}else if (key.type == 'range'){
						type = tablefilter.i18n[tablefilter.defaults.i18n].range;
					}else if (key.type == 'exact'){
						type = tablefilter.i18n[tablefilter.defaults.i18n].exact;
					}else if (key.type == 'not'){
						type = tablefilter.i18n[tablefilter.defaults.i18n].not;
					}else{
						type = tablefilter.i18n[tablefilter.defaults.i18n].contains;
					}
					var colName = selected.length ? stripHTML(config.schema.fields[selected].text) : 'Any Category';
					if (key.name.length + type.length + colName.length > 30){ 
						colName = colName.substr(0, 30 - key.name.length - type.length) + '...'
					}
					category = '<li key="' + key.name + '" class="category" collapse="' + (selected.length || collapse ? 'close' : 'open') + '"><div class="wrapper">' + 
								'<span class="selectedCol">' + colName + '</span> <a class="type closed" href="javascript:;">'+type+'</a> "' + key.name + '"</div>';
				}
				if (!(collapse || selected.length)) {
					category += '<ul>'
					for (var j = 0; j < key.cols.length; j++) {
						var col = key.cols[j];
						var style = '';
						if (col.hits > config.maxRows) style = 'style="color:red"';
						category += '<li ' + (j == 0 ? 'style="border-top:1px solid #dcdcdc"' : '') + '><a col="' + col.name + '" class="searchField" href="javascript:;">' + stripHTML(config.schema.fields[col.name].text) + '</a><span class="hits" '+style+'>' + col.hits + ' hits</span></li>';
					}
					category += '</ul>';
				}
				category += '</li>';
				var $category = $(category).css('z-index', 400 - i);
				if (i == 0) $category.css('border-top', 'none');
				$resultsContainer.append($category);			
			}
		}
		
        //register events	
		$resultsContainer.find('.category .type').click(function(e) {			
			var $this = $(this);
			var $typePicker = $this.parent().find('ul.typePicker');

			if (!$typePicker.length){
				$typePicker = $('<ul class="typePicker"/>');
				for (var type in searchTypes){
					$typePicker.append('<li class="' + type + '">' + tablefilter.i18n[tablefilter.defaults.i18n][type] + '</li>');
				}		
				$this.parent().append($typePicker);
				$typePicker.css({top: '15px', left: $this.position().left - 5 + 'px'});
				
				//register events
				$typePicker.find('li').click(function(){
					var keyIdx = getKeyIndex($this.parent().parent().attr('key'));
					var key = resultsUI.keys[keyIdx];
					if (!key.selected.length){
						key.selected = key.cols[0].name;
						key.collapse = true;
					}
					key.type = $(this).attr('class');
					var idx = key.name.indexOf('..')
					if (key.type == 'range' && idx < 0){
						var keystart = key.name;
						key.name = keystart + '..' + keystart;
						setTimeout(function(){
							if (config.simpleMode){
								var idx = $filter.find('.input-text').val().indexOf(keystart + '..');
								$filter.find('.input-text').caret(idx + keystart.length + 2, idx + key.name.length);
							}else{
								var inputKey = $($input.find('.input-text-field')[keyIdx]);
								var idx = inputKey.text().indexOf('..');
								inputKey.focus();
								inputKey.caret(idx + 2, key.name.length);
							}
						}, 100);
					}else if (key.type != 'range' && idx > 0){
						key.name = key.name.substr(0, idx);
					}
					UIStruct.input.reDraw();
					UIStruct.results.reDraw(true);
					searchTable(false, function(){$resultsContainer.trigger('mouseenter')});
				});
			}
	
			if ($this.hasClass('closed')){		
				$('ul.typePicker', $resultsContainer).hide();
				$resultsContainer.find('.category .type').addClass('closed');
				$typePicker.show();
				$this.removeClass('closed')
			}else{
				$typePicker.hide();
				$this.addClass('closed')
			}
			
			return false;
		});
		
        $resultsContainer.find('.category').click(function() {
            var key = resultsUI.keys[getKeyIndex($(this).attr('key'))];
            if (key.collapse || key.collapse === '') {
                key.selected = '';
				key.type = 'contains';
				key.collapse = false;
				searchTable(false, function(){$resultsContainer.trigger('mouseenter')});
				UIStruct.results.reDraw(true);
            }
            //return false;
        });

        $resultsContainer.find('a.searchField').click(function() {
            var key = resultsUI.keys[getKeyIndex($(this).parent().parent().parent().attr('key'))];
            key.selected = $(this).attr('col');
            key.collapse = true;
            UIStruct.results.reDraw(true);
            UIStruct.toggle.selected = key.selected;
			searchTable(false, function(){$resultsContainer.trigger('mouseenter')});
            return false;
        });
		
        if (resultsUITimeout) clearTimeout(resultsUITimeout);
        resultsUITimeout = setTimeout(function() { $resultsContainer.fadeOut() }, 4000);
		
		if ($resultsContainer.is(':visible')){
			$resultsContainer.trigger('mouseenter')
		}
		
        if (show && resultsUI.keys && resultsUI.keys.length && (resultsUI.totalRows > config.maxRows || resultsUI.totalRows == 0 || !fromKeypress)) {
            $resultsContainer.show();
        } else {
            $resultsContainer.hide();
        }
	
    }

    UIStruct.toggle.reDraw = function(show) {
        var toggleUI = UIStruct.toggle;

        if (!$toggleContainer.length) {
            $toggleContainer = $('<ul class="ft-toggleContainer"/>');
            $toggle.parent().append($toggleContainer);
        }

        var top = $toggle.position().top + $toggle.outerHeight() - 1;
        var left = $toggle.position().left
        $toggleContainer.css({ 'top': top, 'left': left });

        $toggleContainer.empty();
        $toggleContainer.append('<li class="category">' + tablefilter.i18n[tablefilter.defaults.i18n].displayColumn + '</li>');
        var hasSelectedCol = false;
		config.hiddenFields.sort(function(a, b){return stripHTML(config.schema.fields[a].text) > stripHTML(config.schema.fields[b].text)});
        for (var i = 0; i < config.hiddenFields.length; i++) {
            var className = 'toggleField';
            if (toggleUI.selected == config.hiddenFields[i].text) {
                className += ' selected';
                hasSelectedCol = true;
            }
            $toggleContainer.append('<li class="' + config.hiddenFields[i] + '"><a class="' + className + '" href="javascript:;">' + stripHTML(config.schema.fields[config.hiddenFields[i]].text) + '</a></li>');
        }

        if (!hasSelectedCol) {
            $toggleContainer.find('.category').after('<li class="' + toggleUI.selected + '"><a class="toggleField selected" href="javascript:;"><span style="font-style:italic">' + stripHTML(config.schema.fields[toggleUI.selected].text) + '</span></a></li>');
        }

        //register events
        $toggleContainer.find('.toggleField').click(function() {
            toggleUI.selected = $(this).parent().attr('class');
            swapColumns(toggleUI.selected);
            toggleUI.reDraw(false);
        });

        if (show) {
            $toggleContainer.show();
        } else {
            $toggleContainer.hide();
        }
    }
	
    /**************     Main     **************/

    $.extend(config, defaults, settings);
    if (!config.getSearchResults || !config.schema) return;

	var ui = '<div class="ft-container" style="float:left">' +
			'<a class="ft-toggle" />' +
			(config.simpleMode ? 
				'<div class="ft-filter text">' +
					'<input type="text" class="input-text" />' +
					'<div class="ft-search" />' +
				'</div>'
			:	
				'<div class="ft-filter">' +
					'<ul class="input-holder" />' +
					'<div class="ft-search" />' +
				'</div>'
			) +
            '</div>' +
            (config.hiddenButtonAvancedSearch ?
                ''
            :
                '<div style="float:left;margin:2px 5px 0;padding-right:20px;position:relative;">' +
                '<br /><a class="ft-advanced" href="javascript:;">' + tablefilter.i18n[tablefilter.defaults.i18n].advancedSearch + '</a>' +
                '</div>') +
			'<div class="ft-resultText" />' +
			'<div class="ft-text" />';
	
    ui = config.container.css('position','relative').append(ui);
    $filter = $(ui).find('.ft-filter');
    $toggle = $(ui).find('.ft-toggle');
	$input = $(ui).find('.input-holder');
	$search = $(ui).find('.ft-search');
	$message = $(ui).find('.ft-message');
	$resultText = $(ui).find('.ft-resultText');
	orgFilterWidth = $filter.css('width').replace('px', '');
	$(ui).find('.ft-text').html(config.text);
	
	if (!config.displayField.length) config.displayField = config.hiddenFields[0];
    UIStruct.toggle.selected = config.displayField;

    createTableAndUI();
	if (config.simpleMode){
		setTimeout(function(){$filter.find('input').focus()}, 500);
	}else{
		setTimeout(function(){addKey(true)}, 500);
	}
	
	//register events
	if (config.simpleMode){
		$filter.find('.input-text').bind('keydown', keydownHandler);
	}
	
	$filter.click(function(){
		if (config.simpleMode){
			allowSplit = 1;
		}else{
			saveEntries();
		}
		addKey(true);
		if ($resultsContainer) {
            UIStruct.results.reDraw(true);

            if (resultsUITimeout) {
                clearTimeout(resultsUITimeout);
            }
            resultsUITimeout = setTimeout(function() { $resultsContainer.fadeOut() }, 4000);
        }

        if ($toggleContainer) {
            $toggleContainer.hide();
        }
	});

    $toggle.click(function() {
        if ($toggleContainer && $toggleContainer.is(':visible')) {
            $toggleContainer.hide();
        } else {
            UIStruct.toggle.reDraw(true);
        }

        if ($resultsContainer) {
            $resultsContainer.hide();
        }
    });

    $('.ft-advanced', ui).click(showAdvanced);
	
	$search.click(function(e){
		searchTable(true);
		e.stopPropagation();
	});
	
	$message.click(function(){
		$filter.click();
	});
	
    $(document).mousedown(function(e) {
		var $target = $(e.target);
        if (($target != ui && $target.parents('.ft-container', ui).length == 0) && 
			(!$target.hasClass('ipopup') && $target.parents('.ipopup').length == 0) &&
			(!$target.hasClass('ipopup-mask') && $target.parents('.ipopup-mask').length == 0)) {
			var $target = $(e.target);
            hideUI();
        }
    });

    /********     Public Functions     ********/

    return {
        redraw: function() {
            setTimeout(function() { addKey(true) }, 100);
        },
        filter: function(newSettings) {
            if (newSettings) {
                $.extend(config, defaults, newSettings);
            }
			
			if (config.displayField.length){
				UIStruct.toggle.selected = config.displayField;
			}
			
			UIStruct.toggle.selected = (UIStruct.toggle.selected in config.schema.fields) ? UIStruct.toggle.selected : config.hiddenFields[0];
			
            if (!config.getSearchResults || !config.schema) return;
			
			if ($globalOptions){
				$globalOptions.each(function(i){
					config.globalOptions[i].func.call($(this).contents(), config);
				});
			}
            searchTable();
        },
        process: function(result) {
            var stats = result ? result.stats : {totalRows: 0};
            var data = result ? result.data : [];
			UIStruct.results.totalRows = stats.totalRows;
			//want to process the keys in the order they were entered
			var keyOrder = parseInput();		
            var keys = [];
			var keyChanged = false;

			for (var i = 0; i < keyOrder.length; i++){
				var oldKeyIndex = getKeyIndex(keyOrder[i]);
				var oldKey = {selected:'', type:'contains', collapse:''};

				if (oldKeyIndex >= 0){
					oldKey = UIStruct.results.keys[oldKeyIndex];
					UIStruct.results.keys.splice(oldKeyIndex, 1);	
				}else{
					keyChanged = true;
				}

				var key = {}
				key.name = keyOrder[i];
				key.cols = [];			
				for (col in stats[keyOrder[i]]) {
					key.cols.push({ name: col, hits: stats[keyOrder[i]][col] });
				}
				key.cols.sort(function(a, b) { return b.hits - a.hits });
				
				var typeOveride = '';
				if (key.name.match(/\w\.\./)) typeOveride = 'range';
				
				key.selected = oldKey.selected;
				key.type = typeOveride || oldKey.type;
				key.collapse = oldKey.collapse;
				keys.push(key);
			}

			if (UIStruct.results.keys.length != 0){
				keyChanged = true;
			}
			
			UIStruct.results.keys = keys;

            waitingForResults = false;
            if (requestStack.length) {
                (requestStack.pop())();
                requestStack = [];
            }
			
			if (!waitingForResults){
				UIStruct.results.reDraw(true, keyChanged);
				UIStruct.toggle.reDraw(false);
				createTableAndUI(data);
				$search.css('background', 'url(\'/webasp/images/icons/magnifier.gif\') center no-repeat #fff');
						
				if (UIStruct.results.totalRows > config.maxRows) {
					//$resultText.hide().html('<span style="color:red;">Search returned too many results').fadeIn();
					$resultText.html('<span style="color:red;">Search returned too many results');
				} else {
					//$resultText.hide().html('Search returned ' + UIStruct.results.totalRows + ' results').fadeIn();
					$resultText.html('Search returned ' + UIStruct.results.totalRows + ' results');
				}
			}
			
			if (typeof callback === 'function'){
				callback.apply(config);
			}
        }
    }
};

tablefilter.defaults = {
	i18n: 'en'
};

tablefilter.i18n = {
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
		search: 'Search',
		searchOptions: 'Search Options',
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