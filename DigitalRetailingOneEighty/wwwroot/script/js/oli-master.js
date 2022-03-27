/* 
 *
To get some info about OLI streams usage please follow to https://confluence.cdk.com/display/CAN/OLI+Streams

 */
(function () {
/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {

    var defined = {},
        waiting = {},
        aps = [].slice,
        main, req;

    if (typeof define === "function") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));

                //start trimDots
                var i, part;
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }
        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            main.apply(undef, args);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, i, ret, map;

        //Use name if no relName
        if (!relName) {
            relName = name;
        }

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Default to require, exports, module if no deps if
            //the factory arg has any arguments specified.
            if (!deps.length && callback.length) {
                deps = ['require', 'exports', 'module'];
            }

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name]
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw name + ' missing ' + depName;
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef) {
                    defined[name] = cjsModule.exports;
                } else if (!usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            //Drop the config stuff on the ground.
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function () {
        return req;
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (define.unordered) {
            waiting[name] = [name, deps, callback];
        } else {
            main(name, deps, callback);
        }
    };

    define.amd = {
        jQuery: true
    };
}());

/*
	@filedescription Defines the OLI namespace and provides basic utility functions and aliases
	@author Mike Schots
*/
define('oli/kernel',[],
function () {
	var global = (function () { return this; })();

	/**
	 * The host name space to all OLI methods, classes, etc
	 * @class OLI
	 * @singleton
	 */
	OLI = (typeof OLI !== 'undefined') ? OLI : {};

	/**
	 * The global namespace, this is the same as window in browsers
	 * @property {Object}
	 */
	OLI.global = global;
	/**
	 * A NOOP (no operation) function. A useful function that can be shared
	 * throughout your application, rather then create a new function
	 * instance when you need such a function
	 * @property {Function}
	 */
	OLI.NOOP = function () { };

	/** @private **/
	if (typeof console === 'undefined') {
		console = {};
		console.log = console.info = console.warn = console.error = OLI.NOOP;
	}

	/* Type Detection */
	/**
	 * Tests if the the passed object, array or string is empty
	 * @param {*} obj The object to test
	 * @returns {Boolean} True if obj is an empty object, array or string
	 */
	OLI.isEmpty = function (obj) {
		if (OLI.isString(obj) || OLI.isArray(obj)) { return obj.length === 0; }
		if (OLI.isObject(obj)) { return OLI.keys(obj).length === 0; }
		return true;
	};
	/**
	 * Tests if the passed object is a dom element, or equivelent (jquery object with content)
	 * @param {*} obj The object to test
	 * @returns {Boolean} True if the obj is an element
	 */
	OLI.isElement = function (obj) {
		if (obj && obj.nodeType === 1) { return true; }
		if (obj && obj.jquery && obj.length) { return true; }
		return false;
	};
	/**
	 * Returns the keys of the given object as array of strings
	 * Defers to browser implementation if available
	 * @method
	 * @param {Object} obj
	 * @returns {Array[String]}
	 */
	OLI.keys = Object.keys || function (obj) {
		var result = [];
		for (var key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) {
			result[result.length] = obj;
		}
		return result;
	};
	/**
	 * Tests if the passed object is an object
	 * @param {*} obj The object to test
	 * @returns {Boolean} True if the passed object is a javascript object (hash)
	 */
	OLI.isObject = function (obj) {
		return obj === Object(obj);
	};
	/**
	 * Tests if the passed object is an array
	 * @method
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is an array
	 */
	OLI.isArray = (Array.isArray) ? Array.isArray : function (obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	};
	/**
	 * Tests if the passed object is a string
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is a string
	 */
	OLI.isString = function (obj) {
		return typeof obj === 'string';
	};
	/**
	 * Tests if the passed object is a function
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is a function
	 */
	OLI.isFunction = function (obj) {
		return typeof obj === 'function';
	};
	/**
	 * Tests if the passed object is a number
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is a number
	 */
	OLI.isNumber = function (obj) {
		return typeof obj === 'number';
	};
	/**
	 * Tests if the passed object is a boolean
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is a boolean
	 */
	OLI.isBoolean = function (obj) {
		return obj === true || obj === false;
	};
	/**
	 * Tests if the passed object is null
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is null
	 */
	OLI.isNull = function (obj) {
		return obj === null;
	};
	/**
	 * Tests if the passed object is undefined
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is undefined
	 */
	OLI.isUndefined = function (obj) {
		return obj === undefined;
	};
	/**
	 * Tests if the passed object is not undefined
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is not undefined
	 */
	OLI.isDef = function (obj) {
		return obj !== undefined;
	};
	/**
	 * Tests if the passed object is null or undefined
	 * @param {*} obj The obj to test
	 * @returns {Boolean} True if the passed object is null or undefined
	 */
	OLI.isNone = function (obj) {
		return obj === undefined || obj === null;
	};

	/// Object Extention Methods
	var defaultCombinator = function (a, b) { return b; };
	OLI._baseExtend = function (objs, combinator, defaultComb) {
		if (!OLI.isArray(objs)) { throw new Error('Invalid Type: objs must be an array'); }
		combinator = combinator || defaultCombinator;
		defaultComb = defaultComb || defaultCombinator;

		var target = objs[0],
			length = objs.length,
			src, key, temp;
		if (length === 0) { return {}; }
		for (var i = 1; i < length; i += 1) {
			if (!(src = objs[i])) { continue; }
			for (key in src) {
				if (target[key] !== undefined) {
					if (typeof combinator === 'function') {
						temp = combinator;
					} else {
						temp = combinator[key] || defaultComb;
					}
					target[key] = temp.call(target, target[key], src[key], key);
				} else {
					target[key] = src[key];
				}
			}
		}
		return target;
	};
	OLI.mixin = OLI.extend = function () { return OLI._baseExtend.call(arguments[0], Array.prototype.slice.call(arguments)); };
	OLI.supplement = function () { return OLI._baseExtend.call(arguments[0], Array.prototype.slice.call(arguments), function (a, b) { return a;}); };

	OLI.activate = function (src, target) {
		var k = OLI.keys(src),
			len = k.length;
		k.forEach(function (v) {
			var fn = src[v];
			if (OLI.isFunction(fn) && target[v] === undefined) {
				target[v] = function () {
					var args = Array.prototype.slice.call(arguments, 0);
					args.unshift(target);
					return fn.apply(target, args);
				};
			}
		});
	};

	return OLI;
});

/**
 * @class oli.Compose
 * Object composition tool (ComposeJS - http://github.com/kriszyp/compose)
 * Composition methods compatible with Javascript-style prototypical inheritance.
 * Adapted by Mike Schots - 2012
 */

define('oli/compose',[], function () {
	var Create = function () { };
	var delegate = Object.create ? function (proto) {
		return Object.create(typeof proto === 'function' ? proto.prototype : proto || Object.prototype);
	} :
	function (proto) {
		Create.prototype = typeof proto === 'function' ? proto.prototype : proto;
		var instance = new Create();
		Create.prototype = null;
		return instance;
	};
	var validArg = function (arg) {
		if (!arg) { throw new Error("Compose arguments must be functions or objects"); }
		return arg;
	};
	var required = function () {
		throw new Error("This method is required and no implementation has been provided");
	};

	var mixin = function (instance, args, i) {
		// ?? use prototype inheritance for the first argument
		var value, argsLength = args.length;
		for (; i < argsLength; i += 1) {
			var arg = args[i];
			if (typeof arg === 'function') {
				// the arg is a function, use the prototype for properties
				arg = arg.prototype;
				for (var key in arg) {
					value = arg[key];
					if (typeof value === 'function' && key in instance && value !== instance[key]) {
						value = resolvePrototype(value, key, instance[key], arg.hasOwnProperty(key, instance));
					}
					if (value && value.install) {
						value.install.call(instance, key);
					} else {
						instance[key] = value;
					}
				}
			} else {
				// it is an object, copy properties, looking for modifiers
				for (var key in validArg(arg)) {
					var value = arg[key];
					if (typeof value === 'function') {
						if (value.install) {
							value.install.call(instance, key);
							continue;
						}
						if (key in instance) {
							if (value === required) {
								continue;
							}
							if (!value.overrides) {
								// add the overrides chain
								value.overrides = instance[key];
							}
						}
					}
					instance[key] = value;
				}
			}
		}
		return instance
	};

	var resolvePrototype = function (value, key, existing, own, instance) {
		if (value === required) {
			// it is a required value and is satisfied
			return existing;
		} else if (own) {
			// if it is own property, it is considered an explicit override
			if (!value.overrides) {
				// record the override hierarchy
				value.overrides = instance[key];
			}
		} else {
			// still a possible conflict, see if either value is in the other value's override chain
			var overriden = value;
			while ((overriden = overriden.overrides) !== existing) {
				if (!overriden) {
					// couldn't find existing in the the provided value's override chain
					overriden = existing;
					while ((overriden = overriden.overrides) != value) {
						if (!overriden) {
							// couldn't find value in the override chain, real conflict
							existing = function () {
								throw new Error("Conflicted method, final composer must explicitly override");
							};
							break;
						}
					}
					// use existing, since it overrides value
					value = existing;
					break;
				}
			}
		}
	};
	var extend = function () {
		var args = [this];
		args.push.apply(args, arguments);
		return Compose.apply(0, args);
	};
	var getConstructors = function (args) {
		// this function registers a set of contructors, eliminating duplicates
		// constructors that result in a diamind construction should only call the shared method once
		var constructors = [];
		var iterate = function (args, checkChildren) {
			var len = args.length;
			outer:
			for (var i = 0; i < len; i += 1) {
				var arg = args[i];
				if (typeof arg === 'function') {
					if (checkChildren && arg._getConstructors) {
						iterate(arg._getConstructors()); // this should be pre-flattened
					} else {
						for (var j = 0; j < constructors.length; j += 1) {
							if (arg === constructors[j]) {
								continue outer;
							}
						}
						constructors.push(arg);
					}
				}
			}
		};
		iterate(args, true);
		return constructors;
	};

	var Decorator = function (install) {
		var Decorator = function () {
			throw new Error("Decorator not applied");
		};
		Decorator.install = install;
		return Decorator;
	};

	var aspect = function (handler) {
		return function (advice) {
			return Decorator(function (key) {
				var baseMethod = this[key];
				if (baseMethod && !(baseMethod.install)) {
					//applying to a plain method
					this[key] = handler(this, baseMethod, advice);
				} else {
					this[key] = Compose.around(function (topMethod) {
						baseMethod && baseMethod.install.call(this, key);
						return handler(this, this[key], advice);
					});
				}
			});
		};
	};
	var around = aspect(function (target, base, advice) {
		return advice.call(target, base);
	});
	var stop = {};
	var before = aspect(function (target, base, advice) {
		return function () {
			var results = advice.apply(this, arguments);
			if (results !== stop) {
				return base.apply(this, results || arguments);
			}
		};
	});
	var undefined;
	var after = aspect(function (target, base, advice) {
		return function () {
			var results = base.apply(this, arguments);
			var adviceResults = advice.apply(this, arguments);
			return adviceResults === undefined ? results : adviceResults;
		};
	});

	var Compose = function (base) {
		var args = arguments;
		var prototype = (args.length < 2 && typeof args[0] !== 'function') ?
			args[0] : // if there is a single argument, use that as the prototype
			mixin(delegate(validArg(base)), args, 1); // normally create a delegate to start with
		var constructors = getConstructors(arguments),
			constructorsLength = constructors.length;

		var Constructor = function () {
			var instance;
			if (this instanceof Constructor) {
				// called with the new operator, proceed
				instance = this;
			} else {
				// this allows for direct calls w/o the new operator
				Create.prototype = prototype;
				instance = new Create();
			}
			// Call all constuctors
			for (var i = 0; i < constructorsLength; i += 1) {
				var constructor = constructors[i];
				var result = constructor.apply(instance, arguments);
				if (typeof result === 'object') {
					if (result instanceof Constructor) {
						instance = result;
					} else {
						for (var j in result) {
							if (result.hasOwnProperty(j)) {
								instance[j] = result[j];
							}
						}
					}
				}
			}
			return instance;
		};

		Constructor._getConstructors = function () {
			return constructors;
		};
		Constructor.extend = extend;
		if (Compose.secure === false) {
			prototype.constructor = Constructor;
		}
		Constructor.prototype = prototype;
		return Constructor;
	};

	Compose.required = required;

	Compose.Decorator = Decorator;
	Compose.stop = stop;
	Compose.before = before;
	Compose.after = after;
	Compose.around = around;

	Compose.from = function (trait, fromKey) {
		if (fromKey) {
			return (typeof trait === 'function' ? trait.prototype : trait)[fromKey];
		}
		return Decorator(function (key) {
			if (!(this[key] = (typeof trait === 'string' ? this[trait] :
				(typeof trait === 'function' ? trait.prototype : trait)[fromKey || key]))) {
				throw new Error("Source method " + fromKey + " was not available to be renamed to " + key);
			}
		});
	};

	Compose.create = function (base) {
		// create the instance
		var instance = mixin(delegate(base), arguments, 1);
		var argsLength = arguments.length;
		// for go through the arguments and call the constructors
		for (var i = 0; i < argsLength; i += 1) {
			var arg = arguments[i];
			if (typeof arg === 'function') {
				instance = arg.call(instance) || instance;
			}
		}
		return instance;
	};

	Compose.apply = function (thisObject, args) {
		return thisObject ?
			mixin(thisObject, args, 0) : // called with a target object, apply the supplied args as mixins
			extend.apply.call(Compose, 0, args); // get the Function.prototype apply function, and call() it
	};
	Compose.call = function (thisObject) {
		return mixin(thisObject, arguments, 1);
	};

	// Allow for override
	Compose._setMixin = function (newMixin) {
		mixin = newMixin;
	};
	Compose._resolvePrototype = resolvePrototype;

	return Compose;
});

