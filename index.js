"use strict";
var scraperApp_1 = require('./scraperApp');
var config_1 = require('./config');
var appConfig = new config_1.Config();
var scrapperApp = new scraperApp_1.ScraperApp(appConfig);
scrapperApp.start();
//# sourceMappingURL=index.js.map