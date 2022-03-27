var calculateCapCosts = function (capCost, taxRate, isAfterTax) {
    var preCost, afterCost;
    preCost = afterCost = capCost;
    if (isAfterTax) {
        preCost = capCost / (1 + (taxRate / 100));
    } else {
        afterCost = capCost * (1 + (taxRate / 100));
    }
    return {
        "CapcostCash": preCost,
        "CapcostCashAfterTax": afterCost
    };
};