define('oli/date',['./kernel'],
function (OLI) {
  /**
   * @class oli.date
   * @singleton
   *
   * Package for time oriented objects and utility functions
   */
  var date = {};

  /**
   * Returns the current time as the number of milliseconds since Jan 1, 1970
   * @returns {Number}
   */
  date.now = Date.prototype.now = Date.prototype.now || function () {
    return +(new Date());
  };

  /*
   * Adds a toJSON method for JSON.stringify to the base date object
   * if it not defined on the current platform
   * @returns {String}
   */
  Date.prototype.toJSON = Date.prototype.toJSON || function () {
    return this.toISOString();
  };

  /**
   * Returns the number of days in the month of the passed date object
   * @param {Date} [d=now] The date to check (optional)
   * @returns {Number}
   */
  date.getDaysInMonth = function (d) {
    d = d || new Date();

    var month = d.getMonth();
    if (month === 1 && date.isLeapYear(d)) { return 28; }
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  };

  /**
   * Returns true if the passed date is in a leap year
   * @param {Date|Number} [d=now] The date to check (optional)
   * @returns {Boolean}
   */
  date.isLeapYear = function (d) {
    var year = (OLI.isNumber(d)) ? d : (d || new Date()).getFullYear();
    return !(year % 400) || ( !(year % 4) && !!(year % 100) );
  };

  /**
   * Standard compare function for date objects. If portion is provided
   * the compare can be restricted to only compare the date or time
   * coponent, by default both are compared
   * @param {Date} date1 First date to compare
   * @param {Date} date2 Second date to compare
   * @param {String} [portion] "date" to only compare date portion, "time" to
   *   only compare time portion (optional)
   */
  date.compare = function (date1, date2, portion) {
    date1 = new Date(+date1);
    date2 = new Date(+(date2 || new Date()));

    if (portion == "date") {
      // Ignore times and compare dates.
      date1.setHours(0, 0, 0, 0);
      date2.setHours(0, 0, 0, 0);
    } else if (portion == "time") {
      // Ignore dates and compare times.
      date1.setFullYear(0, 0, 0);
      date2.setFullYear(0, 0, 0);
    }

    if (date1 > date2) { return 1; }
    if (date1 < date2) { return -1; }
    return 0;
  };

  date.between = function (d, start, end) {
    start = OLI.isDate(start) ? start : new Date(start);
    end = OLI.isDate(end) ? end : new Date(end);
    return this.getTime() >= start.getTime() && this.getTime() <= end.getTime();
  };

  /**
   * Returns true if the passed dates are equal
   * @param {Date} date1
   * @param {Date} date2
   * @returns {Boolean}
   */
  date.equals = function (date1, date2) {
    return (date.compare(date1, date2) === 0);
  };

  /**
   * Returns true if the passed dates are the some calandar date
   * @param {Date} date1
   * @param {Date} date2
   * @returns {Boolean}
   */
  date.isSameDay = function (date1, date2) {
    return date.isEqual( OLI.date.clearTime(new Date(date1)), OLI.date.clearTime(new Date(date2)) );
  };

  /**
   * Clears out the time component of the date by setting it to 12 AM (00:00)
   * @param {Date} [d=now] Date
   * @returns {Date}
   */
  date.clearTime = function (d) {
    d = d || new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  /**
   * Returns the current day, set to 12:00 AM (00:00)
   * @returns {Date}
   */
  date.today = function () {
    return OLI.date.clearTime(new Date());
  };

  /**
   * Resets the time component of the date object to the current time
   * @param {Date} [d=now] Date
   * @returns {Date}
   */
  date.setTimeToNow = function (d) {
    var now = new Date();
    if (!d) { return now; }

    d.setHours(now.setHours());
    d.setMinutes(now.getMinutes());
    d.setSeconds(now.getSeconds());
    d.setMilliseconds(now.getMilliseconds());
    return d;
  };

  date.clone = function (d) {
    return new Date(d.getTime());
  };

  /**
   * Adds the specified number of milliseconds to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of milliseconds to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addMilliseconds = function (d, value) {
    d.setMilliseconds(d.getMilliseconds() + value * 1);
    return this;
  };

  /**
   * Adds the specified number of seconds to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of seconds to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addSeconds = function (d, value) {
    return d.addMilliseconds(d, value * 1000);
  };

  /**
   * Adds the specified number of seconds to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of seconds to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addMinutes = function (d, value) {
    return d.addMilliseconds(d, value * 60000); /* 60*1000 */
  };

  /**
   * Adds the specified number of hours to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of hours to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addHours = function (d, value) {
    return d.addMilliseconds(d, value * 3600000); /* 60*60*1000 */
  };

  /**
   * Adds the specified number of days to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of days to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addDays = function (d, value) {
    d.setDate(d.getDate() + value * 1);
    return this;
  };

  /**
   * Adds the specified number of weeks to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of weeks to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addWeeks = function (d, value) {
    return date.addDays(d, value * 7);
  };

  /**
   * Adds the specified number of months to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of months to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addMonths = function (d, value) {
    var n = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + value * 1);
    d.setDate(Math.min(n, date.getDaysInMonth(d.getFullYear(), d.getMonth())));
    return d;
  };

  /**
   * Adds the specified number of years to this instance.
   * @param {Date} d The date to add to
   * @param {Number} value The number of years to add. The number can be positive or negative [Required]
   * @returns {Date}
   */
  date.addYears = function (d, value) {
    return d.addMonths(d, value * 12);
  };

  /**
   * Adds (or subtracts) to the value of the years, months, weeks, days, hours, minutes, seconds, milliseconds
   * of the date instance using given configuration object. Positive and Negative values allowed.
   * Example
   * --
     OLI.date.add( OLI.date.today(), { days: 1, months: 1 } );
     OLI.date.add( new Date(), { years: -1 } );

   * @param {Date} d The date to add to
   * @param {Object} config Object containing attributes (months, days, etc.)
   * @returns {Date}
   */
  date.add = function (d, config) {
    var x = config;

    if (x.milliseconds) {
      date.addMilliseconds(d, x.milliseconds);
    }
    if (x.seconds) {
      date.addSeconds(d, x.seconds);
    }
    if (x.minutes) {
      date.addMinutes(d, x.minutes);
    }
    if (x.hours) {
      date.addHours(d, x.hours);
    }
    if (x.weeks) {
      date.addWeeks(d, x.weeks);
    }
    if (x.months) {
      date.addMonths(d, x.months);
    }
    if (x.years) {
      date.addYears(d, x.years);
    }
    if (x.days) {
      date.addDays(d, x.days);
    }
    return d;
  };

  /**
   * Get the week number. Week one (1) is the week which contains the first Thursday of the year. Monday is considered the first day of the week.
   * This algorithm is a JavaScript port of the work presented by Claus Tøndering at http://www.tondering.dk/claus/cal/node8.html#SECTION00880000000000000000
   * .getWeek() Algorithm Copyright (c) 2008 Claus Tondering.
   * @param {Date} value The date to get the week of
   * @returns {Number} 1 to 53
   */
  date.getWeek = function (value) {
    var a, b, c, d, e, f, g, n, s, w;

    $y = (!$y) ? value.getFullYear() : $y;
    $m = (!$m) ? value.getMonth() + 1 : $m;
    $d = (!$d) ? value.getDate() : $d;

    if ($m <= 2) {
      a = $y - 1;
      b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
      c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
      s = b - c;
      e = 0;
      f = $d - 1 + (31 * ($m - 1));
    } else {
      a = $y;
      b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
      c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
      s = b - c;
      e = s + 1;
      f = $d + ((153 * ($m - 3) + 2) / 5) + 58 + s;
    }

    g = (a + b) % 7;
    d = (f + g - e) % 7;
    n = (f + 3 - d) | 0;

    if (n < 0) {
      w = 53 - ((g - s) / 5 | 0);
    } else if (n > 364 + s) {
      w = 1;
    } else {
      w = (n / 7 | 0) + 1;
    }

    $y = $m = $d = null;

    return w;
  };

  // Adds a set of methods from OLI.date to the selected object (by default the Date prototype), the
  // first parameter of these methods is bound to this
  date.activate = function (obj) {
    obj = obj || Date.prototype;
    ['clearTime', 'between', 'compare', 'equal', 'setTimeToNow'].forEach( function (v) {
      obj[v] = obj[v] || function () { args = Array.prototype.slice.call(arguments); args.unshift(this); return date[v].apply(this, args); };
    });
  };

  //datejs formatting
  var p = function (s, l) {
    if (!l) {
      l = 2;
    }
    return ("000" + s).slice(l * -1);
  }
  /**
   * @method format
   * Converts the value of the current Date object to its equivalent string representation.
   * Format Specifiers
   <pre>
  CUSTOM DATE AND TIME FORMAT STRINGS
  Format  Description                                                                  Example
  ------  ---------------------------------------------------------------------------  -----------------------
   s      The seconds of the minute between 0-59.                                      "0" to "59"
   ss     The seconds of the minute with leading zero if required.                     "00" to "59"

   m      The minute of the hour between 0-59.                                         "0"  or "59"
   mm     The minute of the hour with leading zero if required.                        "00" or "59"

   h      The hour of the day between 1-12.                                            "1"  to "12"
   hh     The hour of the day with leading zero if required.                           "01" to "12"

   H      The hour of the day between 0-23.                                            "0"  to "23"
   HH     The hour of the day with leading zero if required.                           "00" to "23"

   d      The day of the month between 1 and 31.                                       "1"  to "31"
   dd     The day of the month with leading zero if required.                          "01" to "31"
   ddd    Abbreviated day name. $C.abbreviatedDayNames.                                "Mon" to "Sun"
   dddd   The full day name. $C.dayNames.                                              "Monday" to "Sunday"

   M      The month of the year between 1-12.                                          "1" to "12"
   MM     The month of the year with leading zero if required.                         "01" to "12"
   MMM    Abbreviated month name. $C.abbreviatedMonthNames.                            "Jan" to "Dec"
   MMMM   The full month name. $C.monthNames.                                          "January" to "December"

   yy     The year as a two-digit number.                                              "99" or "08"
   yyyy   The full four digit year.                                                    "1999" or "2008"

   t      Displays the first character of the A.M./P.M. designator.                    "A" or "P"
          $C.amDesignator or $C.pmDesignator
   tt     Displays the A.M./P.M. designator.                                           "AM" or "PM"
          $C.amDesignator or $C.pmDesignator

   S      The ordinal suffix ("st, "nd", "rd" or "th") of the current day.            "st, "nd", "rd" or "th"

  STANDARD DATE AND TIME FORMAT STRINGS
  Format  Description                                                                  Example ("en-US")
  ------  ---------------------------------------------------------------------------  -----------------------
   d      The Locale shortDate Format Pattern                                          "M/d/yyyy"
   D      The Locale longDate Format Pattern                                           "dddd, MMMM dd, yyyy"
   F      The Locale fullDateTime Format Pattern                                       "dddd, MMMM dd, yyyy h:mm:ss tt"
   m      The Locale monthDay Format Pattern                                           "MMMM dd"
   r      The Locale rfc1123 Format Pattern                                            "ddd, dd MMM yyyy HH:mm:ss GMT"
   s      The Locale sortableDateTime Format Pattern                                   "yyyy-MM-ddTHH:mm:ss"
   t      The Locale shortTime Format Pattern                                          "h:mm tt"
   T      The Locale longTime Format Pattern                                           "h:mm:ss tt"
   u      The Locale universalSortableDateTime Format Pattern                          "yyyy-MM-dd HH:mm:ssZ"
   y      The Locale yearMonth Format Pattern                                          "MMMM, yyyy"
   </pre>
   * @param {Date}     x       The Date to format
   * @param {String}   format  A format string consisting of one or more format spcifiers (Optional).
   * @return {String}          A string representation of the current Date object.
   */
  date.format = function (x, format) {
      var locale = date.locale;

      // Standard Date and Time Format Strings. Formats pulled from Locale file and
      // may vary by culture.
      if (format && format.length == 1) {
          var c = locale.formatPatterns;
          var f = date.format;
          switch (format) {
          case "d":
              return f(x, c.shortDate);
          case "D":
              return f(x, c.longDate);
          case "F":
              return f(x, c.fullDateTime);
          case "m":
              return f(x, c.monthDay);
          case "r":
              return f(x, c.rfc1123);
          case "s":
              return f(x, c.sortableDateTime);
          case "t":
              return f(x, c.shortTime);
          case "T":
              return f(x, c.longTime);
          case "u":
              return f(x, c.universalSortableDateTime);
          case "y":
              return f(x, c.yearMonth);
          }
      }

      var ord = date.locale.ordinal || function (n) {
              switch (n * 1) {
              case 1:
              case 21:
              case 31:
                  return "st";
              case 2:
              case 22:
                  return "nd";
              case 3:
              case 23:
                  return "rd";
              default:
                  return "th";
              }
          };

      return format ? format.replace(/(\\)?(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|S)/g,
      function (m) {
          if (m.charAt(0) === "\\") {
              return m.replace("\\", "");
          }
          x.h = x.getHours;
          switch (m) {
          case "hh":
              return p(x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12));
          case "h":
              return x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12);
          case "HH":
              return p(x.h());
          case "H":
              return x.h();
          case "mm":
              return p(x.getMinutes());
          case "m":
              return x.getMinutes();
          case "ss":
              return p(x.getSeconds());
          case "s":
              return x.getSeconds();
          case "yyyy":
              return p(x.getFullYear(), 4);
          case "yy":
              return p(x.getFullYear());
          case "dddd":
              return locale.dayNames[x.getDay()];
          case "ddd":
              return locale.abbreviatedDayNames[x.getDay()];
          case "dd":
              return p(x.getDate());
          case "d":
              return x.getDate();
          case "MMMM":
              return locale.monthNames[x.getMonth()];
          case "MMM":
              return locale.abbreviatedMonthNames[x.getMonth()];
          case "MM":
              return p((x.getMonth() + 1));
          case "M":
              return x.getMonth() + 1;
          case "t":
              return x.h() < 12 ? locale.amDesignator.substring(0, 1) : locale.pmDesignator.substring(0, 1);
          case "tt":
              return x.h() < 12 ? locale.amDesignator : locale.pmDesignator;
          case "S":
              return ord(x.getDate());
          default:
              return m;
          }
      }
      ) : d.toString();
  };

  //TODO: refactor into a locale manager (ex. OLI.locale)
  date.locales = {};
  date.locale = date.locales['en-US'] = {
    /* Culture Name */
    name: "en-US",
    englishName: "English (United States)",
    nativeName: "English (United States)",

    /* Day Name Strings */
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    abbreviatedDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    shortestDayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    firstLetterDayNames: ["S", "M", "T", "W", "T", "F", "S"],

    /* Month Name Strings */
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

        /* AM/PM Designators */
    amDesignator: "AM",
    pmDesignator: "PM",

    firstDayOfWeek: 0,

    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "M/d/yyyy",
        longDate: "dddd, MMMM dd, yyyy",
        shortTime: "h:mm tt",
        longTime: "h:mm:ss tt",
        fullDateTime: "dddd, MMMM dd, yyyy h:mm:ss tt",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "MMMM dd",
        yearMonth: "MMMM, yyyy"
    }
  };
  date.locales['fr-CA'] = {
    /* Culture Name */
    name: "fr-CA",
    englishName: "French (Canada)",
    nativeName: "français (Canada)",

    /* Day Name Strings */
    dayNames: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    abbreviatedDayNames: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
    shortestDayNames: ["di", "lu", "ma", "me", "je", "ve", "sa"],
    firstLetterDayNames: ["d", "l", "m", "m", "j", "v", "s"],

    /* Ordinal */
    ordinal: function (x) {
      if (x < 1) { return ''; }
      if (x === 1) { return 're'; }
      return 'e';
    },

    /* Month Name Strings */
    monthNames: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    abbreviatedMonthNames: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],

        /* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 0,

    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy-MM-dd",
        longDate: "d MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "d MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d MMMM",
        yearMonth: "MMMM, yyyy"
    }
  };

  return date;
});

/*
	@author Mike Schots
*/
define('oli/functions',[],function () {
var slice = Array.prototype.slice;
/**
* @class oli.functions
* @singleton
* Provides various function utility functions
*/
var functions = {
	/**
	* Creates a function that always returns the same value
	* @param {*} retValue The value to return.
	* @returns The new function
	*/
	constant: function (retValue) {
		return function () { return retValue; };
	},

	isFunction: function (fn) {
		return (typeof fn === 'function');
	},
	/**
	* Ensures that the passed object is a function. If the passed value is a function is
	* simply return, otherwise a constant wrapper function is returned for it. Use this
	* in areas where you expect a callback function, but can except a static value (basically
	* passing a static callback's result directly)
	* @param {*} value The value to wrap
	* @returns {Function}
	*/
	toFunction: function (value) {
		return (functions.isFunction(value)) ? value : functions.constant(value);
	},

	/**
	 * A function that always returns true
	 * @property
	 */
	'FALSE': function () { return false; },

	/**
	 * A function that always retuns false
	 * @property
	 */
	'TRUE': function () { return true; },

	/**
	 * A function that always returns null
	 * @property
	 */
	'NULL': function () { return null; },

	/**
	 * A noop (no operation) function, does nothing and returns undefined
	 * @property {Function}
	 */
	'NOOP': function () { },

	/**
	 * A wrapper around console.log that can be used first order
	 * Also safely detects for the availability of console.log
	 * @property {Function}
	 */
	log: function () {
		if (OLI.isUndefined(console)) { return; }
		if (arguments.length === 1) { console.log(arguments[0]); }
		else { console.log(arguments); }
	},

	/**
	 * A function that always returns its first parameter, or undefined if nothing passed
	 * @property
	 */
	identity: function (x) { return x; },

	/**
	 * Wraps a function with a wrapper that negates the return value the wrapped function
	 */
	not: function (x) {
		return function () { return!x.apply(this, arguments); };
	},

	/**
	 * Standard equality function
	 * @property
	 */
	equal: function (a, b) {
		return a === b;
	},

	/**
	 * Returns a function bound to a property name, that when passed an object will return
	 * the property of that name of the object.
	 * @param {String} name The property name to bind to
	 */
	pluck: function (name) {
		return function (obj) { return obj[name]; };
	},

	/**
	 * Returns a function that that always errors with the given message
	 * @param {String} message The error message
	 * @returns {Function} The error-throwing function
	 */
	error: function (message) {
		return function () { throw new Error(message); };
	},

	/**
	 * Returns a wrapper that packs all arguments into an array and passes it through
	 * to the wrapped function
	 * @param {Function} fn The function to wrap
	 */
	pack: function (fn) {
		return function () { return fn.call(this, slice.call(arguments)); };
	},

	/**
	 * Returns a wrapper that takes a single array and passes it as the arguments list
	 * to the wrapped function
	 * @param {Function} fn The function to wrap
	 */
	unpack: function (fn) {
		return function (x) { return fn.apply(this, x); };
	},

	/**
	 * Returns a wrapper function that is bound to the given context. Defers
	 * to Function.prototype.bind if it is defined
	 * @method
	 * @param {Function} fn The function to wrap
	 * @param {Object} context The context to run the wrapped function under
	 * @param {*} partial* All additional parameters
	 * @returns {Function} The bound function's wrapper
	 */
	bind: (Function.prototype.bind) ?
	function (fn) {
		var args = slice.call(arguments, 1);
		return Function.prototype.bind.apply(fn, args);
	}:
	function (fn, context) {
		var partial = slice.call(arguments, 2);
		return function () {
			return fn.apply(context, partial.concat(slice.call(arguments, 0)));
		};
	},

	/**
	 * Takes a function to be wrapped and n additional parameters. Returns a function where the first
	 * n parameters of the wrapped function are bound to the additional parameters.
	 *
	 * curry(fn, args1...)(args2...) = fn(args1..., args2...)
	 * @param {Function} fn The function to curry
	 * @param {*...} args The arguments to curry
	 * @returns {Function}
	 */
	curry: function (fn) {
		var partial = slice.call(arguments, 1);
		return function () {
			return fn.apply(this, partial.concat(slice.call(arguments, 0)));
		};
	},
	/**
	 * The same as curry, but only applies the function when n arguments have been provided
	 * @param {Function} fn
	 * @param {Number} n The number of parameters the function expects
	 * @param {*...} args Arguments to curry
	 * @returns {Function}
	 */
	ncurry: function (fn, n /*, args */) {
		var partial = slice.call(arguments, 2);
		return function () {
			var args = partial.concat(slice.call(arguments, 0));
			if (args.length < n) {
				return functions.ncurry([fn, n].concat(args));
			}
			return fn.apply(this, args);
		};
	},
	/**
	 * Takes a function to be wrapped and n additional parameters. Returns a function where the last
	 * n parameters of the wrapped function are bound to the additional parameters.
	 *
	 * rcurry(fn, args1...)(args2...) = fn(args2..., args1...)
	 * @param {Function} fn The function to curry
	 * @param {*...} args The arguments to curry
	 * @returns {Function}
	 */
	rcurry: function (fn) {
		var partial = slice.call(arguments, 1);
		return function () {
			return fn.apply(this, slice.call(arguments, 0).concat(partial));
		};
	},
	/**
	 * The same as rcurry, but only applies the function when n arguments have been provided
	 * @param {Function} fn
	 * @param {Number} n The number of parameters the function expects
	 * @param {*...} args Arguments to curry
	 * @returns {Function}
	 */
	rncurry: function (fn, n /*, args */) {
		var partial = slice.call(arguments, 2);
		return function () {
			var args = slice.call(arguments, 0).concat(partial);
			if (args.length < n) {
				return functions.rncurry([fn, n].concat(args));
			}
			return fn.apply(this, args);
		};
	},
	"_": {},
	partial: function (fn/*, args*/) {
		var _ = functions["_"],
			args = slice.call(arguments, 1),
			argsLen = args.length,
			subpos = [], value;
		for (var i = 0; i < argsLen; i++) {
			args[i] === _ && subpos.push(i);
		}
		return function () {
			var spec = args.concat(slice.call(arguments, subpos.length));
			for (var i = 0; i < Math.min(subpos.length, arguments.length); i++) {
				spec[subpos[i]] = arguments[i];
			}
			for (var i = 0; i < spec.length; i++) {
				if (spec[i] === _) { return functions.partial.apply([fn].concat(spec)); }
			}
			return fn.apply(this, spec);
		};
	},
	/**
	 * Creates a variadic function, depends on the arity (number of
	 * specified arguments to the defining function
	 * The variadic function is the result of calling the defintion
	 * function will all parameters beyond the arity of the defintion
	 * to the last param.
	 * @example variadic(function (a, b) {.....})(1,2,3,4,5)
	 *   --> a = 1, b = [2,3,4,5]
	 * @param {function} fn The defining function
	 * @returns {function}
	 */
	variadic: function (fn) {
		return function () {
			var arity = fn.length,
				expanded = Array.prototype.slice.call(arguments, arity - 1),
				args = [],
				i;
			for (var i = 0; i < arity - 1; i += 1) {
				args[args.length] = arguments[i];
			}
			args[args.length] = expanded;
			return fn.apply(this, args);
		};
	},

	/**
	 * Wrap the function, saturating the argument list. It works similar to curry, except the
	 * returned function ignores its own parameters.
	 * @param {Function} fn The function to wrap
	 * @param {*...} args The parameters to bind to
	 * @returns {Function}
	 */
	saturate: function (fn) {
		var args = Array.prototype.slice.call(arguments, 1);
		return function () {
			return fn.apply(this. args);
		};
	},

	wrap: function (fn) {
		return function () {
			return fn.apply(this, arguments);
		};
	},

	/**
	 * Creates the composition of the functions passed in.
	 *
	 * Ex. compose(f, g))(a) is equivalent to f(g(a)).
	 *
	 * @param {Function...} var_args A list of functions.
	 * @return {Function} The composition of all inputs.
	 */
	compose: function(var_args) {
		var fns = Array.prototype.slice.call(arguments).map(functions.toFunction);
		var length = fns.length;
		return function() {
			var result;
			if (length) {
				result = fns[length - 1].apply(this, arguments);
			}

			for (var i = length - 2; i >= 0; i--) {
				result = fns[i].call(this, result);
			}
			return result;
		};
	},

	/**
	 * Creates a function that calls the functions passed in in sequence.
	 * This is left to right version of compose, so it works more like a pipeline.
	 *
	 * Ex. (sequence(f, g))(x) is equivalent to g(f(x)).
	 *
	 * @param {Function...} var_args A list of functions.
	 * @returns {Function} A function that calls all inputs in sequence.
	 */
	sequence: function(var_args) {
		var fns = Array.prototype.slice.call(arguments).map(functions.toFunction);
		var length = fns.length;
		return function() {
			for (var i = 0; i < length; i++) {
				arguments = [fns[i].apply(this, arguments)];
			}
			return arguments[0];
		};
	},

	/**
	 * Returns a wrapper function that excutes the wrapped function if the guard function
	 * (when passed the arguments of the wrapper) returns a truthy value. Otherwise, the
	 * `otherwise` fallback method it executed instead. Both guard and otherwise default
	 * to the identity Function
	 * @param {Function} fn The function to wrap
	 * @param {Function} [guard=OLI.Function.I] The predicate function (optional)
	 * @param {Function} [otherwise=OLI.Function.I] The function to execute instead of `fn`
	 *   when `guard` returns false. (optional)
	 * @returns {Function} The wrapped function
	 */
	guard: function (fn, guard, otherwise) {
		fn = functions.toFunction(fn);
		guard = functions.toFunction(guard || functions.identity);
		otherwise = functions.toFunction(otherwise || functions.identity);
		return function () {
			return (guard.apply(this, arguments) ? fn : otherwise).apply(this, arguments);
		};
	},

	// Predicates
	and: function () {
		var fns = Array.prototype.slice.call(arguments);
		return function () {
			var i = 0, fLen = fns.length, value;
			for ( ; i < fLen; i++) {
				if (!(value = fns[i].apply(this, arguments))) { return value; }
			}
			return true;
		};
	},
	or: function () {
		var fns = Array.prototype.slice.call(arguments);
		return function () {
			var i = 0, fLen = fns.length, value;
			for ( ; i < fLen; i++) {
				if (!(value = fns.apply(this, arguments))) { return value; }
			}
			return false;
		};
	},

	/**
	 * Executes the provided function the specified number of times
	 * @param {Function} fn The function to execute
	 * @param {Number} times The number of times to execute the function
	 * @param {Object} (context) The content to run the function under (optional)
	 */
	times: function (fn, times, context) {
		times = +times;
		if (isNaN(times) || times < 0) {
			throw new Error("Times requires a positive or zero 'times' parameter");
		}
		while (times--) {
			fn.call(context, times);
		}
	},

	/**
	 * Returns a function that calls the wrapped function with the first two arguments flipped
	 * @param {Function} fn
	 * @returns {Function}
	 */
	flip: function (fn) {
		return function () {
			var args = slice.call(arguments, 0);
			args = args.slice(1,2).concat(args.slice(0,1)).concat(args.slice(2));
			return fn.apply(this, args);
		};
	},

	/**
	 * Wraps the function where the wrapper has the same behaviour but has the added
	 * side effect of logging the arguments and return value if console.info available
	 * @param {Function} fn
	 * @retruns {Function}
	 */
	trace: function (fn, name) {
		if (typeof console === 'undefined' || typeof console.info !== 'function') { return fn; }
		var global = (function () { return this; })();
		name = name || fn.name || fn;
		return function () {
			console.info('[', name, 'apply(', (this !== global) ? this : 'global', ',', arguments, ')');
			var result = fn.apply(this, arguments);
			console.info(']', name, ' -> ', result);
			return result;
		}
	},

	/**
	 * @method Y
	 * Y-Combinator. For defining recursive anonymous functions in strict mode (which
	 * removes the use of arguments.callee. Given that javascript in a strict language
	 * the implementation is that of the Z combinator (call by value Y combinator)
	 * == Example of a anonymous factorial function
	 Y(function (recurse) {
		 return function (x) {
			 return x === 0 ? 1 : x * recurse(x - 1);
		 };
	 });
	 */
	Y: function (f) {
		return (
			(function (x) { return f(function (v) { return x(x)(v); }); })
			(function (x) { return f(function (v) { return x(x)(v); }); })
		);
	}
};
functions.K = functions.constant;
functions.I = functions.identity;

/**
* Generates a memoized version of fn, the memoized function includes a sub-function
* `clearCache` that can be used to clear out its cache. All parameters to the memoized
* function must be serializable by the set serializer for the caching to work propertly.
*
* * Set `OLI.Function.memoize.ENABLED` to false to disable all memoize functions (useful
* for testing)
* * Provides a subfunction `clearCache` that will bust that memoizers cache
*
* @member
* @param {Function} fn The function to memoize
* @param {Function} [serializer] The function that will be used to serialized the parameters, uses JSON.stringify by default (optional).
* @returns {Function} The memoized function
*/
functions.memoize = function (fn, serializer) {
	serializer = serializer || OLI.functions.memoize.SERIALIZER;
	var cache = {};
	var r =  function () {
		if (functions.memoize.ENABLED) {
			var args = Array.prototype.slice.call(arguments, 0);
			var key = serializer.encode(args);
			if (!cache.hasOwnProperty(key)) {
				cache[key] = fn.apply(this, arguments);
			}
			return cache[key];
		} else {
			return fn.apply(this, arguments);
		}
	}
	r.clearCache = function () { cache = {}; };
	return r;
};
// testing hooks
functions.memoize.ENABLED = true;
functions.memoize.SERIALIZER = { encode: JSON.stringify, decode: JSON.parse };

return functions;

});

