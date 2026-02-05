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

/**
 * Plugins organized by performance impact.
 * Users can disable expensive plugins via markdownExtended.disabledPlugins
 *
 * ESSENTIAL (low overhead):
 *   - footnote, abbr, sup, sub, checkbox, kbd, underline, mark, deflist, attrs
 *
 * MODERATE (some overhead):
 *   - container, admonition, html5-media
 *
 * EXPENSIVE (consider disabling for large docs):
 *   - toc (scans all headings, has debounce)
 *   - multimd-table (complex table parsing with rowspan/colspan)
 */
export const plugins: MarkdownItPlugin[] = [
    // === EXPENSIVE: Consider disabling for large documents ===
    $('markdown-it-table-of-contents', { includeLevel: config.tocLevels }),
    $('markdown-it-multimd-table', { multiline: true, rowspan: true, headerless: true }),

    // === MODERATE: Block-level processing ===
    $('markdown-it-container'),
    $('markdown-it-admonition'),
    $('markdown-it-html5-media'),

    // === ESSENTIAL: Low overhead inline/block plugins ===
    $('markdown-it-footnote'),
    $('markdown-it-abbr'),
    $('markdown-it-sup'),
    $('markdown-it-sub'),
    $('markdown-it-checkbox'),
    $('markdown-it-attrs2/full'),
    $('markdown-it-kbd'),
    $('markdown-it-underline'),
    $('markdown-it-mark'),
    $('markdown-it-deflist'),
].filter((p): p is MarkdownItPlugin => !!p);

/**
 * Get the export helper plugin for HTML export operations.
 * Separate from preview plugins to avoid unnecessary processing during live preview.
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
