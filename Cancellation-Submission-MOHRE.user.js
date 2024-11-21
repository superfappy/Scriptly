// ==UserScript==
// @name         Cancellation Submission Testing
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Intercept specific Tasheel transactions, modify response validations, and open the new URL with NewKey in a new tab.
// @author       Scriptly
// @match        https://eservices.mohre.gov.ae/TasheelWeb/services/transactionentry/47
// @grant        none
// @updateURL    https://raw.githubusercontent.com/superfappy/Scriptly/main/Cancellation-Submission-MOHRE.user.js
// @downloadURL  https://raw.githubusercontent.com/superfappy/Scriptly/main/Cancellation-Submission-MOHRE.user.js
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
                    if (url.includes('/TasheelWeb/services/transactionentry/47')) {
                        if (jsonResponse) {
                            jsonResponse.ValidationMessage = null;
                            jsonResponse.VerfiedOTP = "true";
                            Object.defineProperty(this, 'responseText', { value: JSON.stringify(jsonResponse) });
                        }
                        if (jsonResponse.NewKey) {
                            const newKey = jsonResponse.NewKey;
                            const redirectUrl = `https://eservices.mohre.gov.ae/TasheelWeb/services/CancellationSubmission/${newKey}`;
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
