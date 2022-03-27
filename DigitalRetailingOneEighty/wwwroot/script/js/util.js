var Util = {};

Util.format = {
	number: function(num, precision){
		precision = precision || 0;
		num = isNaN(num) || num === '' || num === null ? 0 : parseFloat(num);
		var split = num.toFixed(precision).split(".");
		split[0] = split[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
		return split.join(".");
	},
	numberPositive: function(num, precision){
		precision = precision || 0;
		num = isNaN(num) || num === '' || num === null || +num < 0 ? 0.00 : num;
		return Util.format.number(num, precision);
	},
	percent: function(num, precision){
		precision = typeof precision !== 'undefined' ? precision : 2;
		return Util.format.number(num, precision) + '%';
	},
	percentPositive: function(num, precision) {
		num = isNaN(num) || num === '' || num === null || +num < 0 ? 0 : num;
		return Util.format.percent(num);
	},
	currency: function(num, precision){
		precision = typeof precision !== 'undefined' ? precision : 2;
		num = isNaN(num) || num === '' || num === null ? 0.00 : num;
		return '$' + Util.format.number(num, precision);
	},
	currencyPositive: function(num){
		num = isNaN(num) || num === '' || num === null || +num < 0 ? 0.00 : num;
		return Util.format.currency(num, 2);
	},
	currencyNegate: function (num) {
		num = isNaN(num) || num === '' || num === null ? 0.00 : num;
	    return Util.format.currency(num*-1, 2);
	},
	currencyBlank: function(num){
		if (isNaN(num) || num === '' || num === null) return '';
		return Util.format.currency(num, 2);
	},
	address: function (strAddress, strCity, strProvince, strPostal) {
		var arr = [];
		if (strCity) arr.push(strCity);
		if (strProvince) arr.push(strProvince);
		if (strPostal) arr.push(strPostal);
		return (strAddress ? strAddress + '<br />' : '') + arr.join(', ');
	},
	phone: function(strPhone) {
		if (!strPhone || strPhone.length === 0) {
			return '';
		}

		strPhone = strPhone.replace(/ /g, '');
		if (strPhone.length == 7) {
			return strPhone.substr(0, 3) + '-' + strPhone.substr(3, 4);
		} else if (strPhone.length == 10) {
			return '(' + strPhone.substr(0, 3) + ') ' + strPhone.substr(3, 3) + '-' + strPhone.substr(6, 4);
		} else if (strPhone.length > 10) {
			return '(' + strPhone.substr(0, 3) + ') ' + strPhone.substr(3, 3) + '-' + strPhone.substr(6, 4) + ' x' + strPhone.substr(10, strPhone.length - 10);
		} else {
			return strPhone;
		}
	},
	time: function (time) {
		if (time && typeof time == 'string') {
			var x = time.split(':');
			var hour = +x[0];
			var amPM = (hour >= 12 && hour < 24 ? ' PM' : ' AM');
			return (hour%12===0 ? '12' : String(hour%12)) + ':' + x[1] + amPM;
		}
		return time;
	},
	postalCode: function(pcode){
		var regex = /^\s*([a-ceghj-npr-tvxy]\d[a-ceghj-npr-tv-z])(\s)?(\d[a-ceghj-npr-tv-z]\d)\s*$/i;
		if (regex.test(pcode)) {
			var parts = pcode.match(regex);
			var pc = parts[1] + " " + parts[3];
			return pc.toUpperCase();
		} else {
			return pcode;
		}
	},
	numberPlain: function (num, precision) {
		precision = precision || 0;
		return Util.format.number(num, precision).replace(',','');
	}
};

Util.format.xml = Util.format.xml || (function () {
	return {
		removeSpecialCharacters: function (strInput) {
			// Accepted Characters
			//!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~

			// Converted Characters
			//È É Ê Ë è é ê ë -> e
			//À Á Â Ã Ä Å à á â ã ä å -> a
			//Ç ç -> c
			//Ì Í Î Ï ì í î ï -> i
			//Ò Ó Ô Õ Ö ò ó ô õ ö -> o
			//Ù Ú Û Ü ù ú û ü -> u
			//Ñ ñ -> n
			//Ý ý ÿ  -> y
			var strReturn = "";
			var c = "";
			var i;
			for (i = 0; i < strInput.length; i++) {
				c = strInput.charAt(i);
				if (c === "È" || c === "É" || c === "Ê" || c === "Ë") {
					c = "E";
				} else if (c === "è" || c === "é" || c === "ê" || c === "ë") {
					c = "e";
				} else if (c === "À" || c === "Á" || c === "Â" || c === "Ã" || c === "Ä" || c === "Å") {
					c = "A";
				} else if (c === "à" || c === "á" || c === "â" || c === "ã" || c === "ä" || c === "å") {
					c = "a";
				} else if (c === "Ç") {
					c = "C";
				} else if (c === "ç") {
					c = "c";
				} else if (c === "Ì" || c === "Í" || c === "Î" || c === "Ï") {
					c = "I";
				} else if (c === "ì" || c === "í" || c === "î" || c === "ï") {
					c = "i";
				} else if (c === "Ò" || c === "Ó" || c === "Ô" || c === "Õ" || c === "Ö") {
					c = "O";
				} else if (c === "ò" || c === "ó" || c === "ô" || c === "õ" || c === "ö") {
					c = "o";
				} else if (c === "Ù" || c === "Ú" || c === "Û" || c === "Ü") {
					c = "U";
				} else if (c === "ù" || c === "ú" || c === "û" || c === "ü") {
					c = "u";
				} else if (c === "Ñ") {
					c = "N";
				} else if (c === "ñ") {
					c = "n";
				} else if (c === "Ý" || c === "") {
					c = "Y";
				} else if (c === "ý" || c === "ÿ") {
					c = "y";
				} else {
					if (c === "!" || c === "\"\"" || c === "#" || c === "$" || c === "%" || c === "&" || c === "\'" || c === "(" || c === ")" || c === "*" || c === "+"
							   || c === "," || c === "-" || c === "." || c === "/" || c === "0" || c === "1" || c === "2" || c === "3" || c === "4" || c === "5"
							   || c === "6" || c === "7" || c === "8" || c === "9" || c === ":" || c === ";" || c === "<" || c === "=" || c === ">" || c === "?"
							   || c === "@" || c === "A" || c === "B" || c === "C" || c === "D" || c === "E" || c === "F" || c === "G" || c === "H" || c === "I"
							   || c === "J" || c === "K" || c === "L" || c === "M" || c === "N" || c === "O" || c === "P" || c === "Q" || c === "R" || c === "S"
							   || c === "T" || c === "U" || c === "V" || c === "W" || c === "X" || c === "Y" || c === "Z" || c === "[" || c === "\\" || c === "]"
							   || c === "^" || c === "_" || c === "`" || c === "a" || c === "b" || c === "c" || c === "d" || c === "e" || c === "f" || c === "g"
							   || c === "h" || c === "i" || c === "j" || c === "k" || c === "l" || c === "m" || c === "n" || c === "o" || c === "p" || c === "q"
							   || c === "r" || c === "s" || c === "t" || c === "u" || c === "v" || c === "w" || c === "x" || c === "y" || c === "z" || c === "{"
							   || c === "|" || c === "}" || c === "~") {
						c = c;
					} else {
						c = " ";
					}
				}
				strReturn = strReturn + c;
			}
			 return strReturn;
		},
		escapeChar: function (strInput) {
			//   & - &amp;
			//   < - &lt;
			//   > - &gt;
			//   " - &quot;
			//   ' - &#39;
			//	intMaxLength <= 0 if no length requirement.
			if (strInput.length > 0) {
				strInput = strInput.replace(/&/g, "&amp;");
				strInput = strInput.replace(/</g, "&lt;");
				strInput = strInput.replace(/>/g, "&gt;");
				strInput = strInput.replace(/\"/g, "&quot;");
				strInput = strInput.replace(/\'/g, "&#39;");

				strInput = strInput.replace(/&amp;amp;/g, "&amp;");
				strInput = strInput.replace(/&amp;lt;/g, "&lt;");
				strInput = strInput.replace(/&amp;gt;/g, "&gt;");
				strInput = strInput.replace(/&amp;quot;/g, "&quot;");
				strInput = strInput.replace(/&amp;#39;/g, "&#39;");
			} else {
				strInput = "";
			}
			return strInput;
		}
	};
})();

Util.unformat = {
	number: function(value){
		value = ''+value;
		return +(value.replace(/[^0-9\.\-]/g, ''));
	},
	numberPositive: function(value){
		value = ''+value;
		return Math.max(+(value.replace(/[^0-9\.\-]/g, '')), 0);
	},
	percent: function(value){
		value = ''+value;
		return +(value.replace(/[^0-9\.\-]/g, ''));
	},
	percentPositive: function(value){
		value = ''+value;
		return Math.max(+(value.replace(/[^0-9\.\-]/g, '')), 0);
	},
	currency: function(value){
		value = ''+value;
		return +(value.replace(/[^0-9\.\-]/g, ''));
	},
	currencyPositive: function(value){
	    value = ''+value;
	    return Math.max(+(value.replace(/[^0-9\.\-]/g, '')), 0);
	},
	currencyNegate: function(value){
		return -1 * Util.unformat.currency(value);
	},
	currencyBlank: function(value){
		value = ''+value;
		return +(value.replace(/[^0-9\.\-]/g, ''));
	},
	address: function (value) {
		return value;
	},
	phone: function(value) {
		return (value || '').replace(/[^0-9]/g, '');
	},
	time: function(value) {
		return value;
	},
	postalCode: function(pcode){
		return pcode;
	},
	numberPlain: function (value) {
		return value;
	}
};
