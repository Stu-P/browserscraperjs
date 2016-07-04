import * as request from 'request-promise';

export class BrowserService {

    private getBrowsersResource: string = "/api/browsers";

    constructor(private baseUrl: string) {

    }

    public getBrowsers = () : request.RequestPromise  => {
    console.log("BrowserService - getBrowsers called");

        return request(this.baseUrl + this.getBrowsersResource);


    }

    private onBrowserApiResponse = (error: any, response: any, body: any): void => {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);
            console.log(result);
        }
    }
}