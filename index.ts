import {ScraperApp} from './src/scraperApp'
import {Config} from './src/config'


let appConfig = new Config();
let scrapperApp = new ScraperApp(appConfig);

 scrapperApp.start();