define('oli/disposable',['./compose', './functions'],
function (Compose, functions) {
	/**
	 * @class oli.Disposable
	 */
	var Disposable = Compose(function (x) {
		this.dispose = x || functions.NOOP;
	},{
		replace: function (x) {
			if (this.dispose) { this.dispose(); }
			this.dispose = x.dispose.bind(x) || x;
			return this;
		},
		set: function (x) {
			if (this.dispose) { return this; }
			return this.replace(x);
		}
	});

	/**
	 * @class oli.DisposableArray
	 */
	var DisposableArray = Compose(function () {
		this.array = [];
		this.disposed = false;
	}, {
		push: function (x) {
			if (this.disposed) { return this; }
			this.array.push(x);
			return this;
		},
		pop: function (x) {
			if (!this.array || !this.array.length) { return this; }
			this.array.pop().dispose();
			return this;
		},
		indexOf: function (x) {
			if (this.disposed) { return null; }
			return this.array.indexOf(x);
		},
		removeAt: function (x) {
			if (this.disposed) { return this; }
			this.array.splice(x, 1);
			return this;
		},
		remove: function (x) {
			if (this.disposed) { return this; }
			this.removeAt(this.indexOf(x));
			return this;
		},
		dispose: function () {
			if (this.disposed || !this.array) { return false; }
			this.disposed = true;
			this.array.map(function (x) { return (x.dispose && x.dispose.bind(x)) || x; })
				.filter(OLI.isFunction)
				.forEach(function (x) { x(); });
			this.array = null;
			return true;
		},
		isEmpty: function () {
			return (this.disposed || this.array.length === 0);
		},
		getLength: function () {
			if (this.disposed) { return 0; }
			return this.array.length;
		}
	});

	return {
		Disposable: Disposable,
		DisposableArray: DisposableArray
	};
});

