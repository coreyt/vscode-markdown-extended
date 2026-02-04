import * as vscode from 'vscode';
import { ExporterQuickPickItem, exportFormat, MarkdownExporter, FormatQuickPickItem } from './interfaces';
import { htmlExporter } from './html';

export async function pickFormat(): Promise<exportFormat> {
    // With only HTML export available, we can simplify this
    return exportFormat.HTML;
}

export async function pickExporter(format: exportFormat): Promise<MarkdownExporter | undefined> {
    let availableExporters = getAvailableExporters(format);
    if (availableExporters.length == 1) return availableExporters[0].exporter;
    let pick = await vscode.window.showQuickPick<ExporterQuickPickItem>(
        availableExporters,
        <vscode.QuickPickOptions>{ placeHolder: `Select an exporter to export ${format}...` }
    );
    if (!pick) return undefined;
    return pick.exporter;
}

function getAvailableExporters(format: exportFormat): ExporterQuickPickItem[] {
    let items: ExporterQuickPickItem[] = [];

    if (htmlExporter.FormatAvailable(format)) items.push(
        <ExporterQuickPickItem>{
            label: "HTML Exporter",
            description: "export to html.",
            exporter: htmlExporter,
        }
    );
    return items;
}
