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
    'markdown-it-html5-media': html5Media,
}

// Export-only plugins (not needed for preview rendering)
const exportOnlyPlugins: Record<string, Function> = {
    'markdown-it-helper': MarkdownItExportHelper,
}

/**
 * Plugins used for live preview rendering.
 * Optimized for speed - excludes export-only plugins.
 */
export const plugins: MarkdownItPlugin[] = [
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
].filter((p): p is MarkdownItPlugin => !!p);

/**
 * Get the export helper plugin for HTML export operations.
 * This is separate from preview plugins to avoid unnecessary processing during live preview.
 */
export function getExportPlugin(): MarkdownItPlugin {
    return {
        plugin: MarkdownItExportHelper,
        args: [],
    };
}

function $(name: string, ...args: unknown[]): MarkdownItPlugin | undefined {
    for (const d of config.disabledPlugins) {
        if ('markdown-it-' + d === name) return undefined;
    }
    let plugin = myPlugins[name];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    if (!plugin) plugin = require(name);
    if (!plugin) return undefined;
    return {
        plugin: plugin,
        args: args,
    };
}
