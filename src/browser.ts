export class Browser {
    public name: string;
    public os: string;
    public currentVersion: string;
    public lastVersionCheck: Date;
    public versionCheckEnabled: boolean;
    public searchCriteria = new SearchCriteria();
}

export class SearchCriteria {
    public url: string;
    public pageLocator: string;
    public versionRegex: string;
}

export class VersionChange
{
    public browserName: string;
    public newVersion: string;
    public priorVersion: string;
	public dateOfChange: Date;
}

export class VersionCheckResult
{
    public checkSuccessful: boolean;
    public changeDetected: boolean;
    public versionChange: VersionChange;
    public browser: Browser;
}