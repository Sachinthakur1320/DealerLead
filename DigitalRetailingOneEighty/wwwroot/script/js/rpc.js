/** JSON-RPC Client
 * Version 0.1.2 (1-16-2007) 
 * Author: Michael Schots
 *
 * See the following specifications:
 *   - JSON-RPC 1.0: <http://json-rpc.org/wiki/specification/>
 *   - JSON-RPC 1.1 (draft): <http://json-rpc.org/wd/JSON-RPC-1-1-WD-20060807.html>
 *
 * Usage:
 * var service = new rpc.ServiceProxy("/app/service", {
 *                         asynchronous: true,   //default: true
 *                         sanitize: true,       //default: true
 *                         methods: ['greet'],   //default: null (synchronous introspection populates)
 *                         protocol: 'JSON-RPC', //default: JSON-RPC (currently only JSON-RPC is supported)
 * });
 *
 * Asynchronous mode:
 * service.greet({
 *    params:["World"],
 *    onSuccess:function(message){
 *        alert(message);
 *    },
 *    onException:function(e){
 *        alert("Unable to greet because: " + e);
 *        return true;
 *    }
 * });
 * -- or --
 * service.greet(["World"], onSuccess, onException, onComplete);
 * 
 * Synchronous mode:
 * try {
 *    var message = service.greet("World");
 *    alert(message);
 * }
 * catch(e){
 *    alert("Unable to greet because: " + e);
 * }
 */
 
var rpc = {
	version:'0.1.2',
	requestCount:0
};

rpc.ServiceProxy = function (url, options) {
	this._serviceURL = url;
	
	//Determine if accessing the server would violate the same origin policy
	this._isCrossSite = false;
	var urlParts = this._serviceURL.match(/^(\w+:)\/\/([^\/]+?)(?::(\d+))?(?:$|\/)/);
	if (urlParts) {
		this._isCrossSite = (
			location.protocol !=  urlParts[1] ||
			document.domain   !=  urlParts[2] ||
			location.port     != (urlParts[3] || "")
		);
	}	
	
	//Set Default Options
	var providedMethodList;
	this._isAsynchronous = true;
	this._isResponseSanitized = true;
	this._authUsername = null;
	this._authPassword = null;
	this._callbackParamName = 'JSON-response-callback';
	this._protocol = 'JSON-RPC';
	this._decodeISO8601 = true; //JSON only
	
	//Get the provided options
	if (options instanceof Object) {
		if (options.asynchronous !== undefined) {
			this._isAsynchronous = !!options.asynchronous;
			if (!this._isAsynchronous && this._isCrossSite) {
				throw new Error("It is not possible to establish a synchronous connection to a cross-site RPC service.");
			}
		}
		if (options.sanitize !== undefined)
			this._isResponseSanitized = !!options.sanitize;
		if (options.user !== undefined)
			this._authUsername = options.user;
		if (options.password !== undefined)
			this._authPassword = options.password;
		if (options.callbackParamName !== undefined)
			this._callbackParamName = options.callbackParamName;
		if (options.decodeISO8601 !== undefined)
			this._decodeISO8601 = !!options.decodeISO8601;
		if (options.appVersion !== undefined)
			this.appVersion = options.appVersion;
			
		//# For now only JSON-RPC is supported
		//if (String(options.protocol).toUpperCase() == 'XML-RPC')
		//	this._protocol = 'XML-RPC';
		providedMethodList = options.methods;
	}
	if (this._isCrossSite) {
		if (this._isResponseSanitized) {
			throw new Error("You are attempting to access a service on another site, and the JSON data returned " +
						"by cross-site requests cannot be sanitized. You must therefore explicitly set the " +
						"'sanitize' option to false (it is true by default) in order to proceed with making " +
						"potentially insecure cross-site rpc calls.");
		}
		else if (this._protocol == 'XML-RPC') {
			throw new Error("Unable to use the XML-RPC protocol to access services on other domains.");
		}
	}
	
	//Obtain the list of methods
	if(this._isCrossSite && !providedMethodList) {
		throw new Error("You must manually supply the service's method names since auto-introspection is not permitted for cross-site services.");
	}
	
	//If a method list was provided, use it. Otherwise populate it via synchronous introspection
	if(providedMethodList)
		this._methodList = providedMethodList;
	else {
		//Switch to synchronous mode and call the system.listMethods method of the service
		var async = this._isAsynchronous;
		this._isAsynchronous = false;
		this._methodList = this._callMethod("system.listMethods", []);
		this._isAsynchronous = async;
	}
	this._methodList.push('system.listMethods');
	//this._methodList.push('system.describe');
	
	//Create wrapper functions for all methods obtained above
	for (var methodName, i = 0; methodName = this._methodList[i]; i++) {
		//Methods are added with support for object nesting (property chains)
		var methodObject = this;
		var propChain = methodName.split(/\./);
		for (var j = 0; j+1 < propChain.length; j++) {
			if (!methodObject[propChain[j]]) {
				methodObject[propChain[j]] = {};
			}
			methodObject = methodObject[propChain[j]];
		}
	
		//Create a wrapper to this._callMethod with this instance and this methodName bound
		var wrapper = (function (instance, methodName) {
			var call = {instance:instance, methodName:methodName}; //Pass parameters into closure
			return function () {
				if (call.instance._isAsynchronous) {
					if (arguments.length == 1 && arguments[0] instanceof Object) {
						call.instance._callMethod(call.methodName,
												 arguments[0].params,
												 arguments[0].onSuccess,
												 arguments[0].onException,
												 arguments[0].onComplete);
					}
					else {
						call.instance._callMethod(call.methodName,
												 arguments[0],
												 arguments[1],
												 arguments[2],
												 arguments[3]);
					}	
					return undefined;
				}
				else return call.instance._callMethod(call.methodName, rpc.toArray(arguments));
			};
		})(this, methodName);
		
		methodObject[propChain[propChain.length-1]] = wrapper;		
	}
};

