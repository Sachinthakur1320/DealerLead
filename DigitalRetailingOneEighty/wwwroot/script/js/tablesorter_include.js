$.tablesorter.addWidget({
	id: "zebraIgnoreInvisible",
	format: function(table) {
		if (table.config.debug) {
			var time = new Date();
		}
		var $tr, row = -1,
			odd;
		// loop through the rows
		$("tr", table.tBodies[0]).each(function (i) {
			$tr = $(this);
			// style children rows the same way the parent
			// row was styled
			if (!$tr.hasClass(table.config.cssChildRow)) row++;
			odd = (row % 2 == 0);
			$tr.removeClass(
			table.config.widgetZebra.css[odd ? 0 : 1]).addClass(
			table.config.widgetZebra.css[odd ? 1 : 0])
		});
		if (table.config.debug) {
		    $.tablesorter.benchmark("Applying zebraIgnoreInvisible widget", time);
		}
	}
});

$.tablesorter.addParser({
    id: "currencyWithCommas",
    is: function(s) {
        return false;
    }, format: function(s) {
        return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$,]/g), ""));
    }, type: "numeric"
});

$.tablesorter.addParser({
	id: "spacerImage",
	is: function(s) {
		return false;
	}, format: function(s, table, cell) {
		return $(cell).html().indexOf('spacer.gif') > 0 ? 0 : 1;
	}, type: "numeric"
});