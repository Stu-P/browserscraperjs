import {ScraperApp} from './scraperApp'
import {Config} from './config'


let appConfig = new Config();
let scrapperApp = new ScraperApp(appConfig);

 scrapperApp.start();



