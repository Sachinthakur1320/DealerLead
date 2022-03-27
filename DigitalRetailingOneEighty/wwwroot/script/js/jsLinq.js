/* LINQ to Javascript implementation (prototype version)
 * Mike Schots - 2010
 */
(function() {
    var JsLinq = function(data) {
        return new JsLinq.fn.init(data);
    }

    var slice = Array.prototype.slice,
		push = Array.prototype.push,
		sort = Array.prototype.sort;

    JsLinq.fn = JsLinq.prototype = {
        init: function(x) {
            x = x || [];
            if (Object.prototype.toString.call(x) !== "[object Array]" && !x.jsLinq) {
                x = [x];
            }
            this.length = x.length;
            for (var i = 0; i < this.length; i++) {
                this[i] = x[i];
            }
        },
        push: push,
        splice: [].splice,
        length: 0,
        jsLinq: true,
        toString: function() {
            return "<JsLinq: [" + Array.prototype.join.call(this, ", ") + "]>"
        },

        toArray: function() {
            return slice.call(this, 0);
        },
        append: function(data) {
            var result = JsLinq(this),
				dataLen = data.length,
				i;
            for (i = 0; i < dataLen; i++) {
                result.push(data[i]);
            }
            return result;
        },
        where: function(fn, thisArg) {
            var newData = JsLinq();
            var dataLen = this.length;
            for (var i = 0; i < dataLen; i++) {
                if (fn.call(thisArg || this[i], this[i], i, this)) {
                    newData.push(this[i]);
                }
            }
            return newData;
        },
        select: function(fn, thisArg) {
            var newData = JsLinq();
            var dataLen = this.length;
            for (var i = 0; i < dataLen; i++) {
                newData.push(fn.call(thisArg || this[i], this[i], i, this));
            }
            return newData;
        },
        join: function() {
            var newData = JsLinq();
            var dataLen = this.length;
            var innerDataLen;
            for (var i = 0; i < dataLen; i++) {
                innerDataLen = this[i].length || 0;
                for (var j = 0; j < innerDataLen; j++) {
                    newData.push(this[i][j]);
                }
            }
            return newData;
        },
        selectMany: function(fn, thisArg) {
            return this.select(fn, thisArg).join();
        },
        count: function(fn) {
            if (fn === undefined) {
                return this.length;
            } else {
                return self.where(fn).length;
            }
        },
        aggregate: function(fn, start) {
            var accumulator = start;
            var dataLen = this.length;
            for (var i = 0; i < dataLen; i++) {
                accumulator = fn(accumulator, this[i]);
            }
            return accumulator;
        },
        sum: function() {
            return this.aggregate(function(x, y) { return x + y; }, 0);
        },
        avg: function() {
            if (this.length) {
                return this.sum() / this.length;
            } else {
                return 0;
            }
        },
        max: function() {
            return this.aggregate(function(x, y) { return (x > y) ? x : y; });
        },
        min: function() {
            return this.aggregate(function(x, y) { return (x < y) ? x : y; });
        },
        distinct: function() {
            return this.where(function(x, i, c) { return Array.prototype.lastIndexOf.call(c, x) === i; });
        },
        union: function(data, compare) {
            if (typeof compare !== 'function') {
                compare = function(x, y) { return x == y; }
            }
            var result = JsLinq(this);

            var i, j, k, added;
            var temp = [];
            for (i = 0; i < data.length; i++) {
                added = false;
                for (j = 0; j < result.length; j++) {
                    if (compare(data[i], result[j])) {
                        result[j] = data[i];
                        added = true;
                        break;
                    }
                }
                if (!added) { temp.push(data[i]); }
            }
            for (k = 0; k < temp.length; k++) {
                result.push(temp[k]);
            }
            return result;
        },
        orderBy: function(fn) {
            var newData = JsLinq(this);
            sort.call(newData, fn);
            return newData;
        },
        groupBy: function(keySelector) {
            if (typeof keySelector === "string") {
                keySelector = (function(d) { return function(x) { return (x[d] === null || x[d] === undefined ? '' : x[d]).toString(); }; })(keySelector);
            }
            if (typeof keySelector !== "function") { return this; }

            var buckets = {};
            var dataLen = this.length;
            var key = "";

            for (var i = 0; i < dataLen; i++) {
                key = "" + keySelector(this[i]);
                if (buckets[key] === undefined) { buckets[key] = JsLinq([this[i]]); buckets[key].key = key }
                else if (buckets[key].push) { buckets[key].push(this[i]); }
            }
            var newData = JsLinq();
            for (var j in buckets) {
                if (buckets.hasOwnProperty(j)) {
                    newData.push(buckets[j]);
                }
            }
            return newData;
        }
    };
    JsLinq.fn.map = JsLinq.fn.select;
    JsLinq.fn.filter = JsLinq.fn.where;
    JsLinq.fn.init.prototype = JsLinq.fn;
    window.JsLinq = JsLinq;
})();
