var OEC = OEC || {};
OEC.lease = OEC.lease || {};
OEC.lease.calculations = OEC.lease.calculations || (function () {
    var leaseUpfrontCost = function (leaseObject, upfrontPayment) {
        var total = {
            "TotalSemiMonthly": 0,
            "SemiMonthly": 0,
            "SemiGst": 0,
            "SemiPst": 0,
            "SemiHst": 0,
            "SemiMonthlyAdjust": 0
        }
        var totalUpfront = 0;
        upfrontPayment = upfrontPayment || 0;
        if (leaseObject != null) {
            if (leaseObject.LSPPmtsPerYear === 24 || leaseObject.LSPPmtsPerYear === 26 || leaseObject.LSPPmtsPerYear === 52) {
                if (leaseObject.LSPID != 96) {
                    if (leaseObject.LSPID == 67 || leaseObject.LSPID == 68 || leaseObject.LSPID == 69 || leaseObject.LSPID == 208) {
                        total.TotalSemiMonthly = (((leaseObject.TotalPayment.toFixed(2) / 2.0) * 100) + 0.49) / 100;
                    } else {
                        total.TotalSemiMonthly = leaseObject.TotalPayment * (12 / leaseObject.LSPPmtsPerYear);
                    }
                    total.SemiGst = ((leaseObject.PaymentGST) / (leaseObject.TotalPayment) * total.TotalSemiMonthly).toFixed(2);
                    total.SemiPst = ((leaseObject.PaymentPST) / (leaseObject.TotalPayment) * total.TotalSemiMonthly).toFixed(2);
                    total.SemiHst = ((leaseObject.PaymentHST) / (leaseObject.TotalPayment) * total.TotalSemiMonthly).toFixed(2);
                    total.SemiMonthly = Number(total.TotalSemiMonthly) - Number(total.SemiGst) - Number(total.SemiPst) - Number(total.SemiHst);
                } else {
                    total.SemiMonthly = (leaseObject.MonthlyPayment * (12 / leaseObject.LSPPmtsPerYear)).toFixed(2);
                    total.SemiMonthlyAdjust = (total.SemiMonthly * leaseObject.LSPPmtsPerYear * (leaseObject.Term / 12)) - (leaseObject.MonthlyPayment * leaseObject.Term);

                    if (total.SemiMonthlyAdjust < 0) {
                        total.SemiMonthly = Number(total.SemiMonthly) + 0.01;
                        total.SemiMonthlyAdjust = (total.SemiMonthly * leaseObject.LSPPmtsPerYear * (leaseObject.Term / 12)) - (leaseObject.MonthlyPayment * leaseObject.Term);
                    }
                    total.SemiGst = ((leaseObject.PaymentGST) / (leaseObject.MonthlyPayment) * total.SemiMonthly).toFixed(2);
                    total.SemiPst = ((leaseObject.PaymentPST) / (leaseObject.MonthlyPayment) * total.SemiMonthly).toFixed(2);
                    total.SemiHst = ((leaseObject.PaymentHST) / (leaseObject.MonthlyPayment) * total.SemiMonthly).toFixed(2);
                    total.TotalSemiMonthly = Number(total.SemiMonthly) + Number(total.SemiGst) + Number(total.SemiHst) + Number(total.SemiPst);
                }
                totalUpfront = upfrontPayment - leaseObject.TotalPayment + total.TotalSemiMonthly;
            }
            else {
                totalUpfront = upfrontPayment;
            }
        }
        return {
            "totalUpfront": totalUpfront,
            "totalSemiMonthly": total.TotalSemiMonthly
        }
    };
    return {
        leaseUpfrontCost: leaseUpfrontCost
    };
})();