(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(["js/es5-shim"], factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        if (!Object || !Object.keys) {
            throw new Error("ES5 shim must be included");
        }
        OEC = (typeof OEC ==='undefined' ? {} : OEC);
        OEC.object = OEC.object || factory();
    }
})(function () {
    var exports = {};

    exports.extend = function (obj) {
        Array.prototype.slice.call(arguments, 1).forEach(function (source) {
            if (source) {
                exports.forEach(source, function (key, value) {
                    if (value && typeof value === 'object' && value.constructor !== Date) {
                        if (obj[key]) {
                            //noop
                        } else if (value.constructor === Array) {
                            obj[key] = new Array();
                        } else {
                            obj[key] = Object.create(Object.getPrototypeOf(value));
                        }
                        exports.extend(obj[key], value);
                    } else if (value === undefined) {
                        //noop
                    } else {
                        obj[key] = value;
                    }
                });
            }
        });
        return obj;
    };

    exports.rename = function (obj, renames) {
        var n = exports.extend({}, obj);
        exports.forEach(renames, function (oldName, newName) {
            n[newName] = n[oldName];
            delete n[oldName];
        });
        return n;
    };

    exports.subset = function (obj, fields) {
        var o = {};
        if (!fields.length) { return; }

        fields.forEach(function (field) {
            o[field] = obj[field];
        });
        return o;
    };

    exports.forEach = function (obj, fn) {
        Object.keys(obj).forEach(function (key) {
            fn(key, obj[key]);
        });
    };
    
    return exports;
});