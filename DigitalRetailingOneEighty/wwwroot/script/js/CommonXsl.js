//Used to sort the Search Results table.
function sortTable(strTable, args) {
    var table = document.getElementById(strTable);
    if (!!table) {
        var body = table.getElementsByTagName("tbody")[0];
        if (body != undefined) {
            var rows = body.getElementsByTagName("tr");
            var sorted = table.getAttribute("sorted");
            if (sorted == args[0]) {
                table.setAttribute("sorted", -1);
            } else {
                table.setAttribute("sorted", args[0]);
            }
            var items = new Array();
            for (var count = 0; count < rows.length; count++) {
                items[count] = {};
                items[count].row = rows[count];
            }
            items.sort(sortFunc(sorted == args[0], args));

            for (var count = 0; count < rows.length; count++) {
                body.appendChild(items[count].row);
            }
        }
    }
}

function sortFunc(sorted, arg) {
    var funcArg = arg[0];
    var sendArguments = new Array();
    for (var count = 1; count < arg.length; count++) {
        sendArguments[count - 1] = arg[count];
    }
    return function sort(a, b) {
        var aCells = a.row.getElementsByTagName("td");
        var bCells = b.row.getElementsByTagName("td");

        var aa = aCells[funcArg].getAttribute("sortValue");
        var bb = bCells[funcArg].getAttribute("sortValue");

        if (!isNaN(aa) && !isNaN(bb)) {
            aa = Number(aa);
            bb = Number(bb);
        } else {
            aa = !aa ? '' : String(aa).toLowerCase();
            bb = !bb ? '' : String(bb).toLowerCase();
        }
        var intReturn = 0;
        if (aa < bb) {
            intReturn = -1;
        } else if (aa > bb) {
            intReturn = 1;
        } else {
            if (arg.length > 1) {
                return sortHelper(aCells, bCells, sendArguments);
            } else {
                return 0;
            }
        }
        if (sorted) {
            return -1 * intReturn;
        } else {
            return intReturn;
        }
    };
}

function sortHelper(a, b, arg) {
    var funcArg = arg[0];
    var sendArguments = new Array();
    for (var count = 1; count < arg.length; count++) {
        sendArguments[count - 1] = arg[count];
    }
    var aa = a[funcArg].getAttribute("sortValue");
    var bb = b[funcArg].getAttribute("sortValue");

    if (!isNaN(aa) && !isNaN(bb)) {
        aa = Number(aa);
        bb = Number(bb);
    } else {
        aa = !aa ? '' : String(aa).toLowerCase();
        bb = !bb ? '' : String(bb).toLowerCase();
    }

    if (aa < bb) {
        return -1;
    } else if (aa > bb) {
        return 1;
    } else {
        if (arg.length > 1) {
            return sortHelper(a, b, sendArguments);
        } else {
            return 0;
        }
    }
}