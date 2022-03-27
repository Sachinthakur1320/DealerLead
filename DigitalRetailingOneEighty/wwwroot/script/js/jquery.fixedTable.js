/*

This jQuery plugin is learned from https://www.open2space.com/projects/fixedtable.
We have improved it, and fixed some bugs.

Example:

$(document).ready(function() {
$(".tableDiv").each(function() {
var Id = $(this).get(0).id;
var maintbheight = 555;
var maintbwidth = 760;

$("#" + Id + " .FixedTables").fixedTable({
width: maintbwidth,
height: maintbheight,
fixedColumns: 1,
classHeader: "fixedHead",
classFooter: "fixedFoot",
classColumn: "fixedColumn",
fixedColumnWidth: 150,
outerId: Id,
backcolor: "#FFFFFF",
hovercolor: "#99CCFF"
});
});
});

*/

(function($) {
	// ***********************************************
	//The main fixedTable function
	$.fn.fixedTable = function(opts) {
		//default options defined in $.fn.fixedTable.defaults - at the bottom of this file.
		var options = $.extend({}, $.fn.fixedTable.defaults, opts);
		var mainid = "#" + options.outerId;
		var tbl = this;
		var layout = buildLayout(tbl, opts);
		//see the buildLayout() function below

		//we need to set the width (in pixels) for each of the tables in the fixedContainer area
		//but, we need to subtract the width of the fixedColumn area.
		var w = options.width - options.fixedColumnWidth;
		//sanity check
		if (w <= 0) { w = options.width; }

		$(".fixedContainer", layout).width(w);

		$(".fixedContainer ." + options.classHeader, layout).css({
			width: (w) + "px",
			"float": "left",
			"overflow": "hidden"
		});

		$(".fixedContainer .fixedTable", layout).css({
			"float": "left",
			width: (w + 16) + "px",
			"overflow": "auto"
		});
		$(".fixedContainer", layout).css({
			width: w - 1,
			"float": "left"
		});    //adjust the main container to be just larger than the fixedTable

		$(".fixedContainer ." + options.classFooter, layout).css({
			width: (w) + "px",
			"float": "left",
			"overflow": "hidden"
		});
		$("." + options.classColumn + " > .fixedTable", layout).css({
			"width": options.fixedColumnWidth,
			"overflow": "hidden",
			"border-collapse": $(tbl).css("border-collapse"),
			"padding": "0"
		});

		$("." + options.classColumn, layout).width(options.fixedColumnWidth);
		$("." + options.classColumn, layout).height(options.height);
		$("." + options.classColumn + " ." + options.classHeader + " table tbody tr td", layout).width(options.fixedColumnWidth);
		$("." + options.classColumn + " ." + options.classFooter + " table tbody tr td", layout).width(options.fixedColumnWidth);

		//adjust the table widths in the fixedContainer area
		var fh = $(".fixedContainer > ." + options.classHeader + " > table", layout);
		var ft = $(".fixedContainer > .fixedTable > table", layout);
		var ff = $(".fixedContainer > ." + options.classFooter + " > table", layout);

		var maxWidth = fh.width();
		if (ft.length > 0 && ft.width() > maxWidth) { maxWidth = ft.width(); }
		if (ff.length > 0 && ff.width() > maxWidth) { maxWidth = ff.width(); }


		if (fh.length) { fh.width(maxWidth); }
		if (ft.length) { ft.width(maxWidth); }
		if (ff.length) { ff.width(maxWidth); }

		//adjust the widths of the fixedColumn header/footer to match the fixed columns themselves
		$("." + options.classColumn + " > ." + options.classHeader + " > table > tbody > tr:first > td", layout).each(function(pos) {
			var tblCell = $("." + options.classColumn + " > .fixedTable > table > tbody > tr:first > td:eq(" + pos + ")", layout);
			var tblFoot = $("." + options.classColumn + " > ." + options.classFooter + " > table > tbody > tr:first > td:eq(" + pos + ")", layout);
			var maxWidth = $(this).width();
			if (tblCell.width() > maxWidth) { maxWidth = tblCell.width(); }
			if (tblFoot.length && tblFoot.width() > maxWidth) { maxWidth = tblFoot.width(); }
			$(this).width(maxWidth);
			$(tblCell).width(maxWidth);
			if (tblFoot.length) { $(tblFoot).width(maxWidth); }
		});


		//set the height of the table area, minus the heights of the header/footer.
		// note: we need to do this after the other adjustments, otherwise these changes would be overwrote
		var h = options.height - parseInt($(".fixedContainer > ." + options.classHeader, layout).height()) - parseInt($(".fixedContainer > ." + options.classFooter, layout).height());
		//sanity check
		if (h < 0) { h = options.height; }
		$(".fixedContainer > .fixedTable", layout).height(h);
		$("." + options.classColumn + " > .fixedTable", layout).height(h);

		//Adjust the fixed column area if we have a horizontal scrollbar on the main table
		// - specifically, make sure our fixedTable area matches the main table area minus the scrollbar height,
		//   and the fixed column footer area lines up with the main footer area (shift down by the scrollbar height)
		var h = $(".fixedContainer > .fixedTable", layout)[0].offsetHeight - 16;
		$("." + options.classColumn + " > .fixedTable", layout).height(h);  //make sure the row area of the fixed column matches the height of the main table, with the scrollbar

		// Apply the scroll handlers
		$(".fixedContainer > .fixedTable", layout).scroll(function() { handleScroll(mainid, options); });
		//the handleScroll() method is defined near the bottom of this file.

		//$.fn.fixedTable.adjustSizes(mainid);
		adjustSizes(options);
		return tbl;
	}

	function buildLayout(src, options) {
		//create a working area and add it just after our table.
		//The table will be moved into this working area
		var area = $("<div class=\"fixedArea\"></div>").appendTo($(src).parent());

		//fixed column items
		var fc = $("<div class=\"" + options.classColumn + "\" style=\"float: left;\"></div>").appendTo(area);
		var fch = $("<div class=\"" + options.classHeader + "\"></div>").appendTo(fc);
		var fct = $("<div class=\"fixedTable\"></div>").appendTo(fc);
		var fcf = $("<div class=\"" + options.classFooter + "\"></div>").appendTo(fc);

		//fixed container items
		var fcn = $("<div class=\"fixedContainer\"></div>").appendTo(area);
		var fcnh = $("<div class=\"" + options.classHeader + "\"></div>").appendTo(fcn);
		var fcnt = $("<div class=\"fixedTable\"></div>").appendTo(fcn);
		var fcnf = $("<div class=\"" + options.classFooter + "\"></div>").appendTo(fcn);

		//create the fixed column area
		if (options.fixedColumns > 0 && !isNaN(options.fixedColumns)) {
			buildFixedColumns(src, "thead", options.fixedColumns, fch);
			buildFixedColumns(src, "tbody", options.fixedColumns, fct);
			buildFixedColumns(src, "tfoot", options.fixedColumns, fcf);
			//see the buildFixedColumns() function below
			
			//remove extra colgroups
			$('colgroup:lt(' + options.fixedColumns + ')', src).each(function() {
				$(this).remove();
			});
		}

		//Build header / footer areas
		buildFixedTable(src, "thead", fcnh);
		buildFixedTable(src, "tfoot", fcnf);
		//see the buildFixedTable() function below

		//Build the main table
		//we'll cheat here - the src table should only be a tbody section, with the remaining columns, 
		//so we'll just add it to the fixedContainer table area.
		fcnt.append(src);
		return area;
	}

	/* ******************************************************************** */
	// duplicate a table section (thead, tfoot, tbody), but only for the desired number of columns
	function buildFixedColumns(src, section, cols, target) {
		//TFOOT - get the needed columns from the table footer
		if ($(section, src).length) {
			var colHead = $("<table></table>").appendTo(target)
				.css('width', '100%');

			//If we have a thead or tfoot, we're looking for "TH" elements, otherwise we're looking for "TD" elements
			var cellType = "td";  //deafault cell type
			if (section.toLowerCase() == "thead" || section.toLowerCase() == "tfoot") { cellType = "th"; }
			
			$('colgroup:lt(' + cols + ')', src).each(function() {
				$(this).clone().appendTo(colHead);
			});
			$(section + ' tr', src).each(function() {
				var tr = $(this).clone(true).appendTo(colHead);
				$(cellType, tr).each(function(index) {
					if (index >= cols) {
						$(this).remove();
					}
				});
				$(cellType + ':lt(' + cols + ')', this).each(function() {
					$(this).remove();
				});
			});
			
			//check each of the rows in the thead
			/*$(section + " tr", src).each(function() {
				var tr = $("<tr></tr>").appendTo(colHead);
				$(cellType + ":lt(" + cols + ")", this).each(function() {
					$("<td>" + $(this).html() + "</td>").addClass(this.className).attr("id", this.id).appendTo(tr);
					//Note, we copy the class names and ID from the original table cells in case there is any processing on them.
					//However, if the class does anything with regards to the cell size or position, it could mess up the layout.

					//Remove the item from our src table.
					$(this).remove();
				});
			});*/
		}
	}

	/* ******************************************************************** */
	// duplicate a table section (thead, tfoot, tbody)
	function buildFixedTable(src, section, target) {
		if ($(section, src).length) {
			var th = $("<table></table>").appendTo(target);
			var tr = null;

			//If we have a thead or tfoot, we're looking for "TH" elements, otherwise we're looking for "TD" elements
			var cellType = "td";  //deafault cell type
			if (section.toLowerCase() == "thead" || section.toLowerCase() == "tfoot") { cellType = "th"; }
			
			$('colgroup', src).each(function() {
				$(this).clone().appendTo(th);
			});
			$(section + ' tr', src).each(function() {
				$(this).clone(true).appendTo(th);
			});
			/*$(section + " tr", src).each(function() {
				var tr = $("<tr></tr>").appendTo(th);
				$(cellType, this).each(function() {
					$("<td>" + $(this).html() + "</td>").appendTo(tr);
				});

			});*/
			//The header *should* be added to our head area now, so we can remove the table header
			$(section, src).remove();
		}
	}

	// ***********************************************
	// Handle the scroll events
	function handleScroll(mainid, options) {
		//Find the scrolling offsets
		var tblarea = $(mainid + " .fixedContainer > .fixedTable");
		var x = tblarea[0].scrollLeft;
		var y = tblarea[0].scrollTop;

		$(mainid + " ." + options.classColumn + " > .fixedTable")[0].scrollTop = y;
		$(mainid + " .fixedContainer > ." + options.classHeader)[0].scrollLeft = x;
		$(mainid + " .fixedContainer > ." + options.classFooter)[0].scrollLeft = x;
	}

	// ***********************************************
	//  Reset the heights of the rows in our fixedColumn area
	function adjustSizes(options) {

		var Id = options.outerId;
		var $Id = $('#'+Id);
		var maintbheight = options.height;
		var backcolor = options.Contentbackcolor;
		var hovercolor = options.Contenthovercolor;
		var fixedColumnbackcolor = options.fixedColumnbackcolor;
		var fixedColumnhovercolor = options.fixedColumnhovercolor;

		// row height
		$("." + options.classColumn + " .fixedTable table tbody tr", $Id).each(function(i) {
			var maxh = 0;
			var fixedh = $(this).height();
			var contenth = $(".fixedContainer .fixedTable table tbody tr", $Id).eq(i).height();
			if (contenth > fixedh) {
				maxh = contenth;
			}
			else {
				maxh = fixedh;
			}
			//$(this).height(contenth);
			$(this).children("td").height(maxh);
			$(".fixedContainer .fixedTable table tbody tr", $Id).eq(i).children("td").height(maxh);
		});

		//adjust the cell widths so the header/footer and table cells line up
		var htbale = $(".fixedContainer ." + options.classHeader + " table", $Id);
		var ttable = $(".fixedContainer .fixedTable table", $Id);
		var ccount = $(".fixedContainer ." + options.classHeader + " table tr:first th", $Id).size();
		var widthArray = new Array();
		var totall = 0;

		$(".fixedContainer ." + options.classHeader + " table tr:first th", $Id).each(function (pos) {
			var cwidth = $(this).width();
			$(".fixedContainer .fixedTable table tbody td", $Id).each(function (i) {
				if (i % ccount == pos) {
					if ($(this).width() > cwidth) {
						cwidth = $(this).width();
					}
				}
			});
			widthArray[pos] = cwidth;
			totall += (cwidth + 2);
		});

		$(".fixedContainer ." + options.classHeader + " table", $Id).width(totall + 100);
		$(".fixedContainer .fixedTable table", $Id).width(totall + 100);
		$(".fixedContainer ." + options.classFooter + " table", $Id).width(totall + 100);

		var $headerThs = $(".fixedContainer ." + options.classHeader + " table tr th", $Id);
		var $tableTds = $(".fixedContainer .fixedTable table tr td", $Id);
		var $footerThs = $(".fixedContainer ." + options.classFooter + " table tr th", $Id)
		for (i = 0; i < widthArray.length; i++) {
			$headerThs.each(function (j) {
				if (j % ccount == i) {
					$(this).width(widthArray[i]);
					//$(this).attr("width", widthArray[i] + "px");
				}
			});

			$tableTds.each(function (j) {
				if (j % ccount == i) {
					$(this).width(widthArray[i]);
					//$(this).attr("width", widthArray[i] + "px");
				}
			});

			$footerThs.each(function (j) {
				if (j % ccount == i) {
					$(this).width(widthArray[i]);
					//$(this).attr("width", widthArray[i] + "px");
				}
			});
		}

		// mouse in/out fixedColumn's fixedtable, change background color.
		$("." + options.classColumn + " .fixedTable table tr", $Id).each(function(i) {
			$(this).mouseover(function() {
				if (fixedColumnhovercolor) {
					$(this).children("td").css({
						"background-color": fixedColumnhovercolor
					});
				}
				var obj = $(".fixedContainer .fixedTable table tr", $Id).eq(i);
				if (hovercolor) {
					obj.children("td").css({
						"background-color": hovercolor
					});
					obj.children("td").children("pre").css({
						"background-color": hovercolor
					});
				}
			});
			$(this).mouseout(function() {
				if (fixedColumnhovercolor) {
					$(this).children("td").css({
						"background-color": fixedColumnbackcolor
					});
				}
				var obj = $(".fixedContainer .fixedTable table tr", $Id).eq(i);
				if (hovercolor) {
					obj.children("td").css({
						"background-color": backcolor
					});
					obj.children("td").children("pre").css({
						"background-color": backcolor
					});
				}
			});
		});

		// mouse in/out fixedContainer's fixedtable, change background color.
		$(".fixedContainer .fixedTable table tr", $Id).each(function(i) {
			$(this).mouseover(function() {
				if (hovercolor) {
					$(this).children("td").css({
						"background-color": hovercolor
					});
					$(this).children("td").children("pre").css({
						"background-color": hovercolor
					});
				}
				var obj = $("." + options.classColumn + " .fixedTable table tr", $Id).eq(i);
				if (fixedColumnhovercolor) {
					obj.children("td").css({
						"background-color": fixedColumnhovercolor
					});
				}

			});
			$(this).mouseout(function() {
				if (hovercolor) {
					$(this).children("td").css({
						"background-color": backcolor
					});
					$(this).children("td").children("pre").css({
						"background-color": backcolor
					});
				}
				var obj = $("." + options.classColumn + " .fixedTable table tr", $Id).eq(i);
				if (fixedColumnhovercolor) {
					obj.children("td").css({
						"background-color": fixedColumnbackcolor
					});
				}
			});
		});

		var contenttbH = $(".fixedContainer .fixedTable table", $Id).height();
		if (contenttbH < maintbheight) {
			$("." + options.classColumn + " .fixedTable", $Id).height(contenttbH + 20);
			$(".fixedContainer .fixedTable").height(contenttbH + 20, $Id);

			$(".fixedContainer ." + options.classHeader, $Id).width($(".fixedContainer ." + options.classHeader, $Id).width() + 16);
			$(".fixedContainer ." + options.classFooter, $Id).width($(".fixedContainer ." + options.classHeader, $Id).width());
		}
		else {
			//offset the footer by the height of the scrollbar so that it lines up right.
			$("." + options.classColumn + " > ." + options.classFooter, $Id).css({
				"position": "relative",
				"top": 16
			});
		}
	}

})(jQuery);