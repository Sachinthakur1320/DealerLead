/**
* NOTE: This library also requires the following include files:
*	_inc/rpcClient.asp
*
**/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // [1] AMD anonymous module
        define(factory);
    } else if (typeof require === 'function') {
        module.exports = factory();
    } else {
        // [2] No module loader (plain <script> tag) - put directly in global namespace
        OEC = (typeof OEC === 'undefined' ? {} : OEC);
        OEC.toolbox = (typeof OEC.toolbox === 'undefined' ? {} : OEC.toolbox);
        OEC.toolbox.encryption = OEC.toolbox.encryption || factory();
    }
})(function () {
    var encryption = function (initializationVector) {

        var driversLicenseCipherKeyword = "CipherDL&*()"; //CipherDL + (Shift 7890)

        var isValidCipherText = function (driversLicense) {
            if (driversLicense.indexOf(driversLicenseCipherKeyword) === 0)
            { return true; }
            return false;
        }

        var addCipherKeywordToDriversLicense = function (encryptedDriversLicense) {
            return driversLicenseCipherKeyword + encryptedDriversLicense;
        }

        var removeCipherKeywordFromDriversLicense = function (encryptedDriversLicense) {
            return encryptedDriversLicense.replace(driversLicenseCipherKeyword, '');
        }

        var encrypt = function (valueToEncrypt) {
            if (valueToEncrypt) {

                if (isValidCipherText(valueToEncrypt)) {
                    return valueToEncrypt;
                }
                //Remove non alphanumerics from Drivers license before storing in DB
                valueToEncrypt = valueToEncrypt.replace(/[^0-9a-zA-Z]/g, '');
                if (valueToEncrypt) {
                    var encryptionRpc = rpcClient("http://localhost/webasp/api/encryptionService.aspx");
                    var encryptedString = encryptionRpc("Encrypt")(valueToEncrypt, initializationVector);
                    return addCipherKeywordToDriversLicense(encryptedString);
                } else {
                    return valueToEncrypt;
                }
            }
            return valueToEncrypt;
        }

        var decrypt = function (valueToDecrypt) {
            if (valueToDecrypt) {
                if (!isValidCipherText(valueToDecrypt)) {
                    return valueToDecrypt;
                }
                var actualCipherText = removeCipherKeywordFromDriversLicense(valueToDecrypt);
                var encodedCipherText = encodeURIComponent(actualCipherText);
                var encryptionRpc = rpcClient("http://localhost/webasp/api/encryptionService.aspx");
                var editedString = encryptionRpc("Decrypt")(encodedCipherText, initializationVector);
                return editedString;
            }
            return valueToDecrypt;
        }

        var exports = {};
        exports.encrypt = encrypt;
        exports.decrypt = decrypt;
        return exports;
    };

    var driversLicence = function () {
        return encryption("1VraLPTOb/rZmV4LcKrNYA==");
    }

    return driversLicence();
});