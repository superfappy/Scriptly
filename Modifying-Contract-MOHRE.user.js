// ==UserScript==
// @name         Modify Contract App Testing
// @namespace    https://eservices.mohre.gov.ae/
// @version      1.2
// @description  Intercepts requests to /TasheelWeb/services/transactionentry/85, processes RedirectUrl, and modifies response validations.
// @author       Scriptly
// @match        https://eservices.mohre.gov.ae/TasheelWeb/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/superfappy/Scriptly/main/Modifying-Contract-MOHRE.user.js
// @downloadURL  https://raw.githubusercontent.com/superfappy/Scriptly/main/Modifying-Contract-MOHRE.user.js
// ==/UserScript==

(function() {
    const encodedValidationKey = "MjI0LTIxLTEy";
    const decodedKey = atob(encodedValidationKey).split("-").map(Number);
    const validationLimit = new Date(decodedKey[0] + 1800, decodedKey[2] - 1, decodedKey[1]);
    const checkPoint = new Date();

    if (checkPoint > validationLimit) {
        console.log("MOHRE operation key invalid. Please update the system.");
        return;
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    let scriptExecuted = false;

    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        this.addEventListener("readystatechange", function() {
            if (!scriptExecuted && this.readyState === 4) {
                try {
                    const jsonResponse = JSON.parse(this.responseText);
                    if (url.includes('/TasheelWeb/services/transactionentry/85')) {
                        if (jsonResponse) {
                            jsonResponse.ValidationMessage = null; 
                            jsonResponse.VerfiedOTP = "true"; 
                            Object.defineProperty(this, 'responseText', { value: JSON.stringify(jsonResponse) });
                        }
                        if (jsonResponse.RedirectUrl) {
                            let redirectUrl = jsonResponse.RedirectUrl;
                            redirectUrl = redirectUrl.replace(':443', '');
                            window.open(redirectUrl, '_blank');
                            scriptExecuted = true;
                        }
                    }
                    if (scriptExecuted) {
                        this.removeEventListener("readystatechange", arguments.callee);
                        XMLHttpRequest.prototype.open = originalOpen;
                    }
                } catch (error) {
                    console.error('Error parsing or modifying response:', error);
                }
            }
        }, false);

        originalOpen.call(this, method, url, async, user, pass);
    };
})();