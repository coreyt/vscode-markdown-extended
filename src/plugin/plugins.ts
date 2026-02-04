import { MarkdownItTOC } from './markdownItTOC';
import { MarkdownItContainer } from './markdownItContainer';
import { MarkdownItAnchorLink } from './markdownItAnchorLink';
import { MarkdownItExportHelper } from './markdownItExportHelper';
import { MarkdownItAdmonition } from './markdownItAdmonition';
import { html5Media } from 'markdown-it-html5-media';
import { config } from '../services/common/config';

interface MarkdownItPlugin {
    plugin: Function,
    args: unknown[],
}

const myPlugins: Record<string, Function> = {
    'markdown-it-toc': MarkdownItTOC,
    'markdown-it-container': MarkdownItContainer,
    'markdown-it-admonition': MarkdownItAdmonition,
    'markdown-it-anchor': MarkdownItAnchorLink,
    'markdown-it-helper': MarkdownItExportHelper,
    'markdown-it-html5-media': html5Media,
}

export const plugins: MarkdownItPlugin[] = [
    // $('markdown-it-toc'),
    // $('markdown-it-anchor'), // MarkdownItAnchorLink requires MarkdownItTOC
    $('markdown-it-table-of-contents', { includeLevel: config.tocLevels }),
    $('markdown-it-container'),
    $('markdown-it-admonition'),
    $('markdown-it-footnote'),
    $('markdown-it-abbr'),
    $('markdown-it-sup'),
    $('markdown-it-sub'),
    $('markdown-it-checkbox'),
    $('markdown-it-attrs'),
    $('markdown-it-kbd'),
    $('markdown-it-underline'),
    $('markdown-it-mark'),
    $('markdown-it-deflist'),
    $('markdown-it-emoji'),
    $('markdown-it-multimd-table', { multiline: true, rowspan: true, headerless: true }),
    $('markdown-it-html5-media'),
    $('markdown-it-helper')
].filter((p): p is MarkdownItPlugin => !!p);

function $(name: string, ...args: unknown[]): MarkdownItPlugin | undefined {
    for (let d of config.disabledPlugins) {
        if ('markdown-it-' + d == name) return undefined;
    }
    let plugin = myPlugins[name];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    if (!plugin) plugin = require(name);
    if (!plugin) return undefined;
    return {
        plugin: plugin,
        args: args,
    }
}
