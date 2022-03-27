var tableFunctions = {};

//Makes the given table sortable.
//Created by Chris
tableFunctions.makeTableSortable = function(table) {
	var sortFunc = function(tableBody, sortableRows, sortCol, objLastSort) {
		return function() {
			var numModifier = 1,
				i;

			if (objLastSort.col == sortCol) {
				numModifier = -1;
			}

			//If the column has not had it's values calculated yet, do it now and store the result for next time unless it's an Input element.
			if (sortableRows[0][sortCol] === undefined || sortableRows[0].row.getElementsByTagName('td')[sortCol].getElementsByTagName('input').length > 0) {
				for (i = 0; i < sortableRows.length; i++) {
					sortableRows[i][sortCol] = getCellValue(sortableRows[i].row.getElementsByTagName('td')[sortCol]);
				}
			}

			sortableRows.sort(function(a, b) {
				if (a[sortCol] === b[sortCol]) {
					return a.index - b.index;
				} else if (a[sortCol] > b[sortCol]) {
					return numModifier;
				} else if (a[sortCol] < b[sortCol]) {
					return -1 * numModifier;
				} else {
					//Can happen when comparing a number type to a string type.
					if (b[sortCol] == 0) {
						return numModifier;
					} else {
						return -1 * numModifier;
					}
				}
			});

			if (objLastSort.col == sortCol) {
				objLastSort.col = -1;
			} else {
				objLastSort.col = sortCol;
			}

			for (i = 0; i < sortableRows.length; i++) {
				tableBody.appendChild(sortableRows[i].row);
				sortableRows[i].index = i;
			}
		}
	};

	//Return the sortable value for the cell. If the cell contains a text field, return the element so it's latest value can always be used.
	var getCellValue = function(cell) {
		var inputs = cell.getElementsByTagName('input'),
			value;

		//If the cell has input elements, use the value of the first Input type Text as the value of the cell.
		if (inputs.length > 0) {
			for (var x = 0; x < inputs.length; x++) {
				if (inputs[x].type == 'text') {
					value = inputs[x].value;
				}
			}
		} else {
			//Else, strip out all the HTML tags and $'s in the cell and use it's text as the value.
			value = cell.innerHTML.replace(/<[^>]*>|\$/g, '');
		}
		//If the value of the cell is a Number, cast it so it will get sorted as a Number and not as a String.
		if (!isNaN(value)) {
			value = Number(value);
		}
		return value;
	};

	var tableHeaders, //The header row of the table.
		tableBody, //The main body of the table
		tableRows, //The rows of the body of the table
		sortableRows, //The array of row information
		objLastSort, //Helper object to keep track of the last column sorted
		rowCells, //The cells of a given row
		i, //Counter variable
		j; //Counter variable

	//If the supplied table is the table id and not the element, make it the element.
	if (typeof table == 'string') {
		table = document.getElementById(table);
	}

	tableHeaders = table.getElementsByTagName('thead')[0].getElementsByTagName('tr');
	tableHeaders = tableHeaders[tableHeaders.length - 1].getElementsByTagName('td');
	tableBody = table.getElementsByTagName('tbody')[0];
	tableRows = tableBody.getElementsByTagName('tr');

	sortableRows = [];
	for (i = 0; i < tableRows.length; i++) {
		sortableRows[i] = {};
		sortableRows[i].row = tableRows[i];
		sortableRows[i].index = i;
	}

	objLastSort = {};
	objLastSort.col = -1;
	for (i = 0; i < tableHeaders.length; i++) {
		//Add the sort function to the onclick of each column header.
		tableHeaders[i].onclick = sortFunc(tableBody, sortableRows, i, objLastSort);
		//Give each column header the pointer cursor so it's obvious the table can be sorted.
		tableHeaders[i].style.cursor = 'pointer';
	}

	return sortableRows;
}

/*Generates a table using the given a data object, and parameters object
*	objData - An array of objects containing all of the column name - value pairs to be used in creating the table.
*	objTableParameters - Parameters object containing any/all of the defined information as follows
*		tableId - String, the ID for the created table. If not specified, the table will have no ID.
*		tableClass - String, the class for the created table. If not specified, the table will have no class.
*		tableStyle - Object, containing style property - value pairs to be applied to the created table. 
*		headerCellStyle - Object, containing style property - value pairs to be applied to each cell in the table header
*		bodyCellStyle - Object, containing style property - value pairs to be applied to each cell in the table body
*		headerCellValues - Object, containing the column name - display name pairs for all the columns to be shown in the table. This is a REQUIRED FIELD.
*		bodyCellValues - Object, containing the column name - display function pairs for generating the display of the body cells. If not specified, the field value will be displayed.
*	containerId - String, the ID of the containing element the table will be appended to. If not specified, the function will return the table element.
*/
tableFunctions.generateTable = function(objData, objTableParameters, containerId) {
	var table, //The table element created by this function
		thead, //The thead  element for the created table
		tbody, //The tbody element for the created table
		row, //Handle for the various tr elements for the created table
		cell, //Handle for the various td elements for the created table
		count, //Counter variable for loops
		style, //Holder variable for adding various styles to various elements
		column; //Holder variable for the current column name
	
	//If no parameters object was passed in, exit the function
	if (!objTableParameters) return;
	
	//Create the table element
	table = document.createElement('table');
	//Add any given style information to the table element if given
	for (style in objTableParameters.tableStyle) {
		table.style[style] = objTableParameters.tableStyle[style];
	}
	
	//Add the given class(es) to the table element if given
	if (objTableParameters.tableClass) {
		table.className = objTableParameters.tableClass;
	}
	
	//Add the given ID to the table element if given
	if (objTableParameters.tableId) {
		table.id = objTableParameters.tableId;
	}
	
	//Create the thead element for the table
	thead = document.createElement('thead');
	row = document.createElement('tr');
	//Add column header cells to the table. Only add the columns specified in the parameters object
	for (column in objTableParameters.headerCellValues) {
		cell = document.createElement('td');
		
		//Set the header cell value to the given value from the parameters object
		cell.innerHTML = objTableParameters.headerCellValues[column];
		
		//Add any given style information to the table header cells if given
		for (style in objTableParameters.headerCellStyle) {
			cell.style[style] = objTableParameters.headerCellStyle[style];
		}
		
		row.appendChild(cell);
	}
	thead.appendChild(row);
	table.appendChild(thead);
	
	//Createthe tbody element for the table
	tbody = document.createElement('tbody');
	for (count = 0; count < objData.length; count++) {
		row = document.createElement('tr');
		
		//We only need to worry about the body cells for the columns that were set to be displayed
		for (column in objTableParameters.headerCellValues) {
			cell = document.createElement('td');
			
			//Add any given style information to the table header cells if given
			for (style in objTableParameters.bodyCellStyle) {
				cell.style[style] = objTableParameters.bodyCellStyle[style];
			}
			
			//If a function has been given to generate the display for this cell use it, else use default display
			if (objTableParameters.bodyCellValues[column]) {
				cell.innerHTML = objTableParameters.bodyCellValues[column](objData[count]);
			} else {
				if (objData[count][column]) {
					cell.innerHTML = objData[count][column];
				} else {
					cell.innerHTML = '&nbsp;';
				}
			}
			
			row.appendChild(cell);
		}
		
		tbody.appendChild(row);
		objData[count].Row = row;
	}
	table.appendChild(tbody);
	
	//Insert the generated table into the given container element if given, else return the table.
	if (containerId) {
		document.getElementById(containerId).appendChild(table);
	} else {
		return table;
	}
}