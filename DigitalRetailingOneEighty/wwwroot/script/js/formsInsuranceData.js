var insuranceData = function (quoteId) {
    var insurance = {
        "intComp": 0,
        "curInsuredPayment": 0,
        "intITerm": 0,
        "curInsuredResidual": 0,
        "curTotalAmount": 0,
        "curInsuredAmount": 0,
        "curPayment": 0,
        "paymentsPerYear": 0,
        "rstResult": 0,
        "curAmountFinanced": 0,
        "intTable": 0
    }
    var strType;
    var intTable;
    var curJoint;
    var blnIsLease;
    var intLifeTerm;
    var intRate;
    var intDealTerm;
    var blnShortCoverage;
    var blnShowLeaseTax = false;
    var rstInsuranceOnQuote;
    var intDeferByDays;
    var blnWeekly = false;
    var blnBiWeekly = false;
    var blnMonthly = false;
    var blnSemiMonthly = false;
    var intCustomDeferByDays;

    var mobjFinance = new ActiveXObject('DLFinancial.QuoteFinanceOpt');
    mobjFinance.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
    mobjFinance.GetSelectedOption(quoteId);
    mobjFinance.Calculate(quoteId);

    var mobjQuote = Server.CreateObject("DealerLease.Quotes")
    mobjQuote.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
    mobjQuote.GetQuote(quoteId);

    strType = mobjQuote.SelectedOption;

    var objRemittance = new ActiveXObject('DLFinancial.InsuranceOnQuote');
    objRemittance.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);

    var rstResult = objRemittance.GetInsuranceForRemittance(intDealerID, undefined, undefined, quoteId);
    if (rstResult.RecordCount > 0) {
        insurance.intComp = rstResult.Fields.Item("SelectedOption").value;
    }

    insurance.curPremium = 0;
    insurance.curPremiumTax = 0;

    var objICompany = new ActiveXObject('DLFinancial.InsuranceCompany');
    objICompany.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
    var rstICompany = objICompany.GetInsuranceComp(insurance.intComp, undefined, false);

    var objLeaseCalc = new ActiveXObject('DLLeaseCalc.LeaseCalc');

    if (!rstICompany.bof) {
        if (rstICompany.RecordCount > 0) {
            insurance.curInsuredPayment = 0;
            if (rstResult.RecordCount > 0) {
                //Set up the Basic Details
                insurance.intComp = rstResult.Fields.Item("SelectedOption").Value;
                insurance.intTable = rstResult.Fields.Item("ITableID").Value;
                curJoint = rstICompany.Fields.Item("Joint").Value;
                if (rstResult.Fields.Item("IsLease").Value) {
                    var mobjLease = new ActiveXObject('DLFinancial.QuoteLeaseOpts');
                    mobjLease.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
                    mobjLease.GetSelectedOption(quoteId);
                    blnIsLease = true;
                    insurance.intITerm = rstResult.Fields.Item("Term").Value;
                    intLifeTerm = rstResult.Fields.Item("Term").Value;
                    intRate = mobjLease.IntRate;
                    intDealTerm = mobjLease.Term;
                    if (insurance.intITerm != intDealTerm) {
                        blnShortCoverage = true;
                    }
                    if (rstResult.Fields.Item("ID").Value > 0) {
                        insurance.curInsuredResidual = 0;
                        var mobjTax = new ActiveXObject('DLFinancial.Taxes');
                        mobjTax.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
                        mobjTax.GetTaxForProv(mobjQuote.Province, false, mobjLease.FinalResidual);
                        mobjTax.CalculateTaxesFor(mobjLease.FinalResidual);
                        insurance.curInsuredResidual = mobjLease.FinalResidual + mobjTax.GSTAmount + mobjTax.HSTAmount + mobjTax.PSTAmount;
                        if (rstICompany.Fields.Item("ShortTerm").Value && (insurance.intITerm < intDealTerm)) {
                            //The Term of coverage is less than the Finance Term there calculate residual as follows
                            insurance.curInsuredResidual = insurance.curInsuredResidual + (intDealTerm - insurance.intITerm) * mobjLease.TotalPayment;
                        } else {
                            //nothing
                        }
                        if (insurance.curInsuredResidual > rstICompany.Fields.Item("MaxResidual").Value) {
                            insurance.curInsuredResidual = rstICompany.Fields.Item("MaxResidual").Value;
                        }
                        insurance.curAmountFinanced = mobjLease.NetCapCost;
                        insurance.curInsuredPayment = mobjLease.TotalPayment;
                        insurance.curTotalAmount = insurance.curInsuredPayment * mobjLease.Term;
                        insurance.curInsuredPayment = (insurance.curInsuredPayment * rstResult.Fields.Item("Percentage").Value) / 100;
                        if (insurance.curInsuredPayment > rstICompany.Fields.Item("MaxPayment").Value) {
                            insurance.curInsuredPayment = rstICompany.Fields.Item("MaxPayment").Value;
                        }
                        insurance.curInsuredAmount = insurance.curInsuredPayment * insurance.intITerm;
                    }
                }
                else {
                    blnIsLease = false;
                    insurance.intITerm = rstResult.Fields.Item("Term").Value;
                    intLifeTerm = rstResult.Fields.Item("Term").Value;
                    var mobjFinance = new ActiveXObject('DLFinancial.QuoteFinanceOpt');
                    mobjFinance.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
                    mobjFinance.GetSelectedOption(quoteId);
                    mobjFinance.Calculate(quoteId);
                    intRate = mobjFinance.IntRate;
                    intDealTerm = mobjFinance.Term;
                    if (rstResult.Fields.Item("ID").Value > 0) {
                        if (insurance.intITerm != intDealTerm) {
                            blnShortCoverage = true;
                        }
                        if (rstICompany.Fields.Item("ShortTerm").Value && (insurance.intITerm < intDealTerm)) {
                            //The Term of coverage is less than the Finance Term there calculate residual as follows
                            if (rstICompany.Fields.Item("UseRemainingPayments").Value) {
                                insurance.curInsuredResidual = mobjFinance.BalloonAmt + ((intDealTerm - insurance.intITerm) / 12) * mobjFinance.PmtsPerYear * mobjFinance.MonthlyPayment;
                            } else {
                                var objLeaseCalc = new ActiveXObject('DLLeaseCalc.LeaseCalc');
                                insurance.curInsuredResidual = objLeaseCalc.CalcFV(mobjFinance.IntRate / 100 / mobjFinance.PmtsPerYear, (insurance.intITerm / 12) * mobjFinance.PmtsPerYear, mobjFinance.MonthlyPayment, mobjFinance.AmountFinanced, false);
                            }
                        }
                        else {
                            insurance.curInsuredResidual = mobjFinance.BalloonAmt;
                        }
                        insurance.curAmountFinanced = mobjFinance.AmountFinanced;
                        insurance.curInsuredPayment = (mobjFinance.MonthlyPayment * mobjFinance.PmtsPerYear) / 12;
                        insurance.curTotalAmount = insurance.curInsuredPayment * mobjFinance.Term;
                        insurance.curInsuredPayment = insurance.curInsuredPayment * rstResult.Fields.Item("Percentage").value / 100;
                        if (insurance.curInsuredPayment > rstICompany.Fields.Item("MaxPayment").value) {
                            insurance.curInsuredPayment = rstICompany.Fields.Item("MaxPayment").value;
                        }

                        insurance.curInsuredAmount = mobjFinance.AmountFinanced - mobjFinance.BalloonAmt;

                    }
                }
            }
            insurance.rstResult = rstResult;
        }

       
    }
    return insurance;
};
var PrintInsuranceValues = function (rstInsurance, strField, blnIsMonthly) {
    var printInsuranceValues;
    if (blnIsMonthly) {
        strField = strField.substr(0, strField.indexOf("Monthly") + 2);
        if (rstInsurance.EOF) {
            printInsuranceValues = "N/A";
        }
        else {
            if ((rstInsurance.Fields.Item(strField).value) == null) {
                printInsuranceValues = "N/A";
            }
            else if (rstInsurance.Fields.Item(strField).value == 0)
                printInsuranceValues = "N/A";
            else
                printInsuranceValues = (((rstInsurance.Fields.Item(strField).value) / (rstInsurance.Fields.Item("Term").value)).toFixed(2)).toString();
        }
    }
    else {
        if (rstInsurance.EOF) {
            printInsuranceValues = "NA";
        }
        else {
            if (rstInsurance.Fields.Item(strField).value == null) {
                printInsuranceValues = "NA";
            }
            else if (rstInsurance.Fields.Item(strField).value == 0) {
                printInsuranceValues = "NA";
            }
            else {
                printInsuranceValues = rstInsurance.Fields.Item(strField).value.toFixed(2).toString();
            }
        }
    }
    return printInsuranceValues;

};

