// ==UserScript==
// @name         Renewal App Testing
// @namespace    https://eservices.mohre.gov.ae/
// @version      4.0
// @description  VIP Renewal application
// @author       Scriptly
// @match        https://eservices.mohre.gov.ae/TasheelWeb/services/transactionentry/70
// @grant        none
// @updateURL    https://raw.githubusercontent.com/superfappy/Scriptly/main/renewal-mohre-application.user.js
// @downloadURL  https://raw.githubusercontent.com/superfappy/Scriptly/main/renewal-mohre-application.user.js
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
    let operationCompleted = false;

    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        this.addEventListener("readystatechange", function() {
            if (!operationCompleted && this.readyState === 4 && url.includes('/TasheelWeb/services/transactionentry/70')) {
                try {
                    const jsonResponse = JSON.parse(this.responseText);
                    console.log('Original Response:', jsonResponse);

                    
                    jsonResponse.ValidationMessage = null; 
                    jsonResponse.VerfiedOTP = "true"; 

                    
                    console.log('Modified Response:', jsonResponse);

              
                    if (jsonResponse.RedirectUrl) {
                        const redirectUrl = jsonResponse.RedirectUrl;
                        console.log('RedirectUrl:', redirectUrl);

                     
                        window.open(redirectUrl, '_blank');

                     
                        navigator.clipboard.writeText(redirectUrl).then(() => {
                            console.log('RedirectUrl copied to clipboard:', redirectUrl);
                        }).catch(err => {
                            console.error('Failed to copy RedirectUrl:', err);
                        });

                        operationCompleted = true;
                    } else {
                        console.log('RedirectUrl not found in the response.');
                    }

                
                    Object.defineProperty(this, 'responseText', { value: JSON.stringify(jsonResponse) });
                } catch (error) {
                    console.error('Error parsing or modifying the response:', error);
                }
            }
        }, false);

        originalOpen.call(this, method, url, async, user, pass);
    };
})();
