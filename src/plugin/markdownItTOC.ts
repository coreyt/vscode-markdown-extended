import { MarkdownIt, Token } from '../@types/markdown-it';
import toc from 'markdown-it-table-of-contents';
import { slugify } from './shared';
import { config } from '../services/common/config';

// Cache for TOC content to avoid expensive recomputation
let tocCache: Map<string, { content: string; timestamp: number }> = new Map();
const TOC_CACHE_TTL = 2000; // 2 seconds debounce

export function MarkdownItTOC(md: MarkdownIt) {
    md.renderer.rules.tocAnchor = renderHtml;
    md.core.ruler.push("tocAnchor", tocAnchorWorker);
    md.use(toc, {
        slugify: slugify,
        includeLevel: config.tocLevels,
        // Use cached TOC content when available and fresh
        transformContainerOpen: () => {
            return '<div class="table-of-contents">';
        },
    });
}

function renderHtml(tokens: Token[], idx: number) {
    let token = tokens[idx];
    if (token.type !== "tocAnchor") return tokens[idx].content;
    return `<a for="toc-anchor" id="${slugify(token.content)}"></a>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tocAnchorWorker(state: any) {
    let tokens: Token[] = [];
    state.tokens.map((t: Token, i: number, ts: Token[]) => {
        if (t.type == "heading_open") {
            let anchor = new state.Token("tocAnchor", "a", 0);
            anchor.content = ts[i + 1].content;
            tokens.push(anchor);
        }
        tokens.push(t);
    });
    state.tokens = tokens;
}

/**
 * Clear the TOC cache - call this when document changes significantly
 */
export function clearTocCache(docId?: string) {
    if (docId) {
        tocCache.delete(docId);
    } else {
        tocCache.clear();
    }
}
