import { MarkdownItTOC } from './markdownItTOC';
import { MarkdownItContainer } from './markdownItContainer';
import { MarkdownItAnchorLink } from './markdownItAnchorLink';
import { MarkdownItExportHelper } from './markdownItExportHelper';
import { MarkdownItAdmonition } from './markdownItAdmonition';
import { html5Media } from 'markdown-it-html5-media';
import { config } from '../services/common/config';

interface MarkdownItPlugin {
    name: string,
    plugin: Function,
    args: unknown[],
    postInstall?: (md: unknown) => void,
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
    $('markdown-it-anchor'),
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
        name: 'markdown-it-export-helper',
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
    const postInstall = getPostInstallHook(name);
    return {
        name: name,
        plugin: plugin,
        args: args,
        postInstall: postInstall,
    };
}

const WRAPPED_RULE = Symbol('wrappedRule');

function getPostInstallHook(name: string): ((md: unknown) => void) | undefined {
    if (name === 'markdown-it-multimd-table') {
        return md => {
            wrapBlockRule(md, 'table', shouldSkipTableRule);
        };
    }
    if (name === 'markdown-it-table-of-contents') {
        return md => {
            wrapBlockRule(md, 'toc', shouldSkipForLargeDoc);
        };
    }
    if (name === 'markdown-it-admonition') {
        return md => {
            wrapBlockRule(md, 'admonition', shouldSkipAdmonition);
        };
    }
    if (name === 'markdown-it-container') {
        return md => {
            wrapBlockRule(md, 'container_container', shouldSkipContainer);
        };
    }
    return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapBlockRule(md: any, ruleName: string, skip: (state: any) => boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rules: any[] | undefined = md?.block?.ruler?.__rules__;
    if (!rules || !rules.length) return;
    const rule = rules.find(r => r.name === ruleName && typeof r.fn === 'function');
    if (!rule) return;
    if (rule.fn[WRAPPED_RULE]) return;
    const original = rule.fn;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapped = function (this: unknown, state: any, startLine: number, endLine: number, silent: boolean): boolean {
        if (skip(state)) return false;
        return original.call(this, state, startLine, endLine, silent);
    };
    wrapped[WRAPPED_RULE] = true;
    rule.fn = wrapped;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldSkipForLargeDoc(state: any): boolean {
    if (!config.autoDisableExpensivePluginsInPreview) return false;
    const threshold = config.previewLargeDocLineThreshold;
    if (threshold <= 0) return false;
    return (state?.lineMax ?? 0) >= threshold;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldSkipTableRule(state: any): boolean {
    if (shouldSkipForLargeDoc(state)) return true;
    const env = state.env || (state.env = {});
    if (env.__mdeHasPipeSyntax === undefined) {
        env.__mdeHasPipeSyntax = typeof state?.src === 'string' && state.src.includes('|');
    }
    return !env.__mdeHasPipeSyntax;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldSkipAdmonition(state: any): boolean {
    const env = state.env || (state.env = {});
    if (env.__mdeHasAdmonitionSyntax === undefined) {
        env.__mdeHasAdmonitionSyntax = typeof state?.src === 'string' && state.src.includes('!!!');
    }
    return !env.__mdeHasAdmonitionSyntax;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldSkipContainer(state: any): boolean {
    const env = state.env || (state.env = {});
    if (env.__mdeHasContainerSyntax === undefined) {
        env.__mdeHasContainerSyntax = typeof state?.src === 'string' && state.src.includes(':::');
    }
    return !env.__mdeHasContainerSyntax;
}
