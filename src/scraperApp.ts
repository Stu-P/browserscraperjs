import {Config} from './config';
import {BrowserService} from './browserService';
import * as request from 'request-promise';
import {Browser} from './browser';
import {SearchCriteria} from './browser';
import {VersionChange} from './browser';
import {VersionCheckResult} from './browser';

export class ScraperApp {

    private browserList: Array<Browser>;

    constructor(private config: Config) {


    }

    public start(): void {

        console.log("Start scraperApp");
        let browserService = new BrowserService(this.config.broswerApiUrl);

      //  let getBrowsersResource = "/api/browsers";
 let getBrowsersResource = "/scraper/GetAllEligibleBrowserSearchDetails";
 
        request(this.config.broswerApiUrl + getBrowsersResource)
            .then(result => Promise.all(JSON.parse(result).map(this.query)))
            .then(x => {
                console.log("Shutting down")
                process.exit();
            }).error(err => {
                console.log(err);
                process.exit();
            });

    }


    /*
    * Query Yahoo (YQL) to scrape version
    */
    public query = (_browser: Browser): Promise<any> => {

        var queryUrl = `https://query.yahooapis.com/v1/public/yql?q=select * from html where url='${_browser.searchCriteria.url}' and xpath='${_browser.searchCriteria.pageLocator}'&format=json`
        console.log(queryUrl);

        let versionCheck = new VersionCheckResult();
        versionCheck.checkSuccessful = false;
        versionCheck.changeDetected = false;

        return request(queryUrl).then(function checkIfNewBrowserVersion(yqlResult: string) {
            console.log("check yql result for New Browser Version")
            let newVersionRaw = JSON.parse(yqlResult);

            let newVersion = applyRegex(newVersionRaw.query.results, _browser.searchCriteria.versionRegex);

            if (newVersion == null || newVersion == "") {/* do nothing*/ }
            else {
                versionCheck.checkSuccessful = true;
                if (newVersion != _browser.currentVersion) {
                    versionCheck.changeDetected = true;
                    versionCheck.versionChange = new VersionChange();
                    versionCheck.versionChange.browserName = _browser.name;
                    versionCheck.versionChange.priorVersion = _browser.currentVersion;
                    versionCheck.versionChange.newVersion = newVersion;
                    versionCheck.versionChange.dateOfChange = new Date();
                    _browser.currentVersion = newVersion;
               }
                versionCheck.browser = _browser;
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
            else return;
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
            else return;
        }).error(x => console.log(x));
    }
}

// TODO!!!
     /*   
    * Apply regex to YQL result to obtain only version number (exlude any other text contianed within html cell)
    */

function applyRegex(dirtyString: string, _regex: string): string {
    console.log("scraperApp - applyRegex called");
    if (dirtyString == null) return "";
    else return dirtyString.trim();
}