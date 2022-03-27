var myfilter = function(data, max_rows, cols) {
	if (!data || !data.length) throw 'Fatal Error: No data to be filtered';
	var data_len = data.length;
	max_rows = max_rows || 200;
	cols = cols || data[0];
	
	RegExp.escape = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}
	
	var trim = function(o) {
		return o.replace(/^\s+|\s+$/g,"");
	}
	var ltrim = function(o) {
		return o.replace(/^\s+/,"");
	}
	var rtrim = function(o) {
		return o.replace(/\s+$/,"");
	}

	
	return function(arr){
		arr = arr || [];
		var stats = {totalRows:0};
		var data_subset = [];
		var arr_len = arr.length;
		if (!arr_len) {
			if (data_len > max_rows){
				return {data:[], stats:{totalRows:data_len}};
			} else {
				return {data:data, stats:{totalRows:data_len}};
			}
		}
		
		for (var i=0; i<data_len; i++){
			var matches = {};
			
			
			for (var j=0; j<arr_len; j++){
				var filter_str = arr[j].str || '';
				var filter_col = arr[j].col || '';
				var filter_type = arr[j].type || 'contains';
				
				var foobar = filter_str.split(',');
				for (var col in cols) {
					var foobarBLN = false
					for (var cnt=0; cnt<foobar.length; cnt++) {
						var reg = (function(){
							var map = {
								begins : new RegExp('^' + RegExp.escape(trim(foobar[cnt])), 'i'),
								contains : new RegExp(RegExp.escape(trim(foobar[cnt])), 'i'),
								ends : new RegExp(RegExp.escape(trim(foobar[cnt])) + '$', 'i')
							};
							return map[filter_type];
						})();
					
						if ((!filter_col || filter_col && col == filter_col) && reg.test(data[i][col])) {
							foobarBLN = true;
						}
					}
					matches[filter_str] = matches[filter_str] || [];
					if (foobarBLN) {
						matches[filter_str].push(col);
					}
				}
			}
			
			//Loop over all the matches to count how many rows would be returned if a col was selected.
			var showRow = false;
			for (var key in matches) {
				var matches_len = matches[key].length;
				for (var j=0; j<matches_len; j++) {
					var incrimentCol = true;
					for (var k in matches) {
						if (!matches[k].length) {
							incrimentCol = false;
						}
					}
					if (incrimentCol) {
						showRow = true;
						stats[key] = stats[key] || {};
						stats[key][matches[key][j]] = stats[key][matches[key][j]] || {};
						stats[key][matches[key][j]].count = stats[key][matches[key][j]].count || 0;
						stats[key][matches[key][j]].count++;
					}
				}
			}
			if (showRow) {
				data_subset.push(data[i]);
				stats.totalRows++;
			}
		}
		
		if (stats.totalRows > max_rows) {
			data_subset = [];
		}
		
		//Sort the stats so that the highest numbers are first
		for (var key in stats) {
			if (key != 'totalRows') {
				var tmp = [];
				for (var col in stats[key]) {
					tmp.push({
						col : col,
						val : stats[key][col].count
					});
				}
				tmp.sort(function(a,b){return b.val - a.val;});
				stats[key] = {};
				for (var i=0; i<tmp.length; i++) {
					stats[key][tmp[i].col] = {};
					stats[key][tmp[i].col].count = tmp[i].val;
				}
				
			}
		}
		
		return {
			data : data_subset,
			stats : stats
		}
	}
}