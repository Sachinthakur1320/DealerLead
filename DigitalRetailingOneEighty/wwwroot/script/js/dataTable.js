/* Data grid */
(function () {
	var DataTable = window.DataTable = function (container, data, schema) {
		var useClasses = !($.browser.msie && (parseInt($.browser.version, 10) <= 7));
		//Private Methods
		var renderData = function (data, fields) {
			var r = [];
			var field;

			for (var i = 0; i < data.length; i++) {
				r.push('<tr');
				if (self.schema.rows && typeof self.schema.rows.className === 'function') {
					r.push(' class="' + self.schema.rows.className(data[i]) + '"');
				}
				r.push(' dataIndex="' + i + '"');
				r.push('>');

				for (field = 0; field < fields.length; field++) {
					if (fields[field] && fields[field].hidden !== undefined) {
						if (typeof fields[field].hidden == 'function') {
							if (fields[field].hidden()) { continue; }
						} else if (fields[field].hidden) {
							continue;
						}
					}

					r.push('<td');
					if (typeof fields[field].className === 'function') {
						r.push(' class="' + fields[field].className(data[i][fields[field].index], data[i]) + '"');
					}
					if (typeof fields[field].action == 'function') {
						r.push(' style="cursor:pointer;"');
						r.push(' fieldId="' + field + '"');
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
				if (fields[field] && typeof fields[field].header === 'string') {
					r.push('<th>' + fields[field].header + '</th>')
				} else if (fields[field] && typeof fields[field].header === 'function') {
					r.push('<th>' + fields[field].header() + '</th>');
				} else {
					r.push('<th>' + field + '</th>');
				}
			}
			r.push('</tr>');
			table.append(r.join(''));
		}

		//Object Initialization
		var _groupRows = [];
		var _table, _data, _options = {},
			_parent = $(container),
			_maskVisible = false,
			_lastMessage = null,
			_mask, _message;
		$(container).empty();

		//Define Interface
		var self = {
			container: container,
			data: data || [],
			schema: schema || {},
			render: function () {
				if (container.length !== 1) { return; }

				var fields = self.schema.fields || {};
				var field;
				var tr;

				_options.accordion = self.schema.group && self.schema.group.accordion;
				if (_options.accordion) {
					self.schema.group.collapsed = true;
				}

				_groupRows.length = 0;
				var table = $('<table>');
				table.addClass('dataTable');
				table.addClass('table');
				table.addClass('table-hover');
				table.css({ 'width': '100%' });

				//Header
				renderHeader(table, fields);

				//Body
				if (self.data.length > 0) {
					if (self.schema.group && self.data[0].key !== undefined) {
						//Grouped Data
						var rows;
						for (var i = 0; i < self.data.length; i++) {
							//Generate group header
							if (typeof self.schema.group.header == "function") {
								tr = $(self.schema.group.header(self.data[i].key, self.data[i]));
							} else {
								tr = $('<tr><td colspan="' + fields.length + '"><span style="font-weight:bold;">' + self.data[i].key + '</span></td></tr>');
							}
							tr.addClass("header").addClass("collapsable");
							tr.attr("groupIndex", i);
							tr.find('td:first').addClass("first");

							table.append(tr);
							//Generate group data view and link to header
							(function (index, headerRow) {
								rows = function () {
									var dataRows;
									if (typeof self.schema.group.expandedView === 'function') {
										var placeHolder = $('<div/>');
										placeHolder.css({ 'padding-left': '12px', 'padding-top': '10px', 'background-color': '#FAFAFA', 'background-image': 'url("/webasp/images/icons/tree_lastnode.png")', 'background-repeat': 'no-repeat' });
										dataRows = $('<tr/>');
										var mainCell = $('<td colspan="' + fields.length + '" style="padding:0px;"></td>');
										dataRows.append(mainCell);
										self.schema.group.expandedView(placeHolder, self.data[index]);
										mainCell.append(placeHolder);
									} else {
										dataRows = $(renderData(self.data[index], fields));
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
								}).css('cursor', 'pointer');
							})(rows, tr);
						}
					} else {
						//Non-grouped data
						table.append(renderData(self.data, fields));
					}
				}
				if (_table) { _table.replaceWith(table); }
				else { container.append(table); }
				_table = table;
				_data = self.data;

				//Register grid action dispatch
				table.click(function (e) {
					var schema = self.schema;
					var $target = $(e.target);
					if ($target[0].tagName && $target[0].tagName.toUpperCase() !== 'TD') {
						$target = $target.parents('td:first');
					}
					//Only handle if the cell is a direct decendant of this table, not a child table
					if ($target.parents('table:first')[0] !== table[0]) { return; }

					var groupIndex = $target.parent().prevAll('tr[groupIndex]:first').attr('groupIndex');
					var dataIndex = $target.parent().attr('dataIndex');
					var fieldId = $target.attr('fieldId');

					if (schema.fields[fieldId] && typeof schema.fields[fieldId].action == 'function') {
						if (groupIndex) {
							schema.fields[fieldId].action(_data[groupIndex][dataIndex][schema.fields[fieldId].index], _data[groupIndex][dataIndex]);
						} else {
							schema.fields[fieldId].action(_data[dataIndex][schema.fields[fieldId].index], _data[dataIndex]);
						}
					}
				});
				self.showLoading(false);

				return table;
			},
			collapseAll: function () {
				if (_table) {
					_table.find('tr.header:not(.collapsed)').click();
				}
			},
			expandAll: function () {
				if (_table) {
					_table.find('tr.header.collapsed').click();
				}
			},	
			showLoading: function (state, message) {
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
						_parent.append(_mask).append(_message);
					}
					_mask.height(_parent.height()).width(_parent.width())
						.css('left', _parent.offset().left).css('top', _parent.offset().top)
						.show();
					var maskOffset = _mask.offset();
					_message.slideDown('fast')
						.html(message)
						.css('top', maskOffset.top + 10).css('left', maskOffset.left + ((_mask.width() - _message.width()) / 2));
				} else if (state && _maskVisible) {
					_mask.height(_parent.height()).width(_parent.width())
						.css('left', _parent.offset().left).css('top', _parent.offset().top);
					var maskOffset = _mask.offset();
					if (message && _message) {
						_message.css('top', maskOffset.top + 10).css('left', maskOffset.left + ((_mask.width() - _message.width()) / 2));
					}
				} else if (!state && _maskVisible) {
					_maskVisible = false;
					if (_mask) { _message.slideUp(250, function(){_message.hide()}); _mask.hide(); }
				}
			}
		};
		return self;
	};
})();
