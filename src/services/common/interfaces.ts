import * as vscode from 'vscode';

export interface MarkdownItEnv {
    htmlExporter?: HtmlExporterEnv,
}

export interface HtmlExporterEnv {
    uri: vscode.Uri,
    workspaceFolder: vscode.Uri | undefined,
    vsUri: string,
    embedImage: boolean,
}