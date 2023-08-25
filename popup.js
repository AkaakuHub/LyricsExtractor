document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("clickButton").addEventListener("click", function () {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, { action: "extractFunction" });
        });
    });
    document.getElementById("about").addEventListener("click", function () {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, { action: "contactFunction" });
        });
    });
});
