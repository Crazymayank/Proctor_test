document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("create-image").addEventListener("click", function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "create-image"}, function(response) {
                console.log(response);
            });
        });
    });
});