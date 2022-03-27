// memoize: a general-purpose function to enable a function to use memoization
//   func: the function to be memoized
//   context: the context for the memoized function to execute within
var memoize = function (func, context) {
	var cache = {};
	return function () {
		var hash = JSON.stringify(Array.prototype.slice.call(arguments));
		cache[hash] = cache[hash] || func.apply(context, arguments);
		return JSON.parse(JSON.stringify(cache[hash])); //cloned so mutation doesn't affect other calls.
	};
}
