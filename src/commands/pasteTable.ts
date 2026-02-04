import { Command } from './command';
import * as vscode from 'vscode';
import clipboard from 'clipboardy';
import { convertToMarkdownTable } from '../services/table/convertTable';
import { editTextDocument } from '../services/common/editTextDocument';

export class CommandPasteTable extends Command {
    async execute() {
        let text = (await clipboard.read()).trim();
        if (!text) return;
        let tableText = convertToMarkdownTable(text);
        if (!tableText) return;
        let editor = vscode.window.activeTextEditor;
        if (!editor) return;
        return editTextDocument(
            editor.document, [{
                range: editor.selection,
                replace: tableText
            }]
        );
    }
    constructor() {
        super("markdownExtended.pasteAsTable");
    }
}
