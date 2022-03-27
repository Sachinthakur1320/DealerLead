/*
	usage:	var s = sort('#table');
			$th.click(
				sort.sortCol( [
					['Price', function(a,b){return a.value-b.value;}],
					['Age']
				] )
			);
*/
var tableSort = function(tbl) {
	var sortCompare = function (a, b){
		a = a || '';
		b = b || '';
		var result;
		
		var dateRE = /^(\d{2})[\/\- ](\d{2})[\/\- ](\d{4})[\/\- ](\d{2})[:](\d{2})[:](\d{2})[ ]((PM)|(AM))/;
		if (dateRE.test(a) && dateRE.test(b)) {
			return ((new Date(a)).getTime() - (new Date(b)).getTime());
		} else if (!isNaN(+a) && !isNaN(+b)) {
			return (a-b);
		} else {
			var aa = a.toLowerCase();
			var bb = b.toLowerCase();
			if(aa < bb){
				result = -1;
			}
			else if(aa > bb){
				result = 1;
			}
			else{
				result = 0;
			}
			return result;
		}
	}
	
	var comp = function(r) {
		return function(a,b) {
			for (var i=0; i<r.length; i++) {
				var x = r[i][2](a.data('rowdata')[r[i][0]], b.data('rowdata')[r[i][0]]);
				if (x) {
					return x * r[i][1];
				}
			}
			return 0;
		};
	}
	
	var scale = function(f, o) {
		return function() {
			return o * f.apply(this, Array.prototype.slice.call(arguments));
		}
	};

	var $tbl = $(tbl);
	if (!$tbl.length) throw 'Fatal Error: No table found';
	var $rows = $tbl.find('tbody tr:visible');

	return {
		sort : function(arr){
			if (!arr || !arr.length) return function(){};
			for (var i=0; i<arr.length; i++) {
				arr[i] = [].concat(arr[i]);
				arr[i][1] = arr[i][1] || 1;
				arr[i][2] = arr[i][2] || sortCompare;
			}
			
			//var sortOrder = 1;
			return function() {
				var $this = $(this);
				var pos = ($this.parent().find('td').index(this))+1;
				var storage = [];
				
				$rows.each(function(k,v){
					storage.push($(v));
				});
				//storage.sort( scale(comp(arr), sortOrder) );
				storage.sort( comp(arr) );

				//sortOrder *= -1;
				for (var i=0; i < storage.length; i++) {
					$tbl.append(storage[i]);
				}
			}
		}
	}
}