define('oli/async/observer',[ '../compose', '../functions' ], function (Compose, functions) {
	var throwError = function (e) {
		if (e.status == 406) {
			alert(langLabel[723][118]);
		}
		throw e;
	};
	/**
	 * @class oli.async.Observer
	 * An object/interface that can be passed to asynchronous streams the handle
	 * values published one them
	 *
	 * @constructor
	 * @param {Function} next The handler for normal values from the stream
	 * @param {Function} fail The handler for errors on the stream. By default throws errors
	 * @param {Function} done The handler for termination signals. no-op by default
	 */
	/**
	 * @method next
	 * Called to handle the next value on a stream
	 * @param {*} value The published value
	 */
	/**
	 * @method fail
	 * Called to handle an error on the stream. By convension no more calls the
	 * the observer should be made after this is called
	 * @param {*|Error} error The error
	 */
	/**
	 * @method done
	 * Called when the stream is terminated successfully
	 */
	var Observer = Compose(function (next, fail, done) {
		this.next = next || functions.NOOP;
		this.fail = fail || throwError;
		this.done = done || functions.NOOP;
	}, {
		dispatch: function (x) {
			if (x instanceof Error) { this.fail(x); }
			else if (x == Observer.complete) { this.done(); }
			else { this.next(x); }
		}//,
		//close: function () { this.dispatch(Observer.complete); }
	});
	Observer.complete = {};

	return Observer;
});

define('oli/monad',['./compose', './functions'], function (Compose, functions) {
	/**
	 * @class oli.Monad
	 * Core of all monadic objects, provides reusable methods and meta data
	 *
	 * To define a monad, this module must be extended, providing the unit function and new implementations
	 * for either the bind method, or both the join and map function. Additionaly if the collection monad
	 * methods are going to be used, the empty method must also be provided.
	 */
	var Monad = Compose({
		bind: function (fn) {
			fn = functions.toFunction(fn);
			return this.map(fn).join();
		},
		unit: Compose.required,
		empty: Compose.required,
		lift: function (f) {
			var self = this;
			return function (x) {
				return self.unit(f(x));
			};
		},
		map: function (f) {
			f = functions.toFunction(f);
			return this.bind(this.lift(f));
		},
		join: function () {
			return this.bind(functions.identity);
		},
		filter: function (f) {
			var self = this;
			return this.bind(function (x) {
				if (f.call(x, x)) { return self.unit(x); } else { return self.empty(); };
			});
		}
	});
	return Monad;
});

/**
 * @class oli.has
 * @singleton
 * Enviroment and platform setup library
 * Custom version of has.js (https://github.com/phiggins42/has.js)
 * Syntax is integratated into the RequireJS build system
 * Adapted by Mike Schots - 2012
 */

define('oli/has',[], function () {
	
	var isBrowser = typeof window !== "undefined" &&
			typeof location !== "undefined" &&
			typeof document !== "undefined" &&
			window.location === location && window.document === document,

		doc = isBrowser && document,
		element = doc && doc.createElement('DiV'),
		cache = { },
		global = this;

	var has = function (name) {
		var test = cache[name];
		if (typeof test === "function") {
			return cache[name] = test(global, doc, element);
		}
		return test;
	};

	has.add = function (name, test, now, force) {
		(typeof cache[name] === 'undefined' || force) && (cache[name] = test);
		return now && has(name);
	};
	has.cache = cache;

	has.add("host-browser", isBrowser);
	has.add("dom", isBrowser);
	has.add("setTimeout", function (global) { return typeof global.setTimeout !== undefined && typeof global.clearTimeout !== undefined; });

	if (has("host-browser")) {
		var agent = navigator.userAgent;
		has.add("dom-addeventlistener", !!document.addEventListener);
		has.add("touch", "ontouchstart" in document);
	}

	return has;
});

/*
  @author Mike Schots
  Portions of this code are from The Closure Javascript library, licensed under the Apache License, Version 2.0.
  Portions of this code are from Dojo Toolkit, licensed under the "new" BSD License
*/
define('oli/math',[],function () {

  /**
   * Provides mathematical utility functions.
   * @class oli.math
   * @singleton
   */
  var math = {
    /**
     * Returns a random real number between `min` and `max`. If no parameters
     * are passed the number is in the range [0 - 1) just as Math.random.
     * @param {Number} min The lower bound for the random integer.
     * @param {Number} max The upper bound for the random integer.
     * @returns {Number} A random integer N such that `min` <= N < `max`.
     */
    random: function(min, max) {
      if (arguments.length === 1) {
        max = min;
        min = 0
      } else if (arguments.length === 0) {
        min = 0;
        max = 1;
      }
      return (Math.random() * (max - min)) + min;
    },
    /**
     * Returns a random integer between `min` and `max`.
     * @param {Number} min The lower bound for the random integer
     * @param {Number} max The upper bound for the random integer.
     * @returns {Number} A random integer N such that `min` <= N <= `max`.
     */
    randomInt: function(min, max) {
      if (arguments.length === 1) {
        max = min;
        min = 0
      } else if (arguments.length === 0) {
        min = 0;
        max = 1;
      }
      return Math.floor( (Math.random() * (max - min + 1)) + min );
    },

    /**
     * Takes a number and clamps it to within the provided bounds.
     * @param {Number} value The input number.
     * @param {Number} min The minimum value to return.
     * @param {Number} max The maximum value to return.
     * @return {Number} The input number if it is within bounds, or the nearest
     *   number within the bounds.
     */
    clamp: function(value, min, max) {
      if (min > max) { min ^= max; max ^= min; min ^= max; }
      return Math.min(Math.max(value, min), max);
    },

    /**
     * The % operator in JavaScript returns the remainder of a / b, but differs from
     * some other languages in that the result will have the same sign as the
     * dividend. For example, -1 % 8 == -1, whereas in some other languages
     * (such as Python) the result would be 7. This function emulates the more
     * correct modulo behavior, which is useful for certain applications such as
     * calculating an offset index in a circular list.
     *
     * @param {Number} a The dividend.
     * @param {Number} b The divisor.
     * @return {Number} a % b where the result is between 0 and b (either 0 <= x < b
     *   or b < x <= 0, depending on the sign of b).
     */
    modulo: function(a, b) {
      var r = a % b;
      // If r and b differ in sign, add b to wrap the result to the correct sign.
      return (r * b < 0) ? r + b : r;
    },

     /**
     * Performs linear interpolation between values a and b. Returns the value
     * between a and b proportional to x (when x is between 0 and 1. When x is
     * outside this range, the return value is a linear extrapolation).
     * @param {Number} a A number.
     * @param {Number} b A number.
     * @param {Number} x The proportion between a and b.
     * @return {Number} The interpolated value between a and b.
     */
    lerp: function(a, b, x) {
      return a + x * (b - a);
    },

    /**
     * Tests whether the two values are equal to each other, within a certain
     * tolerance to adjust for floating pount errors.
     * @param {Number} a A number.
     * @param {Number} b A number.
     * @param {Number} [tolerance=0.000001] Optional tolerance range. Defaults
     *   to 0.000001. If specified, should be greater than 0. (optional)
     * @returns {Boolean} Whether `a` and `b` are nearly equal.
     */
    nearlyEquals: function(a, b, tolerance) {
      return Math.abs(a - b) <= (tolerance || 0.000001);
    },

    /**
     * For a given angle and radius, finds the X portion of the offset.
     * @param {Number} degrees Angle in degrees (zero points in +X direction).
     * @param {Number} radius Radius.
     * @return {Number} The x-distance for the angle and radius.
     */
    angleDx: function(degrees, radius) {
      return radius * Math.cos(math.toRadians(degrees));
    },

    /**
     * For a given angle and radius, finds the Y portion of the offset.
     * @param {number} degrees Angle in degrees (zero points in +X direction).
     * @param {number} radius Radius.
     * @return {number} The y-distance for the angle and radius.
     */
    angleDy: function(degrees, radius) {
      return radius * Math.sin(math.toRadians(degrees));
    },

    /**
     * Converts an angle given in degrees to the same angle in radians
     * @param {Number} degrees The angle to convert
     * @returns {Number} The angle in radians
     */
    toRadians: function (degrees) {
      return Math.PI * (degrees / 180);
    },
    /**
     * Standardizes an angle to be in range [0-360). Negative angles become
     * positive, and values greater than 360 are returned modulo 360.
     * @param {Number} angle Angle in degrees.
     * @returns {Number} Standardized angle.
     */
    standardAngle: function(angle) {
      return math.modulo(angle, 360);
    },
    /**
     * Computes the angle between two points (x1,y1) and (x2,y2).
     * Angle zero points in the +X direction, 90 degrees points in the +Y
     * direction (down) and from there we grow clockwise towards 360 degrees.
     * @param {Number} x1 x of first point.
     * @param {Number} y1 y of first point.
     * @param {Number} x2 x of second point.
     * @param {Number} y2 y of second point.
     * @returns {Number} Standardized angle in degrees of the vector from
     *   x1,y1 to x2,y2.
     */
    angle: function(x1, y1, x2, y2) {
      return math.standardAngle(math.toDegrees(Math.atan2(y2 - y1, x2 - x1)));
    },

    /**
     * Computes the difference between startAngle and endAngle (angles in degrees).
     * @param {Number} startAngle  Start angle in degrees.
     * @param {Number} endAngle  End angle in degrees.
     * @returns {Number} The number of degrees that when added to
     *   startAngle will result in endAngle. Positive numbers mean that the
     *   direction is clockwise. Negative numbers indicate a counter-clockwise
     *   direction.
     *   The shortest route (clockwise vs counter-clockwise) between the angles
     *   is used.
     *   When the difference is 180 degrees, the function returns 180 (not -180)
     *   angleDifference(30, 40) is 10, and angleDifference(40, 30) is -10.
     *   angleDifference(350, 10) is 20, and angleDifference(10, 350) is -20.
     */
    angleDifference: function(startAngle, endAngle) {
      var d = math.standardAngle(endAngle) - math.standardAngle(startAngle);
      if (d > 180) {
        d = d - 360;
      } else if (d <= -180) {
        d = 360 + d;
      }
      return d;
    },

    /**
     * Returns the sign of a number as per the "sign" or "signum" function.
     * @param {Number} x The number to take the sign of.
     * @returns {Number} -1 when negative, 1 when positive, 0 when 0.
     */
    sign: function(x) {
      return x == 0 ? 0 : (x < 0 ? -1 : 1);
    },

    /**
     * JavaScript implementation of Longest Common Subsequence problem.
     * http://en.wikipedia.org/wiki/Longest_common_subsequence
     *
     * Returns the longest possible array that is subarray of both of given arrays.
     *
     * @param {Array[Object]} array1 First array of objects.
     * @param {Array[Object]} array2 Second array of objects.
     * @param {Function} compareFn Function that acts as a custom comparator
     *   for the array ojects. Function should return true if objects are equal,
     *   otherwise false. (optional)
     * @param {Function} collectorFn Function used to decide what to return
     *   as a result subsequence. It accepts 2 arguments: index of common element
     *   in the first array and index in the second. The default function returns
     *   element from the first array. (optional)
     * @returns {Array[Object]} A list of objects that are common to both arrays
     *   such that there is no common subsequence with size greater than the
     *   length of the list.
     */
    longestCommonSubsequence: function( array1, array2, compareFn, collectorFn) {
      var compare = compareFn || function(a, b) {
        return a == b;
      };

      var collect = collectorFn || function(i1, i2) {
        return array1[i1];
      };

      var length1 = array1.length;
      var length2 = array2.length;

      var arr = [];
      for (var i = 0; i < length1 + 1; i++) {
        arr[i] = [];
        arr[i][0] = 0;
      }

      for (var j = 0; j < length2 + 1; j++) {
        arr[0][j] = 0;
      }

      for (i = 1; i <= length1; i++) {
        for (j = 1; j <= length1; j++) {
          if (compare(array1[i - 1], array2[j - 1])) {
            arr[i][j] = arr[i - 1][j - 1] + 1;
          } else {
            arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
          }
        }
      }

      // Backtracking
      var result = [];
      var i = length1, j = length2;
      while (i > 0 && j > 0) {
        if (compare(array1[i - 1], array2[j - 1])) {
          result.unshift(collect(i - 1, j - 1));
          i--;
          j--;
        } else {
          if (arr[i - 1][j] > arr[i][j - 1]) {
            i--;
          } else {
            j--;
          }
        }
      }

      return result;
    },

    /**
     * Returns the sum of the arguments.
     * @param {...Number} var_args Numbers to add.
     * @returns {Number} The sum of the arguments (0 if no arguments were provided,
     *   `NaN` if any of the arguments is not a valid number).
     */
    sum: function(var_args) {
      return (Array.prototype.reduce.call(arguments,
          function(sum, value) {
            return sum + value;
          }, 0));
    },

    /**
     * Returns the arithmetic mean of the arguments.
     * @param {...Number} var_args Numbers to average.
     * @returns {Number} The average of the arguments (`NaN` if no arguments
     *   were provided or any of the arguments is not a valid number).
     */
    average: function(var_args) {
      return math.sum.apply(null, arguments) / arguments.length;
    },

    /**
     * Returns the sample standard deviation of the arguments.  For a definition of
     * sample standard deviation, see e.g.
     * http://en.wikipedia.org/wiki/Standard_deviation
     * @param {...Number} var_args Number samples to analyze.
     * @returns {Number} The sample standard deviation of the arguments (0 if fewer
     *   than two samples were provided, or `NaN` if any of the samples is
     *   not a valid number).
     */
    standardDeviation: function(var_args) {
      var sampleSize = arguments.length;
      if (sampleSize < 2) {
        return 0;
      }

      var mean = math.average.apply(null, arguments);
      var variance = math.sum.apply(null, array.map(arguments,
          function(val) {
            return Math.pow(val - mean, 2);
          })) / (sampleSize - 1);

      return Math.sqrt(variance);
    },

    /**
     * Rounding with more options then Math.round(). And works around a bug in some versions
     * of IE for toFixed(). (From dojo toolkit)
     * @param {Number} value The number to round
     * @param {Number} places The integer number of decimal places to round to
     * @param {Number} increment Rounds next place to nearest value of increment/10
     */
    round: function (value, places, increment) {
      var wholeFigs = Math.log(Math.abs(value))/Math.log(10);
      var factor = 10 / (increment || 10);
      var delta = Math.pow(10, -15 + wholeFigs);
      return (factor * (+value + (value > 0 ? delta : -delta))).toFixed(places) / factor;
    },

    /**
     * Returns whether the supplied number represents an integer, i.e. that is has
     * no fractional component.  No range-checking is performed on the number.
     * @param {Number} num The number to test.
     * @returns {Boolean} Whether `num` is an integer.
     */
    isInt: function(num) {
      return isFinite(num) && num % 1 == 0;
    },

    /**
     * Returns whether the supplied number is finite and not NaN.
     * @param {Number} num The number to test.
     * @returns {Boolean} Whether `num` is a finite number.
     */
    isFiniteNumber: function(num) {
      return isFinite(num) && !isNaN(num);
    }
  };

  //Workaround for round for an IE bug in .toFixed()
  if((0.9).toFixed() == 0){
    // (isIE) toFixed() bug workaround: Rounding fails on IE when most significant digit
    // is just after the rounding place and is >=5
    (function () {
      var round = math.round;
      math.round = function (v, p, m) {
        var d = Math.pow(10, -p || 0), a = Math.abs(v);
        if (!v || a >= d || a * Math.pow(10, p + 1) < 5) {
          d = 0;
        }
        return round(v, p, m) + (v > 0 ? d : -d);
      }
    }());
  }

  return math;
});

