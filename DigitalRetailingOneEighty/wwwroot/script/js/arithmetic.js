var arithmetic = (function () {
	var exports = {};
	var Ratio = function (n, d) {
		this.n = n
		this.d = d;
	}
	Ratio.prototype.valueOf = function () { return this.n / this.d; };
	Ratio.prototype.toString = function () { return "<sup>" + this.n +"</sup>&frasl;<sub>" + this.d + "</sub>"; };

	var ratio = exports.ratio = function (n, d) {
		n = +n;
		d = +d || 1;
		if(isNaN(n) || isNaN(d)) { return NaN; }
		if(isInteger(n) && isInteger(d)) {
			return normalizeRatio(n, d);
		} else {
			var N = castRatio(n);
			var D = castRatio(d);
			if (N.d === D.d) {
				return normalizeRatio(N.n, D.n);
			} else if (N.d > D.d) {
				return normalizeRatio(N.n, +(D.n + ("" + N.d).split("" + D.d)[1]));
			} else if (N.d < D.d) {
				return normalizeRatio(+(N.n + ("" + D.d).split("" + N.d)[1]), D.n);
			}
		}
	};
	var normalizeRatio = function (n, d) {
		var a = n,
			b = d,
			s = 0,
			t = 1,
			r = b,
			olds = 1,
			oldt = 0,
			oldr = a,
			quotient = 0,
			temp;
		while (r !== 0) {
			quotient = Math.floor(oldr / r);
			
			temp = r;
			r = oldr - quotient * r
			oldr = temp;

			temp = s
			s = olds - quotient * s;
			olds = temp;

			temp = t
			t = oldt - quotient * t;
			oldt = temp;
		}
		if (s === 1) {
			return -t;
		} else if (s >= 0) {
			return new Ratio(-t, s);
		} else if (s < 0) {
			return new Ratio(t, -s);
		}
	};

	var isRatio = function (q) {
		return (!!q && typeof q.n === "number" && typeof q.d === "number")
	}
	var isFloat = function (q) {
		return (typeof q === "number" && !isNaN(q) && (Math.floor(q) !== Math.ceil(q)));
	};
	var isInteger = exports.isInteger = function (q) {
		return (typeof q === "number" && !isNaN(q) && (Math.floor(q) === Math.ceil(q)));
	};
	var isInQ = function (a) {
		return isRatio(a) || isInteger(a);
	}
	var bothInQ = function (a, b) {
		return isInQ(a) && isInQ(b);
	};

	var recip = function (r) {
		return ratio(r.d, r.n);
	};
	var castRatio = function (x) {
		if (isRatio(x)) {
			return x;
		} else if (isInteger(x)) {
			return new Ratio(x, 1);
		} else if (isFloat(x)) {
			var split = ("" + x).split(".");
			return new Ratio(+split.join(""), Math.pow(10, split[1] ? split[1].length : 0));
		} else {
			return NaN;
		}
	};

	var plus = exports.plus =function (a, b) {
		if (!bothInQ(a, b)) {
			return (+a) + (+b);
		} else {
			var r;
			a = castRatio(a);
			b = castRatio(b);

			if (a.d === b.d) {
				return ratio(a.n + b.n, a.d);
			} else {
				return ratio((a.n * b.d) + (b.n * a.d), a.d * b.d);
			}
		}
	};

	var sub = exports.sub = function (a, b) {
		return plus(a, mult(-1, b));
	};

	var mult = exports.mult = function (a, b) {
		if (!bothInQ(a, b)) {
			return (+a) * (+b);
		} else {
			a = castRatio(a);
			b = castRatio(b);
			return ratio(a.n * b.n, a.d * b.d);
		}
	};

	var div = exports.div = function (a, b) {
		if (!bothInQ(a, b)) {
			return (+a) / (+b);
		} else {
			b = castRatio(b);
			return mult(a, recip(b));
		}
	};

	return exports;
}());