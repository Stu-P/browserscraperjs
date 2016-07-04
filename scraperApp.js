"use strict";
var browserService_1 = require('./browserService');
var request = require('request-promise');
var browser_1 = require('./browser');
var browser_2 = require('./browser');
var ScraperApp = (function () {
    function ScraperApp(config) {
        this.config = config;
        /*
        * Query Yahoo (YQL) to scrape version
        */
        this.query = function (_browser) {
            var queryUrl = "https://query.yahooapis.com/v1/public/yql?q=select * from html where url='" + _browser.searchCriteria.url + "' and xpath='" + _browser.searchCriteria.pageLocator + "'&format=json";
            console.log(queryUrl);
            var versionCheck = new browser_2.VersionCheckResult();
            versionCheck.checkSuccessful = false;
            versionCheck.changeDetected = false;
            return request(queryUrl).then(function checkIfNewBrowserVersion(yqlResult) {
                console.log("check yql result for New Browser Version");
                var newVersionRaw = JSON.parse(yqlResult);
                var newVersion = applyRegex(newVersionRaw.query.results, _browser.searchCriteria.versionRegex);
                if (newVersion == null || newVersion == "") { }
                else {
                    versionCheck.checkSuccessful = true;
                    if (newVersion != _browser.currentVersion) {
                        versionCheck.changeDetected = true;
                        versionCheck.versionChange = new browser_1.VersionChange();
                        versionCheck.versionChange.browserName = _browser.name;
                        versionCheck.versionChange.priorVersion = _browser.currentVersion;
                        versionCheck.versionChange.newVersion = newVersion;
                        versionCheck.versionChange.dateOfChange = new Date();
                        _browser.currentVersion = newVersion;
                        versionCheck.browser = _browser;
                    }
                }
                return versionCheck;
            }).then(function sendBrowserUpdate(result) {
                if (versionCheck.checkSuccessful) {
                    console.log("sending browser update message for " + versionCheck.browser.name);
                    console.log(JSON.stringify(versionCheck.browser));
                    return request.post({
                        uri: "http://browsertrackapi.azurewebsites.net/scraper/Update",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(versionCheck.browser)
                    });
                }
                else
                    return;
            }).then(function sendVersionChangeAudit(result) {
                if (versionCheck.changeDetected) {
                    console.log("sending version change audit message for " + versionCheck.browser.name);
                    return request.post({
                        uri: "http://browsertrackapi.azurewebsites.net/scraper/AddVersionHistoryRecord",
                        //                  method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(versionCheck.versionChange)
                    });
                }
                else
                    return;
            }).error(function (err) { return console.log(err); });
        };
    }
    ScraperApp.prototype.start = function () {
        var _this = this;
        console.log("Start scraperApp");
        var browserService = new browserService_1.BrowserService(this.config.broswerApiUrl);
        //  let getBrowsersResource = "/api/browsers";
        var getBrowsersResource = "/scraper/GetAllEligibleBrowserSearchDetails";
        request(this.config.broswerApiUrl + getBrowsersResource)
            .then(function (result) { return Promise.all(JSON.parse(result).map(_this.query)); })
            .then(function (x) {
            console.log("Shutting down");
            process.exit();
        }).error(function (err) {
            console.log(err);
            process.exit();
        });
    };
    return ScraperApp;
}());
exports.ScraperApp = ScraperApp;
function applyRegex(dirtyString, _regex) {
    console.log("scraperApp - applyRegex called");
    if (dirtyString == null)
        return "";
    else
        return dirtyString.trim();
}
//# sourceMappingURL=scraperApp.js.map