define('oli/scheduler',['./compose', './disposable'],
function (Compose, disposable) {
	var Disposable = disposable.Disposable;
	var DisposableArray = disposable.DisposableArray;

	/**
	 * @class oli.Scheduler
	 */
	var Scheduler = Compose({
		schedule: function (fn, delay) {
			delay = delay || 0;
			var handle = setTimeout(fn, delay);

			return Disposable(function () {
				clearTimeout(handle);
			});
		},
		scheduleTailRecursive: function (fn, delay) {
			delay = delay || 0;
			var self = this,
				calls = DisposableArray();

			var start = function () {
				fn(function () {
					if (calls.disposed) { return; }
					var call = self.schedule(function () {
						start();
						calls.remove(call);
					}, delay);
					calls.push(call);
				});
			};
			calls.push(self.schedule(start));
			return calls;
		},
		now: Date.now
	});
	Scheduler.immediate = Compose.create(Scheduler, {
		schedule: function (fn, delay) {
			if (delay) {
				var start = this.now();
				while (this.now() < (start + delay)) { }
			}
			fn();
			return Disposable();
		}
	});
	Scheduler.timeout = new Scheduler();
	Scheduler.main = Scheduler.timeout;
	Scheduler.schedule = function () {
		return Scheduler.main.schedule.apply(Scheduler.main, arguments);
	};
	Scheduler.scheduleTailRecursive = function () {
		return Scheduler.main.scheduleTailRecursive.apply(Scheduler.main, arguments);
	};

	return Scheduler;
});