/**
	This method changes the synchronous mode
*/
rpc.ServiceProxy.prototype.setAsynchronous = function (value) {
	this._isAsynchronous = !!value;
};

/**
	Internal function used to execute the remote calls
*/
rpc.ServiceProxy.prototype._callMethod = function(methodName, params, successHandler, exceptionHandler, completeHandler) {
	rpc.requestCount++;

	//Verify that successHandler, exceptionHandler, and completeHandler are functions
	if (this._isAsynchronous) {
		if(successHandler && typeof successHandler != 'function')
			throw new Error('The asynchronous onSuccess handler callback function you provided is invalid; the value you provided (' + successHandler.toString() + ') is of type "' + typeof(successHandler) + '".');
		if(exceptionHandler && typeof exceptionHandler != 'function')
			throw new Error('The asynchronous onException handler callback function you provided is invalid; the value you provided (' + exceptionHandler.toString() + ') is of type "' + typeof(exceptionHandler) + '".');
		if(completeHandler && typeof completeHandler != 'function')
			throw new Error('The asynchronous onComplete handler callback function you provided is invalid; the value you provided (' + completeHandler.toString() + ') is of type "' + typeof(completeHandler) + '".');
	}
	
	try {
		//Assign the provided callback function to the response lookup table
		if (this._isAsynchronous || this._isCrossSite) {
			rpc.pendingRequests[String(rpc.requestCount)] = {
				onSuccess:successHandler,
				onException:exceptionHandler,
				onComplete:completeHandler
			};
		}

		//Asynchronous cross-domain call (JSON-in-Script) -----------------------------------------------------
		if (this._isCrossSite) { //then this.__isAsynchronous is implied
			//Create an ad hoc function specifically for this cross-site request; this is necessary because it is 
			//  not possible pass an JSON-RPC request object with an id over HTTP Get requests.
			rpc.callbacks['r' + String(rpc.requestCount)] = (function (instance, id) {
				var call = {instance: instance, id: id}; //Pass parameter into closure
				return function(response){
					if(response instanceof Object && (response.result || response.error)){
						response.id = call.id;
						instance._doCallback(response);
					}
					else {//Allow data without response wrapper (i.e. GData)
						instance._doCallback({id: call.id, result: response});
					}
				}
			})(this, rpc.requestCount);
			//Make the request by adding a SCRIPT element to the page
			var script = document.createElement('script');
			script.setAttribute('type', 'text/javascript');
			var src = this.__serviceURL +
						'/' + methodName +
						'?' + this.__callbackParamName + '=rpc.callbacks.r' + (rpc.requestCount);
			if(params)
				src += '&' + rpc.toQueryString(params);
			script.setAttribute('src', src);
			script.setAttribute('id', 'rpc' + rpc.requestCount);
			var head = document.getElementsByTagName('head')[0];
			rpc.pendingRequests[rpc.requestCount].scriptElement = script;
			head.appendChild(script);
			
			return undefined;
		//Calls made with XMLHttpRequest ------------------------------------------------------------
		} else {
			//Obtain and verify the parameters
			if (params) {
				if (!(params instanceof Object) || params instanceof Date) //JSON-RPC 1.1 allows params to be a hash not just an array
					throw new Error('When making asynchronous calls, the parameters for the method must be passed as an array (or a hash); the value you supplied (' + String(params) + ') is of type "' + typeof(params) + '".');
			}
			
			//Prepare the XML-RPC request
			var request,postData;
			if(this._protocol == 'JSON-RPC') {
				request = {
					version:"1.1",
					method:methodName,
					id:rpc.requestCount
				};
				if(params)
					request.params = params;
				if(this.appVersion)
					request.appVersion = this.appVersion;
				postData = this.toJSON(request);
			} else {
				throw new Error('Protocol: ' + this._protocol + ' is not recognized.');
			}
			
			//XMLHttpRequest chosen (over Ajax.Request) because it propogates uncaught exceptions
			var xhr;
			if(window.XMLHttpRequest)
				xhr = new XMLHttpRequest();
			else if(window.ActiveXObject){
				try {
					xhr = new ActiveXObject('Msxml2.XMLHTTP');
				} catch(err){
					xhr = new ActiveXObject('Microsoft.XMLHTTP');
				}
			}
			xhr.open('POST', this._serviceURL, this._isAsynchronous, this._authUsername, this._authPassword);			
			//xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xhr.setRequestHeader('Accept', 'application/json');
			
			//Asynchronous same-domain call -----------------------------------------------------
			if (this._isAsynchronous) {
				//Send the request
				xhr.send(postData);
				
				//Handle Response
				var instance = this;
				var requestInfo = {id:rpc.requestCount};
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
						if (xhr.status != 200) {
							instance._doCallback({error:{message:'RPC Server Error: server returned status of ' + xhr.status},id:rpc.requestCount});
							return;
						}
						var response = instance.evalJSON(xhr.responseText, instance._isResponseSanitized);
						if (!response.id)
							response.id = requestInfo.id;
						instance._doCallback(response);
					}
				};
				return undefined;
				
			//Synchronous same-domain call -----------------------------------------------------
			} else {
				//Send the request
				xhr.send(postData);
				var response;
				if (xhr.status != 200) {
					throw new Error('RPC Server Error: server returned status of ' + xhr.status);
				}
				response = this.evalJSON(xhr.responseText, this._isResponseSanitized);
				if (response.error)
					//throw new Error(response.error.message);
					throw response.error;
				else
					return response.result;
			}
		}		
	}
	catch(err){
		var isCaught = false;
		if(exceptionHandler)
			isCaught = exceptionHandler(err); //add error location
		if(completeHandler)
			completeHandler();
			
		if(!isCaught)
			throw err;
	}	
};

