OLI.async.DeferedObjectJsonRpc = function () {
    var jsonRpc = OLI.async.JsonRpc.apply(Object.create(OLI.async.JsonRpc.prototype), arguments);

    this.get = function () {
        var rpcFunc = jsonRpc.get.apply(jsonRpc, arguments);
        return function () {
            var result = OLI.async.jQuery.Deferred();

            rpcFunc.apply(jsonRpc, arguments).subscribe(function (r) {
                result.resolve(r);
            }, function (exception) {
                result.reject(exception);
            });

            return result.promise();
        };
    };
};