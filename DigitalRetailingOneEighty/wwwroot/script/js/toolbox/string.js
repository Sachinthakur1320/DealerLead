(function(factory) {
    if ((typeof define === 'function' && define.amd)) {
        // [1] AMD anonymous module
        define(factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        OEC = (typeof OEC ==='undefined' ? {} : OEC);
		OEC.string = OEC.string || factory();
    }
})(function () {
	var exports = {};

	exports.supplant = function (str, o) {
		var replacer = (typeof o === 'function')
			? function (a, b) { return o(b); }
			: function (a, b) {
				var r = o[b];
				return (typeof r === 'string' || typeof r === 'number') ? r : a;
			};
		return str.replace(/{([^{}]*)}/g, replacer);
	};

	exports.trim = function (str) {
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	};

	exports.removeHtml = function (o) {
		if (typeof o !== 'string') { return ''; }
		return o
			.replace(/\r\n|\r/g, '\n')
			.replace(/<br[ \/]?[^>]*>/gi, '\n')
			.replace(/<a\s(?:.(?!=href))*?href="([^"]*)"[^>]*?>(.*?)<\/a>/gi, '$1 ($2)') //extract links from anchors
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/gi, ' ');
	};

    exports.removeInvalidCharacters = function (strValue) {
        // Using ^ to exclude the following chars - space is significant before !, character ! - z on the ascii table plus (|)~.  Square brackets are just the container and /gi is the global case insensitive search
        // This represents Ascii values 32 thru 126 on the ascii table plus French/other language chars 128-154 , 160-165 , 181-183 , 210-212 , 224 and 226-237 
        // Characters included in the regex are À Á Â Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ù Ú Û Ü Ý Ÿ à á â ä å æ ç è é ê ë ì í î ï ñ ò ó ô õ ö ù ú û ü ý ÿ 
        var strNewValue = strValue.replace(/[^ !-z{|}~ÇìÄÅÉÆÿÖÜÑÁÂÀÊËÈÍÎÏÓÔÒÕÚÛÙÝ]/gi, ""); 
    return strNewValue;
};
    
    /**
        * Scans a string for anything that "looks like" a url (begins with https?:// or www.) and
        * replaces it with a simple &lt;a&gt; href link (that targets a new tab/window. The text is of the link
        * is the link truncated to the domain with a elipsis if the link was more than that

        * @method
        * @param {String} text The text to linkify
        * @returns {String} The text with the html for links inserted
        */
    exports.linkify = (function () {
        var reUrl = /((\bhttps?:\/\/)|((\bhttps?:\/\/)?(www\.)))[-A-Za-z0-9+&@#/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#/%=~_()|]/gi;
        var reUrlHost = /\b(https?:\/\/)?([-A-Za-z0-9+&@#%=~_()|!:,.;]*[\/\?]?)/i;
        var reProtocol = /^https?:\/\//i;

        return function (text) {
            return text.replace(reUrl, function (a) {
                var trunc = (a.match(reUrlHost)[2] || 'url');
                var link = reProtocol.test(a) ? a : ('http://' + a);
                if (/[\/\?]$/.test(trunc)) { trunc += '...'; }
                return '<a href="' + link + '" target="_BLANK">' + trunc + '</a>';
            });
        };
    }())

	return exports;
});