var insuredPremiums = function (province, quoteId, intComp) {
    var premiums = {
        "curLife": 0,
        "curResidualLife": 0,
        "curDis": 0,
        "curCI": 0,
        "curResidualCI": 0,
        "curDisA": 0,
        "intInsuranceTerm": 0,
        "curInsTaxRate": 0,
        "blnShowLeaseTax": false,
        "strType": '',
        "curInsuredMonthlyPayment": 0
    }
    var objInsuranceOnQuote = new ActiveXObject('DLFinancial.InsuranceOnQuote');
    objInsuranceOnQuote.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);

    var objInsuranceTable = new ActiveXObject('DLFinancial.InsuranceTable');
    objInsuranceTable.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);

    var objICompany = new ActiveXObject('DLFinancial.InsuranceCompany');
    objICompany.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
    var rstICompany = objICompany.GetInsuranceComp(intComp, undefined, false);

    var mobjQuote = Server.CreateObject("DealerLease.Quotes")
    mobjQuote.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);
    mobjQuote.GetQuote(quoteId);

    premiums.strType = mobjQuote.SelectedOption;

    var rstInsuranceOnQuote = new ActiveXObject('ADODB.RecordSet');

    //Insurance Tax for Leases
    if (!rstICompany.bof) {
        premiums.curInsTaxRate = objInsuranceTable.GetInsuranceTaxRate(province, quoteId);
        if (premiums.curInsTaxRate > 0 && rstICompany.Fields.Item("IsDoubleTaxed").value && premiums.strType == "L") {
            premiums.blnShowLeaseTax = true;
        }
        else {
            premiums.blnShowLeaseTax = false;
        }
    }

    if (premiums.strType == "F") {
        rstInsuranceOnQuote = objInsuranceOnQuote.GetInsuranceOnQuote(quoteId, false);
    }
    else {
        rstInsuranceOnQuote = objInsuranceOnQuote.GetInsuranceOnQuote(quoteId, true);
    }
    if (!rstICompany.bof) {
        premiums.intInsuranceTerm = rstInsuranceOnQuote.Fields.Item("Term").value;

        premiums.curLife = PrintInsuranceValues(rstInsuranceOnQuote, "Life", false);
        if (isNaN(premiums.curLife)) {
            premiums.curLife = 0;
        }
        else {
            premiums.curLife = parseFloat(premiums.curLife);
        }

        premiums.curResidualLife = PrintInsuranceValues(rstInsuranceOnQuote, "ResidualLife", false);
        if (isNaN(premiums.curResidualLife)) {
            premiums.curResidualLife = 0;
        }
        else {
            premiums.curResidualLife = parseFloat(premiums.curResidualLife);
        }

        premiums.curDis = PrintInsuranceValues(rstInsuranceOnQuote, "Disability", false);
        if (isNaN(premiums.curDis)) {
            premiums.curDis = 0;
        }
        else {
            premiums.curDis = parseFloat(premiums.curDis);
        }

        premiums.curCI = PrintInsuranceValues(rstInsuranceOnQuote, "Other", false);
        if (isNaN(premiums.curCI)) {
            premiums.curCI = 0;
        }
        else {
            premiums.curCI = parseFloat(premiums.curCI);
        }
        premiums.curResidualCI = PrintInsuranceValues(rstInsuranceOnQuote, "ResidualOther", false);
        if (isNaN(premiums.curResidualCI)) {
            premiums.curResidualCI = 0;
        }
        else {
            premiums.curResidualCI = parseFloat(premiums.curResidualCI);
        }

        premiums.curDisA = PrintInsuranceValues(rstInsuranceOnQuote, "Accidental", false);
        if (isNaN(premiums.curDisA)) {
            premiums.curDisA = 0;
        }
        else {
            premiums.curDisA = parseFloat(premiums.curDisA);
        }

        premiums.curInsuredMonthlyPayment = PrintInsuranceValues(rstInsuranceOnQuote, "InsuredPayment", false);
    }
        return premiums;
};

function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
    

   

   

    