//This acts as a lookup table for the response callback to execute the user-defined
//   callbacks and to clean up after a request
rpc.pendingRequests = {};

//Ad hoc cross-site callback functions keyed by request ID; when a cross-site request
//   is made, a function is created 
rpc.callbacks = {};

/**
	Called by asychronous calls when their responses have loaded
*/
rpc.ServiceProxy.prototype._doCallback = function(response) {
	if(typeof response != 'object')
		throw new Error('The server did not respond with a response object.');
	if (response.error && (!response.id || response.id < 0))
		throw new Error('Error with no id: ' + (response.error.message || response.error));
	if(!response.id)
		throw new Error('The server did not respond with the required response id for asynchronous calls.');
	if(!rpc.pendingRequests[response.id])
		throw new Error('Fatal error with RPC code: no ID "' + response.id + '" found in pendingRequests.');
		
	//Remove the SCRIPT element from the DOM tree for cross-site (JSON-in-Script) requests
	if (rpc.pendingRequests[response.id].scriptElement) {
		var script = rpc.pendingRequests[response.id].scriptElement;
		script.parentNode.removeChild(script);
	}
	//Remove the ad hoc cross-site callback function
	if (rpc.callbacks[response.id]) {
		delete rpc.callbacks['r' + response.id];
	}
	
	var uncaughtExceptions = [];
	
	//Handle errors returned by the server
	if (response.error !== null && response.error !== undefined) {
		//var err = new Error(response.error.message);
		var err = response.error;
		if (rpc.pendingRequests[response.id].onException) {
			try{
				if(!rpc.pendingRequests[response.id].onException(err))
					uncaughtExceptions.push(err);
			}
			catch(err2){ //If the onException handler also fails
				uncaughtExceptions.push(err);
				uncaughtExceptions.push(err2);
			}
		}
		else uncaughtExceptions.push(err);
	//Process the valid result
	} else if (response.result !== null && response.result !== undefined) {
		if (rpc.pendingRequests[response.id].onSuccess) {
			try {
				rpc.pendingRequests[response.id].onSuccess(response.result);
			}
			//If the onSuccess callback itself fails, then call the onException handler as above
			catch (err) {
				if (rpc.pendingRequests[response.id].onException) {
					try {
						if(!rpc.pendingRequests[response.id].onException(err))
							uncaughtExceptions.push(err);
					}
					catch(err2){ //If the onException handler also fails
						uncaughtExceptions.push(err);
						uncaughtExceptions.push(err2);
					}
				}
				else uncaughtExceptions.push(err);
			}
		}
	}
	//Call the onComplete handler
	try {
		if(rpc.pendingRequests[response.id].onComplete)
			rpc.pendingRequests[response.id].onComplete(response);
	}
	catch (err) { //If the onComplete handler fails
		if (rpc.pendingRequests[response.id].onException) {
			try {
				if (!rpc.pendingRequests[response.id].onException(err))
					uncaughtExceptions.push(err);
			}
			catch (err2) { //If the onException handler also fails
				uncaughtExceptions.push(err);
				uncaughtExceptions.push(err2);
			}
		}
		else uncaughtExceptions.push(err);
	}
	
	delete rpc.pendingRequests[response.id];

	//Merge any exception raised by onComplete into the previous one(s) and throw it
	if(uncaughtExceptions.length) {
		var message = 'There ' + (uncaughtExceptions.length == 1 ?
							 'was 1 uncaught exception' :
							 'were ' + uncaughtExceptions.length + ' uncaught exceptions') + ': ';
		for(var i = 0; i < uncaughtExceptions.length; i++){
			if(i)
				message += "; ";
			message += uncaughtExceptions[i].message;
		}
		var err = new Error(message);
		throw err;
	}	
};

