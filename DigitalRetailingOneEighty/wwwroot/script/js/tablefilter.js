function filterTable(mobj, s, c, f, h, z, e){

	var masterObject = mobj, schema = s, container = c, fields = f, hiddenFields = h, zebra = z, example = e;
	var _ui = 	'<div class="ft-container" style="float:left">' +
					'<a class="ft-options" />' + 
					'<input type="text" class="ft-filter" />' +
					'<div class="floater" />'+
				'</div> <div class="ft-example" style="float:left;padding:6px;color:#505050;"></div><div style="clear:both"/>';
	var _css =	{
		container: {
			'z-index':400, 'position':'absolute'
		},
		mask: {
			'z-index':399, 'position':'absolute', 'top' :0, 'left': 0
		},
		floater:{
			'height': '1px', 'position': 'absolute', 'background-color': '#dadada'
		}
	};

	var _filterTimeout = null,
		_matchedTimeout = null,
		selectedViewCol = '',
		selectedSearchCols = [],
		table = null,
		lastSelected = '',
		ui = null,
		searchType = 'contains',
		fieldsContainer = null,
		matchedContainer = null,
		resultsMax = 100,
		filter = null,
		filterResult = {},
		containerWidth = 0,
		keyCollapse = {},
		optionClicked = {},
		allowSplit = 0;
		
	var createTable = function(object, fields, format, rowFormat){	
	
		var format = format || {};
		var rowFormat = rowFormat || {};
		var strRow;
		var drawRows = true;
		
		container.find('.dataTable').remove();
		if (!object.length){
			object = masterObject;
			drawRows = false;
		}
		
		var $table = $('<table class="dataTable"><thead></thead><tbody></tbody></table>');
		strRow =         '<tr>';
		
		for (var header in fields){
			 strRow +=        '<th class="' + header + '">' + fields[header] + '</th>';
		}
		
		strRow +=         '</tr>';
		$table.find('thead').append(strRow);
		
		var rowDisplay, rowAttributes, value;
		if (drawRows){
			for (i = 0; i < object.length; i++){
				
				rowDisplay = rowFormat.hasOwnProperty('Display') ? rowFormat['Display'](object[i]) : true;
				rowAttributes =  rowFormat.hasOwnProperty('Attributes') ? rowFormat['Attributes'](object[i]) : '';
				
				if (rowDisplay) {
					strRow = '';
					if (rowAttributes){
						strRow +=			'<tr ' + rowAttributes + '>';
					}else{
						strRow +=			'<tr>';
					}
					
					for (var field in fields){
						value = '';
						if (!(field.substr(0, 4) == 'usr_')) value = object[i][field];
						
						if (value != null){
							for (var fieldFormat in format){
								if (field == fieldFormat){
									value = format[fieldFormat](value, object[i]);
									break;
								}
							}
					   }
					   strRow +=        '<td class="' + field + '">' + (value == null ? '' : value) + '</td>';
					}
					strRow +=         '</tr>';
					
					var $row = $(strRow);
					
					if ((i + 1) % 2 == 0 && zebra){
						$row.addClass('even');
					}
					$row.data('rowdata', object[i]);
					$table.find('tbody').append($row);
					
				}
			}
		}
		table = $table;
		container.append($table);
	}
	
	var buildFilterUI = function(){
		var fieldsNum = 0;
						
		for (var f in fields){
			fieldsNum++;
		}

		if (!(selectedViewCol in fields)) selectedViewCol = hiddenFields[0];
		swapColumns(selectedViewCol);

		$(table).find('tr th:nth-child(2)').each(function(){
			$('<th class="spacerCol" style="border:none;background:transparent;width:1px;padding:0;"/>').insertBefore($(this));
		});
		
		$(table).find('tr td:nth-child(2)').each(function(){
			$('<td class="spacerCol" style="border:none;background:transparent;width:1px;padding:0;"/>').insertBefore($(this));
		});
		
		$(table).find('thead').prepend('<tr class="spacerRow" style="height:1px"><th style="height:1px;padding:0;border:none;background:#d8d8d8"/><th class="spacerCol" colspan="' + fieldsNum + '" style="border:none;background:transparent;padding:1px 0 0 0;" /></tr>');
		
		var mySorter = tableSort(table);
		$(table).find('th').each(function(k,v){
			if($(this).attr('class') != 'usr_Picture'){
				$(this).click(
				function(){
					if ($(this).attr('sort') == 'up'){
						mySorter.sort([[$(this).attr('class').replace(' hide', ''), -1],["Age", -1]])();
						$(this).attr('sort', 'down')					
					}else{
						mySorter.sort([[$(this).attr('class').replace(' hide', ''), 1],["Age", -1]])();
						$(this).attr('sort', 'up');	
					}
				
					$(table).find('tbody tr').removeClass('even');
					$(table).find('tbody tr:odd').addClass('even');
				});
				$(this).hover(function(){
					$(this).css('cursor', 'pointer');
				},
				function(){
					$(this).css('cursor', 'default');
				});
			}
		});
	}
	
	var updateFloater = function(){
		var $showCols = $(table).find('.' + selectedViewCol);
		var width =  $showCols.outerWidth() - 1;
		if (width > $('.ft-container', ui).outerWidth()){
			width = $('.ft-container', ui).outerWidth() - 1;
		}
		setTimeout(function() {
			if ($('.floater', ui).is(':visible')){
				$('.floater', ui).css({
					'height': '2px', 
					'position': 'absolute', 
					'background-color': '#dadada',
					'width': width,
					'top': $showCols.offset().top - 3,
					'left': $showCols.offset().left,
					'overflow':'hidden'
				});
			}
		}, 0);
	}

	var updateUI = function(show) {
		var $filter = $(ui).find('.ft-filter');

		if (!container.is(':visible')) return;
		if (!matchedContainer) {
			matchedContainer = $('<ul class="ft-matchedContainer"/>');
			$filter.parent().append(matchedContainer);
		}

		var left = $filter.offset().left;
		var top = $filter.offset().top + $filter.outerHeight() - 1;
		matchedContainer.css(_css.container).css({ 'left': left, 'top': top });
		matchedContainer.width($filter.width() + 13);
		matchedContainer.empty();

		if (filterResult.totalRows > resultsMax) {
			matchedContainer.append('<li class="totalrows red">Search returned too many results</li>');
		} else {
			matchedContainer.append('<li class="totalrows green">Search returned ' + filterResult.totalRows + ' results</li>');
		}

		var list = filterResult
		if (filterResult.totalRows == 0) {
			list = {}
			list['totalRows'] = 0
			for (var i = 0; i < selectedSearchCols.length; i++) {
				var key = {}
				var col = { count: 0 }
				key[selectedSearchCols[i].col] = col;
				list[selectedSearchCols[i].str] = key;
			}
		}

		for (var key in list) {
			if (key != 'totalRows') {
				var kc = keyCollapse[key] == '' ? 'open' : keyCollapse[key];
				var category = $('<li class="category"><a class="' + kc + '" href="javascript:;">"<span style="text-decoration:underline;">' + key + '</span>"<span class="foundin"> found in: </span><span class="selectedCol" /></a></li>');
				var displayVal = keyCollapse[key] == 'close' ? 'style="display:none"' : '';
				var strList = '<ul class="' + key + '" ' + displayVal + '>';
				var matchedCols = list[key];
				var hasSelected = false;
				var hasStartsWith = false;
				var matchedColsLength = 0;
				for (var col in matchedCols) {
					if (col.count > 0) {
						matchedColsLength++;
					}
				}
				for (var col in matchedCols) {
					var selected = '';
					for (var i = 0; i < selectedSearchCols.length; i++) {
						//if (selectedSearchCols[i].str == key && matchedColsLength == 1) {
						//	selectedSearchCols[i].col = col;
						//}
						if ((selectedSearchCols[i].str == key && selectedSearchCols[i].col == col && col != '') || (matchedColsLength == 1 && keyCollapse[key] == '')) {
							selected = 'selected';
							hasSelected = true;
						}
						if (selectedSearchCols[i].str == key && selectedSearchCols[i].type == 'begins') {
							hasStartsWith = true;
						}
					}

					if (col != '') {
						var className = 'rowCount';
						if ((matchedCols[col]).count > resultsMax) className = 'red rowCount';
						strList += '<li><a style="position:relative" class="searchField ' + selected + '" href="javascript:;"><span class="' + col + '"/>' + fields[col] + '</span><span class="' + className + '">' + (matchedCols[col]).count + ' hits</span></a></li>';
					}
				}
				strList += '</ul>';

				category.append(strList);
				matchedContainer.append(category);

				var selectedCol = '';
				for (var i = 0; i < selectedSearchCols.length; i++) {
					if (selectedSearchCols[i].str == key) {
						selectedCol = selectedSearchCols[i].col;
						break;
					}
				}

				if ((lastSelected == key && hasSelected && filterResult.totalRows > 0) || hasStartsWith) {
					var checked = '';
					if (hasStartsWith) checked = 'checked';

					var $startsWithUI = $('<div class="options"><div style="width:85px">' +
										'<input class="startsWith" id="sw" type="checkbox" ' + checked + '/><label for="sw" id="swLabel">Starts With</label>' +
									'</div></div>').css({ 'position': 'absolute', 'width': '85px', 'top': '-2px', 'left': category.parent().outerWidth() - 5 });
					category.append($startsWithUI);

					if (!optionClicked[key]) {
						$startsWithUI.css({ 'width': 0 });
						$startsWithUI.hide();
						var animate = (function(y) {
							var store = y;
							return function() {
								store.show(); store.animate({ 'width': '85px' }, 250);
							}
						})($startsWithUI);
						setTimeout(animate, 250);
					}
				}

				if (hasSelected) {
					var $list = $(category).find('ul');
					var $selected = $list.find('.selected');
					var $link = $(category).find('a.open');
					$list.hide();
					$link.find('.selectedCol').html(fields[$selected.find('span:first-child').attr('class')]);
					$link.find('.foundin').html(' :');
					$link.removeClass('open');
					$link.addClass('close');
				}
			}
		}
		if (show) {
			matchedContainer.show();
			$(container).append($('<div class="clickoff" />').css(_css.mask).height($(document).height()).width($(document).width() - 25).click(function() {
				$('.clickoff').remove();
				if (matchedContainer) matchedContainer.hide();
				if (fieldsContainer) fieldsContainer.hide();
			}));
			if (_matchedTimeout) {
				clearTimeout(_matchedTimeout);
			}
			_matchedTimeout = setTimeout(function() { matchedContainer.fadeOut(); $('.clickoff').remove(); }, 4000);


		} else {
			matchedContainer.hide();
		}

		updateFloater();

		container.find('.filtermsg').remove();
		if (filterResult.totalRows > resultsMax && $filter.val() == '') {
			container.append('<div class="filtermsg" style="margin-top:20px;text-align:center;">Search returned too many results<br /><a href="javascript:;" onclick="$(\'.ft-filter\').focus();">Please filter your results</a></div>');
		}
	}
	
	var swapColumns = function(showCols){
		var $showCols = $(table).find('.' + showCols).clone(true);
		var insertClass;
		var $hideCols = $(table).find('.hide');
		var remove = true;
		var sameCol = $hideCols.hasClass(showCols)
		if (!$hideCols.length){
			$hideCols = $(table).find('tr td:first-child, tr:not(".spacerRow") th:first-child');
			remove = false;		
			sameCol = false;
		}
	
		if (!sameCol){
			var $rows = $(table).find('tr');
			for (var i = 0; i < $(table).find('tr:not(".spacerRow")').length; i++){
				$($showCols[i]).insertBefore($hideCols[i]);
			}

			$showCols.addClass('hide');
			$showCols.show();
			if (remove){
				$hideCols.remove();
			}
		}
	}

	var searchTable = function(newSearch) {
		var sendVal = [];
		var displayUI = true;
		newSearch = newSearch === undefined ? false : newSearch;
		keyNum = 0;

		var text = $.trim($('.ft-filter', ui).val());

		var keys = [];
		text.replace(/\w+(,\w+)*|"[\w\s,]*"/g, function($0) {
			keys.push($0.replace(/"/g, ''));
		});
		var keysChanged = 0;
		var keysChangedIndex = -1;
		for (var i = 0; i < keys.length; i++) {
			if ($.trim(keys[i]) != '') {
				var found = false;
				var col = '';
				var type = 'contains';
				for (var j = 0; j < selectedSearchCols.length; j++) {
					if (keys[i] == selectedSearchCols[j].str) {
						found = true;
						col = selectedSearchCols[j].col;
						type = selectedSearchCols[j].type;
						if (!(col in fields)) {
							col = '';
							type = '';
							selectedSearchCols[j].col = '';
							selectedSearchCols[j].type = '';
						}
						break;
					}
				}
				if (!found) {
					keysChanged++;
					if (keysChangedIndex) keysChangedIndex = i;
				}
				sendVal.push({ str: keys[i], col: col, type: type });
				keyCollapse[keys[i]] = '';
			}
		}

		if (keysChanged == 1 && sendVal.length > 1 && sendVal.length == selectedSearchCols.length) {
			sendVal[keysChangedIndex].col = selectedSearchCols[keysChangedIndex].col;
			sendVal[keysChangedIndex].type = selectedSearchCols[keysChangedIndex].type;
			delete optionClicked[selectedSearchCols[keysChangedIndex].str];
			optionClicked[sendVal[keysChangedIndex].str] = true;
			lastSelected = sendVal[keysChangedIndex].str;
		}

		if (sendVal.length == 0) {
			optionClicked = {};
			returnVal = filter();
		} else {
			returnVal = filter(sendVal);
		}

		selectedSearchCols = sendVal;
		filterResult = returnVal.stats;
		createTable(returnVal.data, schema.fields, schema.formatFields, schema.formatRows);
		buildFilterUI();
		updateUI(displayUI);
	}

	var setFocus = function(){
		//fix for ie to make sure browser is done rendering before focusing
		setTimeout(function() {
			$('.ft-filter', ui).focus();
			$('.ft-filter', ui).caret($('.ft-filter', ui).val().length);
			setTimeout(function() {
				$('.ft-filter', ui).focus();
				$('.ft-filter', ui).caret($('.ft-filter', ui).val().length);
			}, 500);
		}, 500);

	}
	
	/************* MAIN *************/

	container.empty();
	//container.height(400);
	ui = container.append(_ui);
	$('.ft-example', ui).html(example); 
	$('.floater', container).css(_css.floater);
	filter = myfilter(masterObject, resultsMax, fields);
	selectedViewCol = hiddenFields[0];

	//$('.ft-filter', ui).val('Used ');
	searchTable(true);
	
	$('.searchField', ui).die();
	$('.category a', ui).die();
	$('.ft-matchedContainer', ui).die();
	$('.ft-matchedContainer .options input[type=checkbox]', ui).die();

	$('.ft-filter', ui).bind('paste', function() { searchTable(true) });
	$('.ft-filter', ui).keydown(
	function(e) {
		var code = e.which;

		if (code == 32) {
			var text = $(this).val();
			var splitKey = false;
			var field = $(this)[0];
			var caretPos = $('.ft-filter', ui).caret();

			var text = $(this).val();
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
				setTimeout(function() {
					$('.ft-filter', ui).caret(caretPos + 2);
				}, 1);
			}
		}


		if ((code >= 48 && code <= 57) || (code >= 96 && code <= 105) || //0-9 (including numpad)
			(code >= 65 && code <= 90) || //a-z
			(code == 32 || code == 16 || code == 8 || code == 46 || code == 187 || code == 189)) //space, shift, backspace, delete, +, -
		{
			if (_filterTimeout) {
				clearTimeout(_filterTimeout);
			}

			_filterTimeout = setTimeout(function() { searchTable(true) }, 400);
		} else if (code == 38 || code == 40) { //arrow up, down
			var matchedList = $(matchedContainer).find('.category li a:visible');
			var current = $(matchedContainer).find('.category li a.hover');
			var navPos = -1;
			if (current.length) {
				navPos = matchedList.index(current);
			}
			matchedList.removeClass('hover');

			var n = matchedList.length;

			if (_matchedTimeout) {
				clearTimeout(_matchedTimeout);
			}

			if (code == 38 && navPos < 0) navPos = 0;

			var dir = code == 40 ? 1 : -1;

			if (!matchedContainer.is(':visible')) {
				$(matchedList[navPos]).addClass('hover');
				matchedContainer.show();
				$(container).append($('<div class="clickoff" />').css(_css.mask).height($(document).height()).width($(document).width() - 25).click(function() {
					$('.clickoff').remove();
					if (matchedContainer) matchedContainer.hide();
					if (fieldsContainer) fieldsContainer.hide();
				}));
			} else {
				//fix for javascript modulo bug with negative values (i.e -1 % mod 5 = -1 but should be 4)
				navPos = (((navPos + dir) % n) + n) % n;
				$(matchedList[navPos]).addClass('hover');
			}
		} else if (code == 13) { //enter
			var current = $(matchedContainer).find('.category li a.hover');

			if (current.length) {
				current.trigger('click');
			} else {
				if (_filterTimeout) {
					clearTimeout(_filterTimeout);
				}

				_filterTimeout = setTimeout(function() { searchTable(true) }, 400);
			}
		}

		if (code == 37 || code == 39) { //left arrow, right arrow
			allowSplit = code;
		} else {
			allowSplit = 0;
		}
	});

	$('.ft-filter', ui).click(
	function() {
		if (matchedContainer) {
			matchedContainer.show();
			$(container).append($('<div class="clickoff" />').css(_css.mask).height($(document).height()).width($(document).width() - 25).click(function() {
				$('.clickoff').remove();
				if (matchedContainer) matchedContainer.hide();
				if (fieldsContainer) fieldsContainer.hide();
			}));

			if (_matchedTimeout) {
				clearTimeout(_matchedTimeout);
			}
			_matchedTimeout = setTimeout(function() { matchedContainer.fadeOut(); $('.clickoff').remove(); }, 4000);
		}

		if (fieldsContainer) {
			fieldsContainer.hide();
		}

		allowSplit = 1;
	});

	$('.searchField', ui).live('click', function(){
		var col = $(this).find('span:first-child').attr('class');
		var parent =  $(this).parent().parent();
		var key = parent.attr('class');

		for (var i = 0; i < selectedSearchCols.length; i++){
			if (selectedSearchCols[i].str == key){
				selectedSearchCols[i].col = col;
				break;
			}
		}
		
		parent.find('li a').each(function(){
			if ($(this).hasClass('selected')){
				$(this).removeClass('selected');
			}
		});
		
		$(this).addClass('selected');
		lastSelected = key;
		var showCols = col;
		selectedViewCol = col;	
		searchTable(false);
		swapColumns(showCols);

		return false;
	});
	
	$('.category a', ui).live('click', function(){
		var $list = $(this).parent().find('ul');
		var $selected = $list.find('.selected');
		var key = $list.attr('class');
		if ($list.is(':visible')){
			$list.hide();
			$(this).removeClass('open');
			$(this).addClass('close');
			 keyCollapse[key] = 'close';
		}else{
			if ($selected.length){
				$selected.removeClass('selected');
				$(this).find('.selectedCol').text('');
				for (var i = 0; i < selectedSearchCols.length; i++){
					if (selectedSearchCols[i].str == key){
						selectedSearchCols[i].col = '';
						selectedSearchCols[i].type = 'contains';
						break;
					}
				}
				keyCollapse[key] = 'open';
				searchTable(false);
			}

			$(this).removeClass('close');
			$(this).addClass('open');
			$list.show();
			keyCollapse[key] = 'open';
		}
		return false;
	});

	$('.ft-options', ui).click(
	function() {
		if (!fieldsContainer) {
			var top = $(this).offset().top + $(this).outerHeight() - 1;
			var left = $(this).offset().left
			fieldsContainer = $('<ul class="ft-optContainer"/>');
			fieldsContainer.css(_css.container).css({ 'top': top, 'left': left });

			fieldsContainer.append('<li class="category">Display Column</li>');

			for (var i = 0; i < hiddenFields.length; i++) {
				var className = 'viewField';
				if (selectedViewCol == hiddenFields[i]) className += ' selected';
				fieldsContainer.append('<li class="' + hiddenFields[i] + '"><a class="' + className + '" href="javascript:;">' + fields[hiddenFields[i]] + '</a></li>');
			}

			$(this).parent().append(fieldsContainer);
			$('.viewField').click(function() {
				var col = $(this).parent().attr('class');
				var showCols = $(this).parent().attr('class');
				if (col != selectedViewCol) {
					selectedViewCol = col;
					$(this).parent().parent().find('.selected').removeClass('selected');
					$(this).addClass('selected');
					swapColumns(showCols);
					$('.clickoff').remove();
					updateFloater();
				}
				if (fieldsContainer) fieldsContainer.hide();
				if (matchedContainer) {
					matchedContainer.hide();
					if (_matchedTimeout) {
						clearTimeout(_matchedTimeout);
					}
				}
				return false;
			});
			fieldsContainer.hide();
		}

		if (fieldsContainer.is(':visible')) {
			$('.clickoff').remove();
			fieldsContainer.hide();
		} else {
			$(container).append($('<div class="clickoff" />').css(_css.mask).height($(document).height()).width($(document).width() - 25).click(function() {
				$('.clickoff').remove();
				if (matchedContainer) matchedContainer.hide();
				if (fieldsContainer) fieldsContainer.hide();
			}));
			if (matchedContainer) matchedContainer.hide();

			fieldsContainer.show();
		}
	});
	
	$('.ft-matchedContainer', ui).live('mouseout', 
	function(){
		_matchedTimeout = setTimeout(function(){matchedContainer.fadeOut();$('.clickoff').remove();}, 1000);
	});
	
	$('.ft-matchedContainer', ui).live('mouseover', 
	function(){
		if (_matchedTimeout){
			clearTimeout(_matchedTimeout);
		}
	});

	$('.ft-container ul li a.searchField', ui).live('mouseover',
	function() {
		var matchedList = $(matchedContainer).find('.category li a:visible');
		matchedList.removeClass('hover');
		$(this).addClass('hover');
	});
		
	$('.ft-matchedContainer .options input[type=checkbox]', ui).live('click', 
	function(){
		var type = $(this).is(':checked') ? 'begins' : 'contains';
		var key = $(this).parent().parent().parent().find('ul').attr('class');
		
		for (var i = 0; i < selectedSearchCols.length; i++){
			if (selectedSearchCols[i].str == key){
				selectedSearchCols[i].type = type;
				break;
			}
		}	
		optionClicked[key] = true;
		searchTable(false);
	});

	$(window).resize(function() {
		updateFloater();
	});
	
	setFocus();

	return {
		updateUI: function() {
			updateUI(true);
			setFocus();
		},
		search: function(mobj, s, c, f, h, z, e) {
			masterObject = mobj, schema = s, container = c, fields = f, hiddenFields = h, zebra = z, example = e;
			$('.ft-example', ui).html(example);
			filter = myfilter(masterObject, resultsMax, fields);
			searchTable(false);
			setFocus();
		}
	}
}