(function ($) {
	$.fn.caret = function (pos, end) {
		var target = this[0];
		pos = pos || 0;
		end = end || pos
		if (arguments.length === 0) { //get
			if (target.selectionStart || target.selectionStart === 0) { //x-browser input/textarea
				pos = target.selectionStart;
				return pos > 0 ? pos : 0;
			} else if (target.createTextRange) { //IE input/textarea
				target.focus();
				var range = document.selection.createRange();
				if (range == null) {
					return '0';
				}
				var re = target.createTextRange();
				var rc = re.duplicate();
				re.moveToBookmark(range.getBookmark());
				rc.setEndPoint('EndToStart', re);
				return rc.text.length || 0;
			} else if (window.getSelection) { //x-browser contentEditable div
				return window.getSelection().focusOffset || 0;
			} else if (document.selection && document.selection.createRange) { //IE contentEditable div
				var range = document.selection.createRange();
				if (range.parentElement() == target) {
					var tempEl = document.createElement("span");
					target.insertBefore(tempEl, target.firstChild);
					var tempRange = range.duplicate();
					tempRange.moveToElementText(tempEl);
					tempRange.setEndPoint("EndToEnd", range);
					var caretPos = tempRange.text.length;
					$(tempEl).remove();
				}
				return caretPos || 0;
			} else {
				return 0;
			}
		//set
		} else {
			if (target.setSelectionRange) {//DOM input/textarea
				try {
					target.setSelectionRange(pos, end);
				} catch (e){}
				return true;
			} else if (target.createTextRange) { //IE input/textarea
				var range = target.createTextRange();
				range.collapse(true);
				range.moveStart('character', pos);
				range.moveEnd('character', end - pos);
				range.select();
				return true;
			} else if (document.selection) { //IE contentEditable div
				var range = document.selection.createRange();
				range.collapse(true);
				range.moveStart('character', pos);
				range.moveEnd('character', end);
                range.select();
				return true;
			} else if (window.getSelection) { //x-browser contentEditable div
				var range = window.getSelection().getRangeAt(0);	

				window.getSelection().removeAllRanges();
				var div = document.createRange();
				if (target.childNodes.length > 0 && target.childNodes[0].nodeName == "#text") {
					div.setStart(target.childNodes[0], pos);
					div.setEnd(target.childNodes[0], end);
					window.getSelection().addRange(div);
				}		
				return true;
			}
		}
	};
})(jQuery)