/**
	Helper function, this function will return any javascript object, value, as its equivilent JSON encoding
*/
rpc.ServiceProxy.prototype.toJSON = function(value){
	switch(typeof value){
		case 'number':
			return isFinite(value) ? value.toString() : 'null';
		case 'boolean':
			return value.toString();
		case 'string':
			//Taken from Ext JSON.js
			var specialChars = {
				"\b": '\\b',
				"\t": '\\t',
				"\n": '\\n',
				"\f": '\\f',
				"\r": '\\r',
				'"' : '\\"',
				"\\": '\\\\',
				"/" : '\/'
			};
			return '"' + value.replace(/([\x00-\x1f\\"])/g, function(a, b) {
				var c = specialChars[b];
				if(c)
					return c;
				c = b.charCodeAt();
				//return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
				return '\\u00' + c.toString(16);
			}).replace(/([\x80-\xff])/g, function(a, b) { return '\\u00' + b.charCodeAt(0).toString(16); }) + '"';
		case 'object':
			if(value === null)
				return 'null';
			else if(value instanceof Array){
				var json = ['['];  //Ext's JSON.js reminds me that Array.join is faster than += in MSIE
				for(var i = 0; i < value.length; i++){
					if(i)
						json.push(',');
					json.push(this.toJSON(value[i]));
				}
				json.push(']');
				return json.join('');
			}
			/*else if(value instanceof Date){
				switch(this.__dateEncoding){
					case 'classHinting': //{"__jsonclass__":["constructor", [param1,...]], "prop1": ...}
						return '{"__jsonclass__":["Date",[' + value.valueOf() + ']]}';
					case '@timestamp@':
						return '"@' + value.valueOf() + '@"';
					case 'ASP.NET':
						return '"\\/Date(' + value.valueOf() + ')\\/"';
					default:
						return '"' + rpc.dateToISO8601(value) + '"';
				}
			}*/
			else if(value instanceof Number || value instanceof String || value instanceof Boolean)
				return this.toJSON(value.valueOf());
			else {
				var useHasOwn = {}.hasOwnProperty ? true : false; //From Ext's JSON.js
				var json = ['{'];
				for(var key in value){
					if(!useHasOwn || value.hasOwnProperty(key)){
						if(json.length > 1)
							json.push(',');
						json.push(this.toJSON(key) + ':' + this.toJSON(value[key]));
					}
				}
				json.push('}');
				return json.join('');
			}
		//case 'undefined':
		//case 'function':
		//case 'unknown':
		//default:
	}
	throw new TypeError('Unable to convert the value of type "' + typeof(value) + '" to JSON.'); //(' + String(value) + ') 
};

/**
	Helper functions to safely evaluate JSON
*/
rpc.isJSON = function(string){ //from Prototype String.isJSON()
    var testStr = string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(testStr);
};

rpc.ServiceProxy.prototype.evalJSON = function(json, sanitize){ //from Prototype String.evalJSON()
	//Remove security comment delimiters
	json = json.replace(/^\/\*-secure-([\s\S]*)\*\/\s*$/, "$1");
	var err;
    try {
		if(!sanitize || rpc.isJSON(json))
			return eval('(' + json + ')');
    }
	catch(e){err = e;}
    throw new SyntaxError('Badly formed JSON string: ' + json + " ... " + (err ? err.message : ''));
};

//Converts an iterateable value into an array; similar to Prototype's $A function
rpc.toArray = function(value){
	if(value instanceof Array)
		return value;
	var array = [];
	for(var i = 0; i < value.length; i++)
		array.push(value[i]);
	return array;
};
