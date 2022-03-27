
!function ($) {

	"use strict"; // jshint ;_;

	var DataGrid = function (element, options) {
		this.init(element, options);
	}

	// expose to global scope
	window.DataGrid = DataGrid;

	/* DATAGRID CLASS DEFINITION
	* =========================== */

	DataGrid.prototype = {

		constructor: DataGrid,

		init: function(element, options){
			var $element = this.$element = $(element);
			this.options = $.extend(true, {}, $.fn.datagrid.defaults, $element.data(), options);

			$element.html($(this.options.template));

			var $dataGridContainer = $element.find('.datagrid-container');

			this.$table = $('<table>');
			$dataGridContainer.html(this.$table);

			var that = this;

			this.fixedHeight = unwrapFunction.call(this, this.options.fixedHeight);
			if (this.fixedHeight) {
				var $scrollPane = $('<div class="datagrid-scrollpane">').addClass('fixed');
				var $shadowTop = $('<div class="scroll-shadow top">');
				var $shadowBottom = $('<div class="scroll-shadow bottom">');

				$dataGridContainer.wrap($scrollPane);
				$shadowTop.insertAfter($dataGridContainer);
				$shadowBottom.insertAfter($dataGridContainer);
				$dataGridContainer.addClass('fixed').css({ height: this.fixedHeight });

				var resizeTimeout;
				if (this.options.resize){
					$(window).bind('resize.datagrid', function(){
						if (resizeTimeout) clearTimeout(resizeTimeout);
						resizeTimeout = setTimeout(function(){
							that.calculateFixedWidth();
						}, that.options.resizeTimeout);
					});
				}

				var $scrollpane = that.$element.find('.datagrid-scrollpane');
				$dataGridContainer.bind('scroll.datagrid', function(){
					var $this = $(this);

					$scrollpane.toggleClass('shadowTop', $this.scrollTop() > 0 && that.options.shadowTop);
					$scrollpane.toggleClass('shadowBottom', $this.scrollTop() < $this.height() && that.options.shadowBottom);
					$scrollpane.find('.fixed-header').css({ 'left': -$this.scrollLeft() });

				});

				$element.on('rendered', function(){
					that.renderFixedComponents();
				});
			}

			// structure for storing which headers were rendered
			this.cachedHeaders = {};
			if (this.options.cacheHeaders){
				$element.on('rendered', function(){
					var cachedHeaders = that.cachedHeaders;
					for (var groupkey in cachedHeaders){
						that.$table.find('tbody tr.header[data-groupkey="' + groupkey + '"]').click();
					}
				});
			}

			if (this.options.showSearch){
				var $searchContainer = $element.find('.datagrid-controls'),
					$search = this.$search = $(this.options.searchTemplate);

				$searchContainer.html($search);
				var options = this.options.searchOptions;
				options.datagrid = this;

				// to avoid browser rendering issues
				//$search.hide();
				//setTimeout(function(){
					//$search.show().searchfield(options);
					$search.searchfield(options);
					$search.parents('.input-append').addClass('pull-left');
					$search.parents('form').addClass('pull-left');
				//}, 0);

				this.process = function(response){
					$search.searchfield('process', response);
				}
			}

			// default schema
			if (!this.options.schema){
				var schema = [];
				for (var field in this.options.data[0]){
					schema.push($.extend({}, this.options.field, { index: field }))
				}

				this.options.schema = schema;
			} else if (this.options.schema && typeof this.options.schema[0] === 'string') {
				for (var i = 0; i < this.options.schema.length; i++){
					this.options.schema[i] = $.extend({}, this.options.field, { index: this.options.schema[i] });
				}
			} else {
				for (var i = 0; i < this.options.schema.length; i++){
					this.options.schema[i] = $.extend({}, this.options.field, this.options.schema[i]);
				}
			}

			// datagrid controls
			this.$controls = $element.find('.datagrid-controls');
			if (unwrapFunction.call(this, this.options.showControls)){

				if (unwrapFunction.call(this, this.options.fluidLayout)) {
					$element.find('.datagrid-controls-container > .row')
						.removeClass('row')
						.addClass('row-fluid');
				}

				//wait for first datagrid render before drawing controls
				$element.one('rendered', function(){
					that.renderControls();
				});

				$element.delegate('.showHide', 'click.datagrid', function(){
					that.renderShowHideList();
				});

				$element.delegate('.showHide ul li', 'click.datagrid', function(){
					that.toggleField($(this).data('fieldid'));
				});

				$element.delegate('.groupBy', 'click.datagrid', function(){
					that.renderGroupByList();
				});

				$element.delegate('.groupBy ul li', 'click.datagrid', function(){
					that.groupByField($(this).data('fieldid'));
				});

				$element.delegate('.expandAll', 'click.datagrid', function(){
					that.expandAll();
				});

				$element.delegate('.collapseAll', 'click.datagrid', function(){
					that.collapseAll();
				});
			} else {
				this.$controls.hide();
			}

			// events


			$element.delegate('.sortable', 'click.datagrid', function(){
				var schema = that.options.schema,
					$target = $(this),
					field = schema[$target.data('fieldid')];

				if (!field || typeof field.sort !== 'function') return;

				for (var i = 0; i < schema.length; i++){
					if (schema[i] == field) continue;
					delete schema[i].sortDirection;
				}

				if (field.sortDirection == DataGrid.sortAsc){
					field.sortDirection = DataGrid.sortDesc;
				} else {
					field.sortDirection = DataGrid.sortAsc;
				}

				var sortFn = field.sort;
				if (sortFn === DataGrid.sortBy){
					sortFn = field.sort(field.index);
				}

				that.sortBy(sortFn, field.sortDirection);
			});

			$element.delegate('tbody tr:not(.header) td', 'click.datagrid', function(e){
				var $target = $(this),
					field = that.options.schema[$target.data('fieldid')];

				if (!field || typeof field.action !== 'function') return;

				var args = that.dataFor($target);
				args.push(e);
				field.action.apply(that, args);
			});

			if (this.options.responsive && window.matchMedia){
				var mediaQueries = this.options.mediaQueries,
					responsiveTimeout;

				var phoneCheck = window.matchMedia(mediaQueries.phone);
				if (phoneCheck.matches) widthChanged.call(that, 'phone');
				phoneCheck.addListener(function(mq){
					if (!mq.matches) return;
					if (responsiveTimeout) clearTimeout(responsiveTimeout);
					responsiveTimeout = setTimeout(function(){
						widthChanged.call(that, 'phone');
					}, that.options.mediaQueryTimeout);
				});

				var tabletCheck = window.matchMedia(mediaQueries.tablet);
				if (tabletCheck.matches) widthChanged.call(that, 'tablet');
				tabletCheck.addListener(function(mq){
					if (!mq.matches) return;
					if (responsiveTimeout) clearTimeout(responsiveTimeout);
					responsiveTimeout = setTimeout(function(){
						widthChanged.call(that, 'tablet');
					}, that.options.mediaQueryTimeout);
				});

				var desktopCheck = window.matchMedia(mediaQueries.desktop);
				if (desktopCheck.matches) widthChanged.call(that, 'desktop');
				desktopCheck.addListener(function(mq){
					if (!mq.matches) return;
					if (responsiveTimeout) clearTimeout(responsiveTimeout);
					responsiveTimeout = setTimeout(function(){
						widthChanged.call(that, 'desktop');
					}, that.options.mediaQueryTimeout);
				});
			}

			// publish events
			$element.triggerHandler('initialized');

			if (this.options.renderAfterInit && !(this.options.responsive && window.matchMedia)){
				this.render();
			}
		},

		setData: function(data){
			this.options.data = data;
		},

		getData: function(data){
			return this.options.data;
		},

		setOptions: function(options){
			this.options = $.extend(true, {}, this.options, options);
		},

		getOptions: function(){
			return this.options;
		},

		renderControls: function(){
			var $controls = $(this.options.controlsTemplate);
			if (!unwrapFunction.call(this, this.options.showGroupBy)){
				$controls.find('.groupBy, .expandAll, .collapseAll').remove();
			}
			this.$controls.append($controls);
		},

		renderShowHideList: function(){
			var $showHideList = this.$controls.find('.showHide ul'),
				schema = this.options.schema,
				r = [];

			r.push('<li class="nav-header">' + this.options.showHideTitle + '</li>');
			for (var i = 0; i < schema.length; i++){
				if (typeof schema[i].hidden !== 'function' && schema[i].allowHidden){
					r.push('<li data-fieldid="' + i + '"><a href="javascript:;">')
					if (!schema[i].hidden){
						r.push('<i class="glyphicon-ok" style="margin: 2px 4px 0 -14px; font-size: 10px"></i>');
					}
					r.push(unwrapFunction(schema[i].header, schema[i].index))
					r.push('</a></li>');
				}
			}

			$showHideList.html(r.join(''));
		},

		renderGroupByList: function(){
			var $groupByList = this.$controls.find('.groupBy ul'),
				schema = this.options.schema,
				r = [];

			r.push('<li class="nav-header">' + this.options.groupByTitle + '</li>');
			for (var i = 0; i < schema.length; i++){
				if (unwrapFunction(schema[i].allowGroupBy)){
					r.push('<li data-fieldid="' + i + '"><a href="javascript:;">')
					if (this.options.mutators.groupBy == schema[i].index){
						r.push('<i class="glyphicon-ok" style="margin: 2px 4px 0 -14px; font-size: 10px"></i>');
					}
					r.push(unwrapFunction(schema[i].header, schema[i].index))
					r.push('</a></li>');
				}
			}

			$groupByList.html(r.join(''));
		},

		calculateFixedWidth: function(){
			var $table = this.$element.find('.datagrid'),
				$fixedHeader = this.$element.find('.fixed-header'),
				$shadowTop = this.$element.find('.scroll-shadow.top'),
				$shadowBottom = this.$element.find('.scroll-shadow.bottom');

			$fixedHeader.width($table.width());

			$table.find('thead tr th').each(function(i){
				$fixedHeader.find('thead tr th:nth-child(' + (i + 1) + ')').width($(this).width());
			});

			$shadowTop.css({ top: $fixedHeader.height() });
			$shadowTop.width($fixedHeader.width());

			if (this.options.fixedFooter){
				var $fixedFooter = this.$element.find('.fixed-footer');

				$fixedFooter.width($table.width());

				$table.find('tfoot tr td').each(function(i){
					$fixedFooter.find('tfoot tr td:nth-child(' + (i + 1) + ')').width($(this).width());
				});

				$shadowBottom.css({ bottom: $fixedFooter.height() });
				$shadowBottom.width($fixedFooter.width());
			}
		},

		renderFixedComponents: function(){
			this.$element.find('.fixed-header, .fixed-footer').remove();

			var $fixedHeader = $('<table>'),
				$thead = this.$table.find('thead');

			$fixedHeader
				.attr('class', this.$table.attr('class'))
				.removeClass('datagrid')
				.addClass('fixed-header')
				.css({ margin: 0 });

			//this.$table.css({ position: 'absolute', 'margin-top': -$thead.height() });
			$fixedHeader.html($thead.clone());
			$fixedHeader.prependTo(this.$element.find('.datagrid-scrollpane'));
			$thead.removeClass('empty');

			if (this.options.fixedFooter){
				var $fixedFooter = $('<table>'),
					$tfoot = this.$table.find('tfoot');

				$fixedFooter
					.attr('class', this.$table.attr('class'))
					.removeClass('datagrid')
					.addClass('fixed-footer')
					.css({ margin: 0 });

				$fixedFooter.html($tfoot.clone());
				$tfoot.css({ visibility: 'hidden', 'border-color': 'transparent' });
				$tfoot.find('td').css({ visibility: 'hidden', 'border-color': 'transparent' });
				$fixedFooter.appendTo(this.$element.find('.datagrid-scrollpane'));
			}

			this.calculateFixedWidth();
		},

		renderHeader: function(){
			var schema = this.options.schema,
				r = [];

			r.push('<tr>');
			for (var i = 0; i < schema.length; i++) {
				if (unwrapFunction(schema[i].hidden)) continue;

				r.push('<th');

				var classNames = [];
				if (schema[i].sort) {
					classNames.push('sortable');
					if (schema[i].sortDirection == DataGrid.sortAsc){
						classNames.push('sortAsc');
					} else if (schema[i].sortDirection == DataGrid.sortDesc){
						classNames.push('sortDesc');
					}
				}

				if (schema[i].className) classNames.push(unwrapFunction(schema[i].className));
				r.push(' class="' + classNames.join(' ') + '"');
				if (schema[i].width) r.push(' style="width: ' + unwrapFunction(schema[i].width) + '"')
				r.push(' data-fieldid="' + i + '"');
				r.push('>');
				var header = unwrapFunction(schema[i].header, schema[i].index);
				if (!header && header !== 0) header = '&nbsp;'; //fix for quirks mode tables
				r.push(header);
				r.push('</th>');
			}
			r.push('</tr>');

			return r.join('');
		},

		renderBody: function(data, groupId){
			var schema = this.options.schema,
				r = [];

			for (var i = 0; i < data.length; i++) {
				r.push('<tr data-index="' + i + '"');

				if (typeof groupId !== 'undefined') r.push(' data-group="' + groupId + '"');

				var classNames = [];
				if (this.options.pianoKey) classNames.push(i % 2 ? 'even' : 'odd');
				if (this.options.rowClassName) classNames.push(unwrapFunction.call(this, this.options.rowClassName, [ i, data[i] ]));
				if (classNames.length) r.push(' class="' + classNames.join(' ') + '"');

				r.push('>');

				for (var j = 0; j < schema.length; j++) {
					if (unwrapFunction(schema[j].hidden)) continue;

					var classNames = [];

					r.push('<td');
					if (schema[j].className) classNames.push(unwrapFunction(schema[j].className, [ data[i][schema[j].index], data[i] ]))
					r.push(' class="' + classNames.join(' ') + '"');
					if (schema[j].width) r.push(' style="width: ' + unwrapFunction(schema[j].width) + '"')
					r.push(' data-fieldid="' + j + '"');
					r.push('>');
					var cell = unwrapFunction(schema[j].view, [ data[i][schema[j].index], data[i] ]);
					if (!cell && cell !== 0) cell = '&nbsp;'; //fix for quirks mode tables
					r.push(cell)
					r.push('</td>');
				}

				r.push('</tr>');
			}

			return r.join('');
		},

		renderFooter: function(data){
			var schema = this.options.schema,
				r = [],
				colspan = 0,
				renderedText = false;

			r.push('<tr>');
			for (var j = 0; j < schema.length; j++){
				if (!unwrapFunction(schema[j].hidden)) {
					if (!schema[j].aggregate){
						colspan++;
					}
				}

				if (schema[j].aggregate || j == schema.length - 1){
					r.push('<td colspan="' + colspan + '">');
					if (!renderedText){
						r.push('<span>' + unwrapFunction(this.options.footerText, JsLinq(data)) + '</span>');
						renderedText = true;
					} else {
						r.push('&nbsp;');
					}
					r.push('</td>');
					colspan = 0;

					if (schema[j].aggregate){
						r.push('<td>' + unwrapFunction(schema[j].aggregate, [ schema[j].index, JsLinq(data) ]) + '</td>');
					}
				}
			}
			r.push('</tr>');
			return r.join('');
		},

		render: function(){
			var schema = this.options.schema,
				data = this.options.data;

			var $table = $('<table class="datagrid table">');

			if (this.options.striped){
				$table.addClass('table-striped');
			}

			var dataMutated = this.dataMutated = applyMutators.call(this);

			var $header = $('<thead>'),
				$body  = $('<tbody>'),
				$footer = $('<tfoot>');

			$header.html(this.renderHeader());
			if (dataMutated.length){
				if (this.options.mutators.groupBy){
					// grouped data
					var rows;
					for (var i = 0; i < dataMutated.length; i++) {
						//Generate group header

						var $tr = $('<tr class="header collapsed" data-group="' + i + '" data-groupkey="' + dataMutated[i].key + '">'),
							colspan = 0,
							renderedText = false;


						for (var j = 0; j < schema.length; j++){
							if (unwrapFunction(schema[j].hidden) && j !== schema.length - 1) continue;

							if (!schema[j].aggregate){
								colspan++;
							}

							if (schema[j].aggregate || j == schema.length - 1){
								var r = ['<td colspan="' + colspan + '">'];
								if (!renderedText){
									renderedText = true;
									r.push('<span>' + unwrapFunction(this.options.groupByText, [ dataMutated[i].key, this.options.mutators.groupBy, dataMutated[i] ]) + '</span>');
								} else {
									r.push('&nbsp;');
								}
								r.push('</td>');

								colspan = 0;
								$tr.append(r.join(''));

								if (schema[j].aggregate){
									$tr.append('<td>' + unwrapFunction(schema[j].aggregate, [ schema[j].index, dataMutated[i] ]) + '</td>');
								}
							}
						}

						if (this.options.chevronPosition === 'right'){
							$tr.find('td:last').append(' <i class="glyphicon-chevron-down pull-right"></i>');
						} else if (this.options.chevronPosition === 'left'){
							$tr.find('td:first').prepend('<i class="glyphicon-chevron-down"></i> ');
						}

						$body.append($tr);

						//Generate group data view and link to header
						var that = this;
						(function (index, $headerRow) {
							rows = function () {
								var dataRows = $(that.renderBody(dataMutated[index], index));
								dataRows.insertAfter($headerRow);
								return dataRows;
							};
						})(i, $tr);

						(function (rows, $tr) {
							$tr.click(function () {
								var collapsed = $tr.hasClass("collapsed");
								if (typeof rows === 'function') {
									rows = rows();
								}

								if (collapsed) { rows.removeClass('hidden'); }
								else { rows.addClass('hidden'); }

								$tr.toggleClass("collapsed", !collapsed);

								if (collapsed){
									// icon-delcartion needs to be first for icon fonts ???
									var $icon = $tr.find('i.glyphicon-chevron-down').removeClass('glyphicon-chevron-down');
									$icon.attr('class', 'glyphicon-chevron-up ' + $icon.attr('class'));
									that.cachedHeaders[$tr.data('groupkey')] = true;
								} else {
									var $icon = $tr.find('i.glyphicon-chevron-up').removeClass('glyphicon-chevron-up');
									$icon.attr('class', 'glyphicon-chevron-down ' + $icon.attr('class'));
									delete that.cachedHeaders[$tr.data('groupkey')];
								}

								if (that.fixedHeight){
									that.calculateFixedWidth();
								}

							});//.css('cursor', 'pointer');
						})(rows, $tr);
					}
				} else {
					$body.html(this.renderBody(dataMutated));
				}
			} else {
				$header.addClass('empty');
			}


			$table.html($header);
			$table.append($body);

			if (this.options.showFooter){
				$footer.html(this.renderFooter(dataMutated));
				$table.append($footer);
			}

			this.$table.replaceWith($table);
			this.$table = $table;

			// publish events
			this.$element.triggerHandler('rendered');
		},

		displayError: function(error){
			this.options.data = [];
			this.process([]);
			var errorRow = '<tr><td colspan="' + this.$table.find('thead th').length + '"><div class="text-error">' + error + '<div></td></tr>';
			this.$element.find('thead').removeClass('empty');
			this.$table.find('tbody').html(errorRow);
		},

		toggleField: function(fieldId){
			var field = this.options.schema[fieldId];
			field.hidden = !field.hidden;
			this.render();
		},

		sortBy: function(sortFn, sortDir){
			var sorter = function(fn, dir){
				return function(){
					return dir * fn.apply(this, arguments);
				}
			}

			this.orderBy(sorter(sortFn, sortDir));
			this.render();
		},

		groupByField: function(fieldId){
			var field = this.options.schema[fieldId];
			if (this.options.mutators.groupBy == field.index){
				this.groupBy(null);
			} else {
				this.groupBy(field.index);
			}

			this.cachedHeaders = {};
			this.render();
		},

		collapseAll: function () {
			this.$table.find('tr.header:not(.collapsed)').click();
		},

		expandAll: function () {
			this.$table.find('tr.header.collapsed').click();
		},

		select: function(prop){
			this.options.mutators.select = prop;
			return this;
		},

		where: function(prop){
			this.options.mutators.where = prop;
			return this;
		},

		groupBy: function(prop){
			this.options.mutators.groupBy = prop;
			return this;
		},

		orderBy: function(prop){
			this.options.mutators.orderBy = prop;
			return this;
		},

		destroy: function(){
			this.$search && this.$search.searchfield('destroy');

			this.$element.unbind('.datagrid');
			this.$element.empty();

			this.$element.removeData('datagrid');

			// publish events
			this.$element.triggerHandler('destroyed');
		},

		dataFor: function(elem){
			var $elem = $(elem),
				field = this.options.schema[$elem.closest('td').data('fieldid')],
				$tr = $elem.closest('tr'),
				groupId = $tr.data('group'),
				index = $tr.data('index');

			var data = [];

			if (typeof index === 'undefined') return [];

			if (typeof groupId !== 'undefined') {
				data[0] = this.dataMutated[groupId][index][field.index];
				data[1] = this.dataMutated[groupId][index];
			} else {
				data[0] = this.dataMutated[index][field.index];
				data[1] = this.dataMutated[index];
			}

			return data;
		},

		// function to construct a where clause based on a given filter and render new data
		filterData: function(filter, cb){
			var isMatch = function(value, field, type){
				var regexp, match = false,

				value = (''+value).toUpperCase();
				field = (''+field).toUpperCase();

				var values = value.split(','), match = false;
				for (var i = 0, j = values.length; i < j; i++){
					if (type === 'begins') {
						regexp = new RegExp('^' + values[i]);
						match = match || regexp.test(field);
					} else if (type === 'ends') {
						regexp = new RegExp(values[i] + '$');
						match = match || regexp.test(field);
					} else if (type === 'exact') {
						regexp = new RegExp('^' + values[i] + '$');
						match = match || regexp.test(field);
					} else if (type === 'not') {
						regexp = new RegExp('^((?!' + values[i] + ').)*$');
						match = match || regexp.test(field);
					} else if (type === 'exists') {
						match = match || !!field;
					} else if (type === 'range') {
						var bounds = value.split('..');

						if (!isNaN(bounds[0]) && !isNaN(bounds[1]) && !isNaN(field)){
							bounds[0] = +bounds[0];
							bounds[1] = +bounds[1]
							field = +field;
						}
						match = match || (field >= bounds[0] && field <= bounds[1]);
					} else {
						regexp = new RegExp(values[i]);
						match = match || regexp.test(field);
					}
				}
				return match;
			};

			this.where(function(row){
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

			if (typeof cb === 'function') cb();
		}
	}



	/* DATAGRID PRIVATE METHODS
	* =========================== */


	function unwrapFunction(f, args){
		if (!(args instanceof Array)){
			args = [args];
		}
		return typeof f === 'function' ? f.apply(this, args) : f;
	}

	function applyMutators(){
		var dataMutated = JsLinq(this.options.data),
			mutators = this.options.mutators;

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
			dataMutated = dataMutated.groupBy(mutators.groupBy);
		}

		if (typeof this.options.mutator === 'function'){
			dataMutated = this.options.mutator.call(this, dataMutated, this.options.schema);
		}

		return dataMutated;
	}

	function widthChanged(mediaType){

		var schema = this.options.schema,
			mediaQueries = this.options.mediaQueries;

		for (var i = 0; i < schema.length; i++){

			// reset any columns
			for (var media in mediaQueries){
				if (schema[i][media + 'Hidden']){
					schema[i].hidden = false;
				}

				if (schema[i][media + 'Visible']){
					schema[i].hidden = true;
				}
			}

			var isMediaHidden = unwrapFunction(schema[i][mediaType + 'Hidden']),
				isMediaVisible = unwrapFunction(schema[i][mediaType + 'Visible']);

			if (typeof isMediaHidden === 'boolean' && isMediaHidden){
				schema[i].hidden = true;
			}

			if (typeof isMediaVisible === 'boolean' && isMediaVisible){
				schema[i].hidden = false;
			}
		}

		this.render();
	}

	/* DATAGRID HELPERS
	* =========================== */

	DataGrid.sortAsc = 1;
	DataGrid.sortDesc = -1;
	DataGrid.sortBy = function(properties, primers) {
		var primers = primers || {}; // primers are optional

		properties = [].concat(properties);

		var comparator = function(x, y) {
			if (x === null || typeof x === 'undefined') x = '';
			if (y === null || typeof y === 'undefined') y = '';

			if (typeof x === 'string') x = $.trim(x.toLowerCase());
			if (typeof y === 'string') y = $.trim(y.toLowerCase());

			return x > y ? 1 : x < y ? -1 : 0;
		}

		return function(a, b) {
			for (var i = 0, j = properties.length; i < j; i++){
				var prop = properties[i],
					aValue = a[prop],
					bValue = b[prop];

				if( typeof primers[prop] !== 'undefined' ) {
					aValue = primers[prop](aValue);
					bValue = primers[prop](bValue);
				}

				var cmp = comparator(aValue, bValue);

				if (cmp !== 0) return cmp;
			}
			return 0;
		}
	}

	DataGrid.aggregateFunctions = {
		Sum: function(i, data){
			if (!data.length) return '';
			return data.select(function (x) {
				if (x.length !== undefined){
					// footer in grouped by format
					return x.select(function(y){ return y[i] }).sum();
				} else {
					return x[i];
				}
			}).sum();
		}
	}

	/* DATAGRID PLUGIN DEFINITION
	* =========================== */

	$.fn.datagrid = function (option) {
		var options = typeof option == 'object' && option;

		if (options){
			return this.each(function () {
				var $this = $(this),
					data = $this.data('datagrid');

				if (!data) $this.data('datagrid', new DataGrid(this, options));
			})
		} else if (typeof option == 'string') {
			var $this = $(this),
				data = $this.data('datagrid');

			if (data) return data[option].apply(data, Array.prototype.slice.call(arguments, 1));
		}
	}

	$.fn.datagrid.defaults = {
		field: { index: '', header: function(i){ return i }, view: function(i){ return i }, sort: DataGrid.sortBy, allowHidden: true, allowGroupBy: true, visibleDesktop: true },
		renderAfterInit: true,
		striped: true,
		pianoKey: false,
		data: [],
		showControls: false,
		showGroupBy: true,
		groupByTitle: 'Group By',
		showHideTitle: 'View',
		fluidLayout: true,
		mutators: {},
		groupByText: function(key, i, data){
			return key + ' <span class="muted">(' + data.length + ')</span>';
		},
		footerText: function(data){
			return '<strong>Total:</strong> ' + (data.total || data.select(function (x) { return (x.length !== undefined) ? x.length : 1; }).sum());
		},
		cacheHeaders: true,
		showFooter: true,
		chevronPosition: 'right',
		responsive: true,
		mediaQueries: {
			phone: '(max-width: 767px)',
			tablet: '(min-width: 768px) and (max-width: 979px)',
			desktop: '(min-width: 980px)'
		},
		fixedHeight: 0,
		fixedFooter: true,
		resize: true,
		shadowTop: true,
		shadowBottom: false,
		resizeTimeout: 10,
		mediaQueryTimeout: 50,
		showSearch: false,
		searchOptions: {},
		rowClassName: null,
		template: [
			'<div class="datagrid-controls-container">',
				'<div class="row">',
					'<div class="span12 datagrid-controls"></div>',
				'</div>',
			'</div>',
			'<div class="datagrid-container"></div>'
		].join(''),
		controlsTemplate: [
			'<div class="btn-group pull-right hidden-phone">',
				'<div class="btn-group showHide">',
					'<button class="btn dropdown-toggle" data-toggle="dropdown"><i class="glyphicon-eye-close"></i></button>',
					'<ul class="dropdown-menu pull-right"></ul>',
				'</div>',
				'<div class="btn-group groupBy">',
					'<button class="btn dropdown-toggle" data-toggle="dropdown"><i class="glyphicon-th-list"></i></button>',
					'<ul class="dropdown-menu pull-right"></ul>',
				'</div>',
				'<div class="btn-group expandAll">',
					'<button class="btn"><i class="glyphicon-resize-full"></i></button>',
				'</div>',
				'<div class="btn-group collapseAll">',
					'<button class="btn"><i class="glyphicon-resize-small"></i></button>',
				'</div>',
			'</div>'
		].join(''),
		searchTemplate: '<input type="search" />'
	}

	$.fn.datagrid.Constructor = DataGrid

}(window.jQuery);