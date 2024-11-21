// ==UserScript==
// @name         Renewal Submission Testing
// @namespace    https://eservices.mohre.gov.ae/
// @version      1.3
// @description  Intercepts requests to /TasheelWeb/services/transactionentry/228, preferring RedirectUrl if present, or constructs URL with NewKey if RedirectUrl is not found.
// @author       Scriptly
// @match        https://eservices.mohre.gov.ae/TasheelWeb/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/superfappy/Scriptly/main/Renewal-Submission-MOHRE.user.js
// @downloadURL  https://raw.githubusercontent.com/superfappy/Scriptly/main/Renewal-Submission-MOHRE.user.js
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
                    if (url.includes('/TasheelWeb/services/transactionentry/228')) {
                        let targetUrl = null;

                        if (jsonResponse.RedirectUrl) {
                            targetUrl = jsonResponse.RedirectUrl.replace(':443', '');
                        } else if (jsonResponse.NewKey) {
                            targetUrl = `https://eservices.mohre.gov.ae/TasheelWeb/services/submitrenewLC/${jsonResponse.NewKey}`;
                        }

                        if (targetUrl) {
                            window.open(targetUrl, '_blank');
                            scriptExecuted = true;
                            window.close();
                        }
                    }
                    if (scriptExecuted) {
                        this.removeEventListener("readystatechange", arguments.callee);
                        XMLHttpRequest.prototype.open = originalOpen;
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                }
            }
        }, false);

        originalOpen.call(this, method, url, async, user, pass);
    };
})();
