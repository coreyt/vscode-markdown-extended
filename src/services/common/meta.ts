import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

export class MetaData {
    private _uri: vscode.Uri;
    private _meta: any;
    constructor(data: string, uri: vscode.Uri) {
        this._uri = uri;
        this._meta = yaml.load(data) || {};
    }
    get raw() {
        return this._meta || {};
    }
}