define('oli/async/stream',['../kernel', '../compose', '../monad', './observer', '../scheduler', '../disposable', '../functions'],
function (OLI, Compose, Monad, Observer, Scheduler, disposable, functions) {
	var Disposable = disposable.Disposable;
	var DisposableArray = disposable.DisposableArray;

	// TODO - Module Observer
	var schedule = Scheduler.schedule;

	var wrap = function (fn) {
		return function (x) {
			if (!x) { x = Observer(); }
			else if (typeof x.asObserver === 'function') { x = x.asObserver(); }
			else if (typeof x === 'function') { x = Observer(x, arguments[1], arguments[2]); }

			var result = fn.call(this, x);
			if (OLI.isNone(result)) { result = Disposable(); }
			else if (typeof result === 'function') { result = Disposable(result); }
			else if (typeof result.dispose !== 'function') { result = Disposable(); }
			return result;
		};
	};
	var create = function (sub) {
		if (OLI.isFunction(sub)) {
			sub = { subscribe: sub };
		}
		return Compose.create(Stream, sub, {
			subscribe: Compose.around(wrap)
		});
	};
	var _unit = function (x, scheduler) {
		scheduler = scheduler || Scheduler.immediate;
		return create(function (observer) {
			scheduler.schedule(function () {
				if (x instanceof Error) {
					observer.fail(x);
				} else {
					observer.next(x)
					observer.done();
				}
			});
			return Disposable();
		});
	};
	var _error = function (x, scheduler) {
		scheduler = scheduler || Scheduler.immediate;
		return create(function (observer) {
			scheduler.schedule(function () {
				observer.fail(x);
			});
			return Disposable();
		});
	}; 
	var _empty = function (x) {
		return create(function (observer) {
			Scheduler.immediate.schedule(function () { observer.done(); });
			return Disposable();
		});
	};

	/**
	 * @class oli.async.Stream
	 * @extends oli.Monad
	 */
	var Stream = Compose(Monad, {
		/**
		 * Function that must be defined per stream, takes an Observer (or the params to observer)
		 * or void. When called on a cold observer it will trigger the program. The passed observer
		 * will recieve all published values on the stream. If void is passed, it a dummy observer
		 * is created that allows the pipeline to run while ignoring all published values (except
		 * errors which will be thrown)
		 * @params {Observer|Function|void} observer The observer definition, if the parameter is a
		 *  function, it and and the next two parameters (if they exist) will be passed to the
		 *  constuctor for OLI.async.Observer which will create the observer that will be used.
		 * @returns {Disposable} A disposable object which closes over the stream and observer, when
		 *   the dispose method is called it will cancel the subscription
		 */
		subscribe: Compose.required,
		/**
		 * Alias to subscribe
		 */
		then: function () { return this.subscribe.apply(this, arguments); },

		/**
		 * Creates a unit stream, a stream that immediately fires its value then completes
		 * @param {*} value The value to fire
		 * @returns {Stream}
		 */
		unit: _unit,
		/**
		 * Creates an error stream, the stream fires its value in the failure channel (and does not complete)
		 * @param {*} value The value to fire
		 * @returns {Stream}
		 */
		error: _error,
		/**
		 * Returns the empty stream, the stream immediately completes without firing any
		 * values, useful in construction for a null operation
		 * @returns {Stream}
		 */
		empty: _empty,

		/**
		 * Returns a stream that publishes all values on the source stream mapped by the mapping
		 * function [fn]. If the mapping function returns a Javascript error object, the resultant
		 * stream will fail with that error.
		 * @param {Function[*->*|Error]} fn The mapping function
		 * @returns {Stream}
		 */
		// M[a] -> (a -> b) -> M[b]
		map: function (fn) {
			fn = (OLI.isFunction(fn)) ? fn : functions.identity;
			var self = this;
			return create(function(observer) {
				return self.subscribe(Observer(function (x) {
					x = fn(x);
					if (x instanceof Error) {
						observer.fail(x);
					} else {
						observer.next(x);
					}
				}, observer.fail, observer.done));
			});
		},
		/**
		 * When called on a stream containing streams it produces a new stream that with publish all
		 * values published by component streams. (It flattens a stream of streams into a stream)
		 * @returns {Stream}
		 */
		// M[ M[a] ] -> M[a]
		join: function () {
			var self = this;
			return create(function (observer) {
				var completed = false;
				var activeSubs = DisposableArray();
				var sub = Disposable();
				activeSubs.push(sub);
				sub.replace(self.subscribe(Observer(
					function (x) {
						var innerSub = Disposable();
						activeSubs.push(innerSub);
						innerSub.replace(x.subscribe(Observer(observer.next, observer.fail, function () {
							activeSubs.remove(innerSub);
							if (activeSubs.getLength() === 1 && completed) { observer.done(); }
						})));
					},
					observer.fail,
					function () {
						completed = true;
						if (activeSubs.getLength() === 1) { observer.done(); }
					}
				)));
				return activeSubs;
			});
		},
		/**
		 * A version of join that produces a stream that only publishes values on the lastest stream in
		 * the joined stream.
		 * @returns {Stream}
		 */
		joinLatest: function () {
			var self = this;
			return create(function (observer) {
				var subs = DisposableArray(),
					sub = Disposable(),
					latestDone = false,
					mainDone = false,
					latestId = 0;
				subs.push(sub);
				subs.push(self.subscribe(Observer(function (x) {
					var id = ++latestId;
					var ifLatest = function (fn) {
						return function (x) {
							if (id === latestId) { fn(x); }
						};
					};
					latestDone = false;
					sub.replace(x.subscribe(
						ifLatest(observer.next.bind(observer)),
						ifLatest(observer.fail.bind(observer)),
						ifLatest(function () {
							latestDone = true;
							if (mainDone) { observer.done(); }
						})
					));
				},
				observer.fail.bind(observer),
				function () {
					mainDone = true;
					if (latestDone) { observer.done(); }
				})));
				return subs;
			});
		},
		/**
		 * A version of bind that only preserves the stream returned for the latest value on the source
		 * stream.
		 * @param {Function} fn The binding function, takes an input from the source stream and must
		 *   return a stream
		 * @returns {Stream}
		 */
		bindLatest: function (fn) {
			return this.map(fn).joinLatest();
		},
		/**
		 * Concatentates the current stream with another stream. For streams this is defined as: The result
		 * stream produces values from the current stream until it terminates successfully, at which point
		 * values from the concatentated stream are produced.
		 * @param {Stream} a The stream to concatenate on to the current stream
		 * @returns {Stream}
		 */
		concat: function (a) {
			var self = this;
			var chain = Disposable();
			return create(function (observer) {
				chain.set(self.subscribe(Observer(observer.next, observer.fail, function () {
					chain.replace(a.subscribe(observer));
				})));
				return chain;
			});
		},
		/**
		 * Returns a stream that echos the original stream, unless it fails. In which case the failure is
		 * handled and the result stream becomes the fallback stream
		 * @param {Stream|function} back The fall back stream
		 * @returns {Streams}
		 */
		catchException: function (back) {
			var self = this;
			var chain = Disposable();
			return create(function (observer) {
				chain.set(self.subscribe(Observer(observer.next, function (ex) {
					chain.replace(functions.toFunction(back).call(null, ex).subscribe(observer));
				}, observer.done)));
				return chain;
			});
		},
		/**
		 * Provides a new stream which aggrates all values coming down the source stream. Such that every
		 * value on the source stream causes the new stream to publish the aggregate (as defined by [comb])
		 * of all previous values on the source stream.
		 * @param {Function} comb The aggregate combining function, of from Fn(prevValue, nextValue)
		 * @param {*} seed The seed value (default=undefined)
		 * @returns {Stream}
		 */
		scan: function (comb, seed) {
			var self = this;
			return create(function (observer) {
				var current = seed;
				return self.subscribe(Observer(function (x) {
					current = comb(current, x);
					observer.next(current);
				}, observer.fail, observer.done));
			});
		},
		/**
		 * Invokes the specified handler as a side-effect after the source stream terminates, either by
		 * exception or normally
		 * @param {Function} handler The action to run
		 * @returns {Stream}
		 */
		finallyAction: function (handler) {
			var h = function () {
				if (handler) { handler(); }
				handler = null;
			};
			var self = this;
			return create(function (observer) {
				var sub = self.subscribe(Observer(
					observer.next,
					function (x) { h(); observer.fail(x); },
					function () { h(); observer.done(); }
				));
				return function () {
					try {
						sub.dispose();
					} finally {
						h();
					}
				};
			});
		},
		/**
		 * Can be used to introduce additional side effects to the stream, which fires for every
		 * subscription
		 *
		 * @param {Function} callback The callback, of that accepts the pulse as the first param. This
		 *   callback will have no effect on the the data passed downstream.
		 * @returns {Stream}
		 */
		doAction: function (callback, fail, done) {
			if (callback instanceof Observer) {
				return this.doAction(callback.next, callback.fail, callback.done);
			}
			var self = this;
			return create(function (observer) {
				return self.subscribe(Observer(function (x) {
					if (callback) { callback(x); }
					observer.next(x);
				}, function (x) {
					if (fail) { fail(x); }
					observer.fail(x);
				}, function (x) {
					if (done) { done(); }
					observer.done();
				}));
			});
		},
		/**
		 * A function designed for debugging help, will log all information flow in the stream at the
		 * point the debug is introduced. Accepts an optional tag name that will be appended to each
		 * log. Which can be useful for identifing the source of the log. Will do nothing if console
		 * is not available on the platform.
		 * @param {String} tag The tagname to prepend (default='')
		 * @returns {Stream}
		 */
		debug: function (tag) {
			tag = tag || 'Stream';
			var info = (typeof console !== "undefined" && console.info)
				? function (a, b, c) { console.info(a, b, (c === undefined) ? '-' : c); }
				: functions.NOOP;
			var self = this;
			return create(function (observer) {
				return self.subscribe(Observer(
					function (x) { info(tag, 'NEXT', x); observer.next(x); },
					function (x) { info(tag, 'FAIL', x); observer.fail(x); },
					function (x) { info(tag, 'DONE'); observer.done(); }
				));
			});
		},

		/**
		 * A new steam that calms the source stream by preventing values from being published
		 * more then once every [delay] milliseconds. If a value is published on the source
		 * stream in the delay time the most recent value will be published after the delay
		 * period expires.
		 *
		 * An optional parameter [reset] can be set to true. If this is done the delay period
		 * is reset every time the source stream publishes. This is useful for UI streams where
		 * you want to wait until the user is done.
		 *
		 * @param {Number} delay The number of milliseconds to throttle the stream by
		 * @param {Boolean} reset If true the delay is reset every time the source stream
		 *   publishes (default=false)
		 * @returns {Stream}
		 */
		// TODO: decide if this can run on an overloadable scheduler
		throttle: function (delay, reset) {
			delay = isNaN(delay) ? 0 : delay;
			var self = this;
			return create(function (observer) {
				var value;
				var timerHandle;
				return self.subscribe(Observer(function (x) {
					value = x;
					if (timerHandle && reset) {
						clearTimeout(timerHandle);
						timerHandle = null;
					}
					if (!timerHandle) {
						timerHandle = setTimeout(function (x) {
							observer.next(value);
							timerHandle = null;
						}, delay);
					}
				}, observer.fail, observer.done));
			});
		},
		/**
		 * Returns a stream that publishes all values on the source stream delayed by
		 * at least [delay] milliseconds. The scheduler will publish the next value
		 * when as soon as possible after that.
		 *
		 * @param {Number} delay
		 * @returns {Stream}
		 */
		delay: function (delay) {
			delay = isNaN(delay) ? 0 : delay;
			var self = this;
			return create(function (observer) {
				var d = DisposableArray();
				var delayFn = function (fn) {
					return function (x) {
						var task = Disposable();
						d.push(task);
						task.replace(Scheduler.timeout.schedule(function () {
							fn(x);
							d.remove(task);
						}, delay));
					};
				};
				return d.push(self.subscribe(Observer(
					delayFn(observer.next.bind(observer)),
					observer.fail,
					delayFn(observer.done.bind(observer))
				)));
			});
		},
		/**
		 * Returns a stream that echos all the values of the source stream skipping
		 * [count] of the first values.
		 * @param {Number} count The number of values to skip
		 * @returns {Stream}
		 */
		skip: function (count) {
			count = isNaN(count) ? 0 : count;
			var self = this;
			return create(function (observer) {
				var i = count;
				return self.subscribe(Observer(function (x) {
					if ((i--) <= 0) { observer.next(x); }
				}, observer.fail, observer.done));
			});
		},
		/**
		 * Returns a stream that will publish all values on the source stream, but only
		 * once the conditional stream publishes a value.
		 * @param {Stream} cond The conditional stream
		 * @returns {Stream}
		 */
		skipUntil: function (cond) {
			var self = this;
			return create(function (observer) {
				var sub = Disposable();
				var next = function () {
					sub.replace(self.subscribe(observer));
				};
				return sub.replace(cond.subscribe(next, next, next));
			});
		},
		/**
		 * Returns a stream that only publishes a specified number of values echoed
		 * from the source stream
		 * @param {Number} count The maximum number of values to publish
		 * @returns {Stream}
		 */
		take: function (count) {
			count = isNaN(count) ? 0 : count;
			var self = this;
			return create(function (observer) {
				var i = 0;
				var sub;
				sub = (self.subscribe(Observer(function (x) {
					if (i < count) {
						i += 1;
						observer.next(x);
						if (i === count) {
							sub.dispose();
							observer.done();
						}
					} else {
						//Assert, this case shouldn't happen
						console.log('unexpected execution in stream take');
					}
				}, observer.fail, observer.done)));
				return sub;
			});
		},
		/**
		 * Returns a stream that publishes all values from the source stream until
		 * the conditional stream [cond] publishes. At which point the returned
		 * stream terminates.
		 * @param {Stream} cond The conditional stream
		 * @returns {Stream}
		 */
		takeUntil: function (cond) {
			var self = this;
			return create(function (observer) {
				var d = DisposableArray();
				d.push(self.subscribe(observer));
				d.push(cond.subscribe(function () {
					observer.done();
					d.dispose();
				}, observer.fail, functions.NOOP));
				return d;
			});
		},
		/**
		 * Returns a new stream that filters out sequential repeated values
		 *
		 * @param {Function} equal The equality function used to determine if a new value is
		 *   a repeat (default=oli.functions.equal)
		 *
		 */
		distinctUntilChanged: function (equal) {
			equal = equal || functions.equal;
			var self = this;
			return create(function (observer) {
				var lastValue;
				return self.subscribe(Observer(function (x) {
					if (!equal(x, lastValue)) {
						lastValue = x;
						observer.next(x);
					}
				}, observer.fail, observer.done));
			});
		},
		/**
		 * Constructs a stream by zipping the current stream with a set of others, takes
		 * a combinator function with by default returns an array of values sent by each
		 * stream as an array, in the order the streams are zipped.
		 */
		zip: function (other, comb) {
			var streams = [this].concat(other);
			return Stream.zip(streams, comb);
		},
		/**
		 * Constructs a stream that combines the current stream with a set of others. Works
		 * like zip, except instead of zipping the values by order received, combine maintains
		 * a state of the last values from each stream. So the result stream pulses everytime
		 * one of the component streams pulses, and is combined with last values of all the
		 * other streams
		 */
		combine: function (other, comb) {
			var streams = [this].concat(other);
			return Stream.combine(streams, comb);
		}
	});
	/**
	 * @method create
	 * @static
	 * Creates a new stream, accepting a subscribe method. This subscribe method
	 * is advised to ensure it accepts an observer and returns a disposable
	 * @param {Function} subscribe The subscribe function for the new stream
	 * @returns {Stream}
	 */
	Stream.create = create;
	/**
	 * @method unit
	 * @static
	 * Produces a new stream with is a unit stream. It will publish the passed in value
	 * once for every subscripition. Used to define monadic operations.
	 * @param {*} Value The single value the stream will publish
	 * @param {oli.scheduler} The scheduler to use to publish values (default=oli.scheduler.immediate)
	 */
	/**
	 * @method unit
	 * Produces a new stream with is a unit stream. It will publish the passed in value
	 * once for every subscripition. Used to define monadic operations.
	 * @param {*} Value The single value the stream will publish
	 * @param {oli.scheduler} The scheduler to use to publish values (default=oli.scheduler.immediate)
	 */
	Stream.unit = Stream.returns = _unit;
	/**
	 * @method error
	 * @static
	 * Produces a new stream that will publish the parameter on the failure channel
	 * with no completion.
	 * @param {*} Value The single value the stream will publish
	 * @param {oli.scheduler} The scheduler to use to publish values (default=oli.scheduler.immediate)
	 */
	/**
	 * @method error
	 * Produces a new stream that will publish the parameter on the failure channel
	 * with no completion.
	 * @param {*} Value The single value the stream will publish
	 * @param {oli.scheduler} The scheduler to use to publish values (default=oli.scheduler.immediate)
	 */
	Stream.error = _error;
	/**
	 * @method empty
	 * @static
	 * Produces an empty stream. This is stream publishes no values and terminates
	 * immediately
	 * @returns {Stream}
	 */
	/**
	 * @method empty
	 * Produces an empty stream. This is stream publishes no values and terminates
	 * immediately
	 * @returns {Stream}
	 */
	Stream.empty = _empty;
	/**
	 * Creates a new stream from a array. This stream will publish all values in the
	 * array in order to every subscriber.
	 * @static
	 * @param {Array} array The array of values that will be published
	 * @param {oli.scheduler} The scheduler to use to publish values (default=oli.scheduler.timeout)
	 * @returns {Stream}
	 */
	Stream.fromArray = function (array, scheduler) {
		scheduler = scheduler || Scheduler.main;
		return create(function (observer) {
			var i = 0;
			return scheduler.scheduleTailRecursive(function (recurse) {
				if (i < array.length) {
					observer.next(array[i++]);
					recurse();
				} else {
					observer.done();
				}
			});
		});
	};
	/**
	 * Creates a new stream of numbers from the range provided
	 * @static
	 * @param {Number} start The inclusive starting point of the range (default=0)
	 * @param {Number} end The exclusive end point of the range
	 * @param {Number} step The number to increment each new value by (default=1)
	 * @returns {Stream}
	 */
	Stream.range = function (start, end, step) {
		var scheduler = Scheduler.main;
		step = step || 1;
		if (arguments.length === 1) {
			end = start;
			start = 0;
		}
		return create(function (observer) {
			var current = start;
			return scheduler.scheduleTailRecursive(function (recurse) {
				if (current < end) {
					observer.next(current);
					current += step;
					recurse();
				} else {
					observer.done();
				}
			});
		});
	};
	/**
	 * Creates a new stream wrapping a function that returns a stream. Subscribing
	 * to this stream has the same effect as subscribing to the returned stream except
	 * that stream is not generatered (the function is not called) until the wrapping
	 * stream is subscribed to.
	 * @static
	 * @param {Function} fn A function of the form () -> Stream
	 * @returns {Stream}
	 */
	Stream.defer = function (fn) {
		return create(function (observer) {
			return fn().subscribe(observer);
		});
	};
	Stream.zip = function (streams, comb) {
		comb = comb || function () { return Array.prototype.slice.call(arguments); }
		var self = this;
		streams = [].concat(streams);

		return create(function (observer) {
			var caches = [];
			var calls = DisposableArray();
			var combine = function () {
				// ensure the entire cache has been setup
				if (caches.length !== streams.length) { return; }
				// ensure all caches have a value to use
				if (caches.some(function (x) { return x.length === 0; })) { return; }

				// There is enough data to dispatch the next call, combine and do so
				var values = caches.map(function (x) {
					return x.shift();
				});
				observer.next(comb.apply(self, values));
			};
			streams.forEach(function (x) {
				if (!OLI.isFunction(x.subscribe)) { return; }
				var cache = [];
				caches.push(cache);
				var call = x.subscribe.call(x, Observer(function (x) {
					cache.push(x);
					combine();
				}, observer.fail, function () {
					// TODO - correctly close stream only when a closed stream's cache is emptied
					//		- This is only needed to manage streams that produce a different number of values
					/*calls.remove(call);
					if (calls.dispose()) {
						observer.done();
					}*/
				}));
				calls.push(call);
			});
			return calls;
		});
	};
	Stream.combine = function (streams, comb) {
		comb = comb || function () { return Array.prototype.slice.call(arguments); }
		var self = this;
		var streams = [].concat(streams);

		return create(function (observer) {
			var caches = [];
			var calls = DisposableArray();
			var combine = function () {
				if (caches.length !== streams.length) { return; }
				if (caches.some(function (x) { return x.value === undefined; })) { return; }
				var values = caches.map(function (x) {
					return x.value;
				});
				observer.next(comb.apply(self, values));
			};
			streams.forEach(function (x) {
				if (!OLI.isFunction(x.subscribe)) { return; }
				var cache = { value: undefined };
				caches.push(cache);
				var call = x.subscribe.call(x, Observer(function (x) {
					cache.value = x;
					combine();
				}, observer.fail, function () {
					calls.remove(call);
					if (calls.isEmpty() || cache.value === undefined) {
						if (calls.dispose()) {
							observer.done();
						}
					}
				}));
				calls.push(call);
			});
			return calls;
		});
	}

	return Stream;
});

