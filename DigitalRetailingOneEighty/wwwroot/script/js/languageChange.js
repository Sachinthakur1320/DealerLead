/*
	Replaces _inc/language_link.asp 
	-removes the need for IE5 quirks mode "hack" to get language changing to work in the classic site
*/

var Go = function(languageId) {
	var queryString = window.location.search || "";
	var parts = queryString.split("&");

	if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) { //no querystring params, add language in
		window.location = window.location.pathname + "?L=" + languageId;
		return;
	}
	var foundLanguageParam = false;
	for (var i = 0; i < parts.length; i++) {
		var temp = parts[i].split("=");
		if (temp[0] === "L" || temp[0] === "?L") {  //found language querystring option
			temp[1] = languageId;
			parts[i] = temp[0] + "=" + temp[1];
			foundLanguageParam = true;
		}
	}
	window.location = window.location.pathname + parts.join("&") + (foundLanguageParam ? "" : "&L=" + languageId);
};