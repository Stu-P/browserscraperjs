"use strict";
var request = require('request-promise');
var BrowserService = (function () {
    function BrowserService(baseUrl) {
        var _this = this;
        this.baseUrl = baseUrl;
        this.getBrowsersResource = "/api/browsers";
        this.getBrowsers = function () {
            console.log("BrowserService - getBrowsers called");
            return request(_this.baseUrl + _this.getBrowsersResource);
        };
        this.onBrowserApiResponse = function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                console.log(result);
            }
        };
    }
    return BrowserService;
}());
exports.BrowserService = BrowserService;
//# sourceMappingURL=browserService.js.map