define('oli/async/koBridge',['./stream', './observer'],
function (Stream, Observer) {
	if (typeof ko === 'undefined' || !ko.subscribable) { return null; }

	ko.subscribable.fn && (ko.subscribable.fn.toStream = function () {
		var self = this;
		return Stream.create(function (observer) {
			var value = self();
			if (value !== undefined) { observer.next(value); }

			var dis = self.subscribe(observer.next);
			return dis.dispose.bind(dis);
		});
	});
	ko.subscribable.fn && (ko.subscribable.fn.toObserver = function () {
		var self = this;
		return Observer(function (x) {
			self(x);
		});
	});
});

define('oli/async/pointer',['../kernel', './stream', '../functions'],
function (OLI, Stream, functions) {
	/**
	 * @class oli.async.Pointer
	 * Returns a function that represents a mutable data type. Conceptually similar to
	 * C style pointers. Calling the function with a value assigns that value to the
	 * pointer. Calling it with no parameters dereferences the pointer.
	 *
	 * It is primarily designed to serve as a bridge between methods taking callback and
	 * observable streams. Pass a pointer as the callback function to a component and then
	 * subscribe to the pointers observable interface.
	 *
	 * @constructor
	 * @param {*} def The default value to store in the pointer (default=undefined)
	 * @param {Boolean} always Set to true if subscribers should be notified everytime the value
	 *	is assigned. Otherwise it only notifies when the value changes. (default=false)
	 * @param {Function} eq Equality function used to determine if the value has changed (default=oli.functions.equal)
	 */
	var Pointer = function (def, always, eq) {
		eq = (typeof eq === 'function') ? eq : functions.equal;
		var _value = def;
		var _subscribers = [];
		var _closed = false;

		var p = function () {
			if (_closed) { return; }

			if (arguments.length) {
				var newVal = arguments[0];
				if (always || !eq(newVal, _value)) {
					_subscribers.forEach(function (x) {
						if (newVal instanceof Error && x && x.fail) { x.fail(newVal); }
						else { ( (x && x.next) || x || functions.NOOP )(newVal); }
					});
				}
				return _value = newVal;
			} else {
				return _value;
			}
		};
		p.close = function (obs) {
			_closed = true;
			_subscribers.forEach(function (x) {
				if (x && x.done) { x.done(); }
			});
		}
		p.subscribe = function (obs) {
			if (typeof obs === 'function' || (obs && typeof obs.next === 'function')) {
				_subscribers.push(obs);
			} else { return; }

			if (_value instanceof Error && obs.fail) {
				obs.fail(_value);
			} else if (_value !== undefined) {
				( (obs && obs.next) || obs || functions.NOOP )(_value);
			}

			var disposed = false;
			return function () {
				if (disposed) { return; }
				_subscribers.splice(_subscribers.indexOf(obs), 1);
				disposed = true;
			};
		};
		var _stream = null;
		p.asStream = function () {
			return _stream = _stream || Stream.create(p.subscribe);
		};
		return p; //OLI.mixin(p, p.asStream());
	};
	return Pointer;
});

/*
	@filedescription Defines the OLI.String namespace
	@author Mike Schots
*/
define('oli/string',[],
function () {
	var DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g),
		DASHERIZE_REGEXP = (/[ _]/g),
		DASHERIZE_CACHE = {},
		/*
		 * Maximum value for #OLI.string.hashCode, exclusive. 2^32
		 */
		HASHCODE_MAX = 0x100000000;

	/**
	 * @class oli.string
	 * @singleton
	 * Namespace containing string utility functions
	 */
	var string = {
		/**
		 * Common unicode chars
		 * @property {Object}
		 */
		unicode: {
			'nbsp': '\xa0'
		},
		/**
		* Takes a whitespace separated string and returns the list as an array of strings
		w('a b c'); //=> ['a', 'b', 'c']
		* @method
		* @param {String} str The string to process
		* @returns {Array[String]} The split list
		*/
		w: function (str) { return str.split(/\s+/); },

		/**
		* Converts a given camelCase string to a underscore delimited string
		* @method
		* @params {String} str The input string
		* @returns {String} The underscore delimited string
		*/
		decamelize: function (str) {
			return str.replace(DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
		},

		/**
		* Converts a given string to a dash delimited string
		* @method
		* @params {String} str The input string in camelCase or underscore delimited format
		* @returns {String} The dash delimited string
		*/
		dasherize: function (str) {
			var cache = DASHERIZE_CACHE,
				ret = cache[str];

			if (ret) {
				return ret;
			} else {
				ret = string.decamelize(str).replace(DASHERIZE_REGEXP, '-');
				cache[str] = ret;
			}
			return ret;
		},

		// from Doug Crockford
		/**
		 * Provides simple templating by supplanting the string (like mail merge)
		 * with data from an object.
		 * Takes a string containing tokens of the format `{key}` and replaces them with
		 * the value for that key in the object (if it is a string or number). If the value
		 * is anything else or not in the object, the token is not replaced.
		 *
		 * The data object can also be a function, in which case the replacement value is the
		 * result of invoking that function with the token as a parameter

		  obj = { firstName: 'Joe', lastName: 'Smith'};
		  OLI.String.supplant('Hello {firstName} {lastName}!', obj); => 'Hello Joe Smith!'

		 * @param {String} str The template string
		 * @param {Object|Function} o The data source
		 * @returns {String} The formatted string
		 */
		supplant: function (str, o) {
			var replacer = (typeof o === 'function')
				? function (a, b) { return o(b); }
				: function (a, b) {
					var r = o[b];
					return (typeof r === 'string' || typeof r === 'number') ? r : a;
				};
			return str.replace(/{([^{}]*)}/g, replacer);
		},

		/**
		 * Uses supplant to create a function which works like the C# String.format
		 * The first argument is the string to template, all others are passed in as the data source
		 * by numbered keys {0} being the first, {1} the next, and so on
		 *
       format('Hello {0} {1}!', 'Joe', 'Smith'); => 'Hello Joe Smith!'
		 *
		 * @param {String} str The template string
		 * @param {(String|Number)...} args The data to insert
		 * @returns {String} The formatted string
		 */
		format: function (str) {
			var args = Array.prototype.slice.call(arguments, 1);
			return string.supplant.call(str, str, args);
		},

		/**
		 * Trims all whitespace off either end of the string (useful if the browser doesn't support
		 * String.prototype.trim
		 *
		 * @param {String} str The string to trim
		 * @returns {String} The trimmed string
		 */
		trim: function (str) {
			if (String.prototype.trim) { return String.prototype.trim.call(str); }
			return str.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
		},

		/**
		 * Takes a string and returns it as a javascript string literal
		 * @param {String} str The string to convert
		 * @returns {String} The converted string
		 */
		quote: function (str) {
			var c, i, l = str.length, o = '"';
			for (i = 0; i < l; i += 1) {
				c = str.charAt(i);
				if (c >= ' ') {
					if (c === '\\' || c === '"') {
						o += '\\';
					}
					o += c;
				} else {
					switch (c) {
					case '\b':
						o += '\\b';
						break;
					case '\f':
						o += '\\f';
						break;
					case '\n':
						o += '\\n';
						break;
					case '\r':
						o += '\\r';
						break;
					case '\t':
						o += '\\t';
						break;
					default:
						c = c.charCodeAt();
						o += '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
					}
				}
			}
			return o + '"';
		},

		// from closure
		/**
		 * Checks if a string is empty or contains only whitespaces.
		 * @param {String} str The string to check.
		 * @returns {Boolean} True if {@code str} is empty or whitespace only.
		 */
		'isEmpty': function (str) {
			return /^[\s\xa0]*$/.test(str);
		},
		/**
		 * String hash function similar to java.lang.String.hashCode().
		 * The hash code for a string is computed as
		 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
		 * where s[i] is the ith character of the string and n is the length of
		 * the string. We mod the result to make it between 0 (inclusive) and 2^32
		 * (exclusive).
		 * @param {String} str A string.
		 * @returns {Number} Hash value for {@code str}, between 0 (inclusive) and 2^32
		 *  (exclusive). The empty string returns 0.
		 */
		hashCode: function(str) {
			var result = 0;
			for (var i = 0; i < str.length; ++i) {
				result = 31 * result + str.charCodeAt(i);
				// Normalize to 4 byte range, 0 ... 2^32.
				result %= HASHCODE_MAX;
			}
			return result;
		},

		/**
		 * Generates and returns a string which is unique in the current document.
		 * @returns {String} A unique id
		 */
		createUID: (function () {
			var lastUID = Math.random() * 0x80000000 | 0;
			return function () {
				return lastUID++;
			};
		}()),
		/**
		 * Repeats a string n times
		 * @param {String} string The string to repeat
		 * @param {Number} length The number of times to repeat
		 * @returns {String} A string containing `length` repetitions of `string`
		 */
		repeat: function (string, length) {
			return new Array(length + 1).join(string);
		},
		/**
		 * Checks whether a string contains a given character.
		 * @param {String} s The string to test.
		 * @param {String} ss The substring to test for.
		 * @returns {Boolean} True if {@code s} contains {@code ss}.
		 */
		contains: function(s, ss) {
			return s.indexOf(ss) != -1;
		},
		/**
		 * Returns true if the string has the given suffix
		 * @param {String} string The string to test
		 * @param {String} suffix A string to look for at the end of {@code str}
		 * @returns {Boolean}
		 */
		endsWith: function (string, suffix) {
			var l = string.length - suffix.length;
			return l >= 0 && string.indexOf(suffix, l) === l;
		},
		/**
		 * Returns true if the string has the given prefix
		 * @param {String} string The string to test
		 * @param {String} prefix A string to look for at the start of {@code str}
		 * @returns {Boolean}
		 */
		startsWith: function (string, prefix) {
			return string.lastIndexOf(prefix, 0) === 0;
		},

		// from senchaJS
		/**
		 * Capitalize the given string
		 * @param {String} string
		 * @returns {String}
		 */
		capitalize: function(string) {
			return string.charAt(0).toUpperCase() + string.substr(1);
		},
		/**
		 * Appends content to the query string of a URL, handling logic for whether to place
		 * a question mark or ampersand.
		 * @param {String} url The URL to append to.
		 * @param {String} string The content to append to the URL.
		 * @returns (String) The resulting URL
		 */
		urlAppend : function(url, string) {
			if (string.length) {
				return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
			}
			return url;
		},
		/**
		 * Truncate a string and add an ellipsis ('...') to the end if it exceeds
		 * the specified length (including the ellipsis)
		 *
		 * @param {String} value The string to truncate
		 * @param {Number} length The maximum length to allow before truncating
		 * @param {Boolean} [word] True to try to find a common word break (optional) (default=false)
		 * @returns {String} The converted text
		 */
		ellipsis: function (str, len, word) {
			if (str && str.length > len) {
				if (word) {
					var vs = str.substr(0, len - 2),
							index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
					if (index !== -1 && index >= (len - 15)) {
						return vs.substr(0, index) + '...';
					}
				}
				return str.substr(0, len - 3) + '...';
			}
			return str;
		},
		htmlEncode: function (str) {
			return (""+(str||"")).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
	};

	return string;
});

/**
 * @class oli.lang
 * @singleton
 * @author Mike Schots
 */
/**
 * @method functional
 * A method that allows the use of functional string expressions, which can be more
 * convient than creating the necessarily verbose anonymous javascript functions.
 *
 * Adapted from functional javascript - http://osteele.com/sources/javascript/functional/
 * In particular the lambda function. More concepts from this library are expressed in the
 * functions module.
 *
 * This component is added more for utility in debugging and testing. It generates function
 * wrappers via new Function, which can be considered breaking the "eval is evil" rule.
 * However it would be worth testing the performance costs of this component for practical use
 * or possible creating a preprocessor based on it to allow code to be written with simple
 * string expressions that could be expanded out in generated code.
 */
define('oli/lang/functional',['../kernel'],
function (OLI) {
	var functional = function (lambda) {
		var params = [],
			expr = lambda,
			sections = expr.split(/\s*->\s*/m);
		if (sections.length > 1) {
			while (sections.length) {
				expr = sections.pop();
				params = sections.pop().split(/\s*,\s*|\s+/m);
				sections.length && sections.push('(function('+params+'){return ('+expr+')})');
			}
		} else if (expr.match(/\b_\b/)) {
			params = '_';
		} else {
			// test whether an operator appears on the left (or right), respectively
			var leftSection = expr.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m),
				rightSection = expr.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);
			if (leftSection || rightSection) {
				if (leftSection) {
					params.push('$1');
					expr = '$1' + expr;
				}
				if (rightSection) {
					params.push('$2');
					expr = expr + '$2';
				}
			} else {
				// `replace` removes symbols that are capitalized, follow '.',
				// precede ':', are 'this' or 'arguments'; and also the insides of
				// strings (by a crude test).  `match` extracts the remaining
				// symbols.
				var vars = lambda.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '').match(/([a-z_$][a-z_$\d]*)/gi) || []; // '
				for (var i = 0, v; v = vars[i++]; )
					params.indexOf(v) >= 0 || params.push(v);
			}
		}
		return new Function(params, 'return (' + expr + ')');
	};

	var _cache = {};
	return OLI.F = function (lambda) {
		return _cache[lambda] || functional(lambda);
	};
});


/**
 * @class oli.lang.list
 * @singleton
 * A linked list implemention inspired by lisp/scheme. The lists are immutable and implemented
 * as functions to allow them to be evaluated non-strictly. So they can be used to implement
 * infinite sequences. This also means that they use static functions to operate on them which are
 * compatible with functional combinators.
 *
 * Designed to handle dynamic collections that support iteration but not random access.
 * Tested to be faster in this regard than standard arrays
 */
