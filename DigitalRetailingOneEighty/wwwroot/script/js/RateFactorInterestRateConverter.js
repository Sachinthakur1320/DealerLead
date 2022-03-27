(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        OEC = (typeof OEC === 'undefined' ? {} : OEC);
        OEC.RateFactorInterestRateConverter = OEC.RateFactorInterestRateConverter || factory();
    }
}) (function () {
    var convertInterestRateToRateFactor = function (value, isRateFactor) {
        var intRate = "" + value;
        if (isRateFactor) {
            var x = "" + Math.floor(value);
            intRate = "000000".substring(0, 6 - x.length) + intRate;
            var decimalLocation = intRate.indexOf(".");
            var newdecimalLocation = decimalLocation >= 0 ? decimalLocation - 5 : intRate.length - 5;
            intRate = intRate.replace(".", "");
            intRate = intRate.slice(0, newdecimalLocation) + "." + intRate.slice(newdecimalLocation);
        }
        return intRate;
    };

    var convertRateFactorToInterestRate = function (value, isRateFactor) {
        var val = (+value < 0 ? "0" : value.toString());
        val = val.slice(0, 1) === "." ? "0" + val : val;

        if (isRateFactor) {
            // If you haven't put in an actual rate factor, convert it to one.
            if (val.slice(0, 4) !== "0.00") {
                val = convertInterestRateToRateFactor(val, isRateFactor);
            }

            var newdecimalLocation = ("" + Math.floor(val)).length + 5;
            val = val.replace(".", "") + "00000";
            val = val.slice(0, newdecimalLocation) + "." + val.slice(newdecimalLocation);
        }
        return +val;
    };

    var exports = {
        convertInterestRateToRateFactor : convertInterestRateToRateFactor,
        convertRateFactorToInterestRate : convertRateFactorToInterestRate
    };
    return exports;
});