define('oli/lang/list',['../kernel'], function (OLI) {
	var self;
	var listToken = {};
	return self = {
		/**
		 * Represents an empty list, used as the root of all new lists
		 * @property
		 */
		nil: null,
		/**
		 * Tests if the argument is a empty list
		 * @param {list} x The list to test
		 * @returns {boolean}
		 */
		isNil: function (x) { return x === null; },
		/**
		 * Tests if the parameter is a non-empty list
		 * @param {*} x The object to test
		 * @returns {boolean}
		 */
		isList: function (x) { return x && x.__list === listToken; },
		/**
		 * Constructs a new list. Lists are built by composition with new elements going on to the front.
		 * To create a new list you compose an element with the empty list "nil".
		 * @param {*} head The element to add to an existing list
		 * @param {list} tail The list to add to
		 * @returns {list} The new list
		 */
		cons: function (head, tail) {
			tail = tail || self.nil;
			var r = function () { return [head, tail]; };
			r.__list = listToken;
			return r;
		},
		/**
		 * Returns the first element in the list
		 * @param {list} list
		 * @returns {*}
		 */
		car: function (list) {
			return list()[0];
		},
		/**
		 * Returns the list minus the first element
		 * @param {list} list
		 * @returns {list}
		 */
		cdr: function (list) {
			return list()[1];
		},
		/**
		 * Returns a list that is a map of the original list but will every element the result of calling fn on
		 * the coresponding element in the original list
		 * @param {Function} fn The map function
		 * @param {list} list The list to map
		 * @returns {list} The mapped list
		 */
		map: function (fn, list) {
			return (self.isNil(list)) ? self.nil
				: self.cons(fn(self.car(list)), function () { return self.map(fn, self.cdr(list))(); });
		},
		/**
		 * Flattens a list of lists into a list
		 * @param {list} l The list to join
		 * @returns {list}
		 */
		join: function (l) {
		  if (self.isNil(l)) { return self.nil; }
		  if (self.isNil(self.car(l))) { return self.join(self.cdr(l)); }
		  return self.cons(self.car(self.car(l)), function () { self.join(self.cons(self.cdr(self.car(l)), self.cdr(l)))(); });
		},
		/**
		 * Remove the first instance of an element from a list
		 * @param {*} a The element to remove from the list
		 * @param {list} list The list to remove from
		 * @returns {list}
		 */
		remove: function (a, list) {
			return (self.isNil(list)) ? self.nil
				: (self.car(list) === a) ? self.cdr(list)
				: self.cons(self.car(list), self.remove(a, self.cdr(list)));
		},
		/**
		 * Invokes the given function for every member of a list.
		 * @param {Function} fn The function to invoke
		 * @param {list} list The list
		 */
		forEach: function (fn, list) {
			var i;
			// This function is tail-recursive, so we'll unroll it manually.
			while (!self.isNil(list)) {
				i = self.car(list);
				fn.call(i, i);
				list = self.cdr(list);
			}
		}
	};
});

define('oli/async/subject',[ '../compose', './stream', '../functions', '../lang/list' ],
function (Compose, Stream, functions, list) {

	var Callbacks = Compose(function (memory, once) {
		this.list = list.nil;
		this.cache = undefined;
		this.memory = !!memory;
		this.once = !!once;
		this.closed = false;
	}, {
		add: function (handler) {
			var self = this;
			if (this.memory && this.cache !== undefined) {
				handler(this.cache);
			}
			if (!this.closed) {
				this.list = list.cons(handler, this.list);
				return function () {
					self.list = list.remove(handler, self.list);
				};
			} else {
				return functions.NOOP;
			}
		},
		fire: function (value) {
			if (this.closed) { return; }
			if (this.memory) { this.cache = value; }
			list.forEach(function (x) {
				x(value);
			}, this.list);
			if (this.once) { this.close(); }
		},
		close: function () {
			this.closed = true;
			this.list = list.nil;
		},
		has: function (fn) {
			var state = false;
			list.forEach(function (x) {
				if (x === fn) { state = true; }
			}, this.list);
			return state;
		},
		isEmpty: function () {
			return list.isNil(this.list);
		}
	});
	/**
	 * @class oli.async.Subject
	 * @extends oli.async.Stream
	 * @mixin oli.async.Observer
	 * An object the implements both Stream and Observer. Is usual in writing functions
	 * that produce streams. Also useful in bridging streams.
	 *
	 * @constructor
	 * @param {Boolean} isBehaviour If true the subject will cache the last published value
	 * @param {*} value Sets the default value, only valid if isBehaviour is true
	 * @param {Boolean} isPromise If true the subject will close itself automatically after one value
	 */
	var Subject = function (isBehaviour, value, isPromise) {
		var nextBacks = Callbacks(!!isBehaviour, !!isPromise);
		var failBacks = Callbacks(true, true);
		var doneBacks = Callbacks(true, true);

		if (isBehaviour && value !== undefined) {
			nextBacks.fire(value);
		}
		var s = Stream.create(function (observer) {
			var subs = list.nil;

			subs = list.cons(nextBacks.add(observer.next), subs);
			if (!failBacks.has(observer.fail)) {
				subs = list.cons(failBacks.add(observer.fail), subs);
			}
			if (observer.done !== functions.NOOP) {
				subs = list.cons(doneBacks.add(observer.done), subs);
			}

			return function () {
				list.forEach(function (x) { x(); }, subs);
				subs = list.nil;
			};
		});
		s.next = function (x) {
			nextBacks.fire(x);
			if (isPromise) {
				this.done();
			}
			return s;
		};
		s.fail = function (x) {
			failBacks.fire(x);
			nextBacks.close();
			doneBacks.close();
			return s;
		};
		s.done = function () {
			doneBacks.fire();
			nextBacks.close();
			failBacks.close();
			return s;
		};
		s.isEmpty = nextBacks.isEmpty.bind(nextBacks);

		return s;
	};

	return Subject;
});

/**
 * @class oli.async.jQuery
 * @singleton
 * A module that decorates the jquery object with methods to generate asynchronous stream publishers
 * integrating jquery with the observable stream system. Will mutate the existing jquery context
 * when included. The returned module interface is simply the jquery object.
 *
 * @author Mike Schots
 */

define('oli/async/jquery',['./stream', './subject', '../functions'],
function (Stream, Subject, functions) {
	if (!jQuery) { return functions.NOOP; }
	var $ = jQuery;

	//TODO - adapt to full jquery#on syntax (except eventsMap, maybe with mapping functions)
	$.fn.toStream = function (events, selector, data) {
		var self = this;
		return Stream.create(function (observer) {
			var handler = function (x) { observer.next(x); }
			self.on(events, selector, data, handler);
			return function () { self.off(events, selector, handler); }
		});
	};

	$.Deferred.prototype.toStream = function () {
		var sub = new Subject();
		this.then(function (x) {
			sub.next(x);
			sub.done();
		}, sub.fail, sub.next);
		return sub;
	};

	$.readyStream = function () {
		return Stream.create(function (observer) {
			$(observer.next);
			return functions.NOOP;
		});
	};

	$.alert = function (x) {
		/*var s = Subject();
		var popup = $('<div style="position:absolute;background-color:#003;width:200px;border:1px solid black">Alert</div>');
		var button = $('<button style="float:right;" type="botton">OK</button>').click(function () {
			s.next(x);
			popup.remove();
		});
		$('body').prepend(popup.append(button));
		return s;*/

		return Stream.create(function (observer) {
			var popup = $('<div style="position:absolute;background-color:#003;width:200px;border:1px solid black">' + x + '</div>');
			var button = $('<button style="float:right;" type="botton">OK</button>').click(function () {
				observer.next(x);
				popup.remove();
			});
			$('body').prepend(popup.append(button));
		});
	};

	return $;
});

define('oli/async/jsonRpc',['../compose', './stream', './subject', '../scheduler', '../disposable', '../functions'], function (Compose, Stream, Subject, Scheduler, disposable, functions) {
	// Counting semaphore used to control access to the browsers' AJAX queue
	var semaphore = {
		value: 4,
		queue: [],
		P: function (fn) {
			if ((this.value -= 1) >= 0) {
				Scheduler.schedule(fn);
			} else {
				this.queue.push(fn);
			}
		},
		V: function () {
			this.value += 1;
			if (this.queue.length) {
				Scheduler.schedule(this.queue.shift());
			}
		}
	}

	var uuid = 0; //Provides the unique id for all requests
	var dispatch = function (url, name, params) {
		// Make the ajax request using jQuery
		var aborted = false;
		var resolved = false;
		var request = $.ajax({
			url: url,
			dataType: 'json',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				method: name,
				params: [].concat(params),
				id: ( uuid += 1 )
			}).replace(/([\x80-\xff])/g, function(a, b) { return '\\u00' + b.charCodeAt(0).toString(16); })
		})

		// Bind the request to an instance of an observable stream and return that
		return Stream.create(function (observer) {
			request.done(function (x) {
				resolved = true;
				if (aborted) {
					return;
				} else if (x.error) {
					observer.fail(x.error);
				} else if (x.result !== undefined) {
					observer.next(x.result);
				} else {
					var error = new Error('RPC error [' + url + '#' + name + '] - invalid response');
					error.response = x;
					observer.fail(error);
				}
				observer.done();
			});
			request.fail(function (x) {
				resolved = true;
				if (!aborted) { observer.fail(x); }
			});
			return function () {
				if (resolved) { return; }
				aborted = true;
				request.abort();
				observer.done();
			}
		});
	};
	/**
	 * @class oli.async.JsonRpc
	 *
	 * A simple async dispatcher for a JSON-RPC webservice. On relavent browsers
	 * it is bound by the same-origin policy.
	 *
	 * The results are returned on a stream that will notify subscribers when
	 * a value is returned (or immediately notify if the value already was returned.
	 *
	 * Example
	 * ===
		 // `/service` is a webservice with a sum function that returns the sum of params
		 var service = new OLI.async.JsonRpc('/service');
		 var request = service.call('sum', [1, 2, 3]);
		 request.then(function (r) {
		   console.log (r); // will log `6` when the request is fulfilled
		 }, function (ex) {
		   alert(ex.message);  //if an error happens, a alert is opened with its message
		 }
	 * or a more synchronous looking wrapper can be returned by accessor (assuming the
	 * method name that is being requested is not a used name
		 client.get('add')(2, 2).then( function (x) { console.log(x); } ); //logs => 4
	 *
	 * @constructor
	 * @param {String} service The url for the webservice
	 * @param {Boolean} eager If true all requests dispatched on creation and cannot be
	 *   aborted. If false, the requests are lazy, only running when subscribed to and
	 *   can be aborted by all subscribers unsubscribing before the request is made.
	 */
	var JsonRpc = Compose(function (serviceUrl, eager) {
		this.serviceUrl = serviceUrl;
		this.eager = (eager !== undefined) ? !!eager : true;
	}, {
		/**
		 * Invokes a method in the webservice
		 * @param {String} name The method name to execute
		 * @param {Array[*]} [params] The parameter list the will be passed (must be
		 *   JSON serializable
		 * @returns {oli.async.Stream} A promise that resolves with the
		 *   return value of the webservice.
		 */
		call: function (name, params) {
			var self = this;
			var subject = new Subject(true, undefined, true);
			var dispatched = false;
			var cancel = false;

			var launch = function () {
				semaphore.P(function () {
					if (cancel && subject.isEmpty) {
						cancel = false;
						semaphore.V();
					} else if (!dispatched) {
						dispatched = true;
						var req = dispatch(self.serviceUrl, name, params);
						req.subscribe(semaphore.V.bind(semaphore), semaphore.V.bind(semaphore), functions.NOOP);
						req.subscribe(subject);
						return req;
					} else {
						semaphore.V();
					}
				});
			}
			if (this.eager) { launch(); }
			else {
				subject.subscribe = (function (old) {
					return function () {
						launch();
						var unSub = old.apply(this, arguments);
						return {
							dispose: function () {
								if (!dispatched) { cancel = true; }
								unSub.dispose();
							}
						};
					};
				})(subject.subscribe);
			}
			return subject;
		},

		/**
		 * When using an accessor, unknown names are treated as method names. And a curried
		 * handler is returned. Returns a function which recieves a full parameter list (not
		 * as an array) and returns a promise
		 * Example
		 * ---
		 client.get('add')(2, 2).done( function (x) { console.log(x); } ); //logs => 4
		 *
		 * @param {String} key Method name
		 * @returns {Function[ *... -> oli.async.Stream ]} A wrapper function that takes a parameter list and returns a promise
		 */
		get: function (key) {
			var self = this;
			return function () { return self.call( key, Array.prototype.slice.call(arguments) ); };
		},
		/**
		 * Alias for get
		 */
		method: function () { return this.get.apply(this, arguments); }
	});

	return JsonRpc;
});


define('oli/async/_base',[
	'./jquery',
	'./jsonRpc',
	'./koBridge',
	'./observer',
	'./pointer',
	'./stream',
	'./subject'
], function () {
	return {
		jQuery: arguments[0],
		JsonRpc: arguments[1],
		Observer: arguments[3],
		Pointer: arguments[4],
		Stream: arguments[5],
		Subject: arguments[6]
	};
});

define('oli/main',[
	'./kernel',
	'./async/_base',
	'./compose',
	'./date',
	'./functions',
	'./has',
	'./math',
	'./scheduler',
	'./string',
	'./lang/functional',
	'./lang/list'
],function (OLI) {
	OLI.async = arguments[1];
	OLI.Compose = arguments[2];
	OLI.date = arguments[3];
	OLI.functions = arguments[4];
	OLI.has = arguments[5];
	OLI.math = arguments[6];
	OLI.Scheduler = arguments[7];
	/**
	  @class oli.Stream
	  Alias to OLI.async.Stream
	*/
	OLI.Stream = OLI.async.Stream;
	OLI.string = arguments[8];

	OLI.lang = {};
	OLI.lang.functional = arguments[9];
	OLI.lang.list = arguments[10];
	return OLI;
});

// Program that when optimized contains the entire OLI library
// exposed through the global symbol OLI. This version
// can be used rather then the AMD module interface

require(['oli/main'], function (OLI) {
	this.OLI = OLI;
});
}());
