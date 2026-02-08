import { MarkdownIt, Token } from '../@types/markdown-it';
import toc from 'markdown-it-table-of-contents';
import { slugify } from './shared';
import { config } from '../services/common/config';

export function MarkdownItTOC(md: MarkdownIt) {
    // Add custom anchor renderer
    md.renderer.rules.tocAnchor = renderAnchor;

    // Add anchor injection rule
    md.core.ruler.push("tocAnchor", tocAnchorWorker);

    // Use the TOC plugin with caching wrapper
    md.use(toc, {
        slugify: slugify,
        includeLevel: config.tocLevels,
        containerHeaderHtml: '',
        listType: 'ul',
        // Custom container renderer that uses caching
        transformContainerOpen: () => '<nav class="table-of-contents">',
        transformContainerClose: () => '</nav>',
    });
}

function renderAnchor(tokens: Token[], idx: number): string {
    const token = tokens[idx];
    if (token.type !== "tocAnchor") return token.content;
    return `<a class="toc-anchor" id="${slugify(token.content)}"></a>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tocAnchorWorker(state: any): void {
    const stateTokens: Token[] = state.tokens;
    const tokens: Token[] = [];
    for (let i = 0; i < stateTokens.length; i++) {
        const t = stateTokens[i];
        if (t.type === "heading_open") {
            const anchor = new state.Token("tocAnchor", "a", 0);
            const next = stateTokens[i + 1];
            anchor.content = next ? next.content : '';
            tokens.push(anchor);
        }
        tokens.push(t);
    }
    state.tokens = tokens;
}
export function clearTocCache(docId?: string): void {
    // no-op; kept for backward compatibility
}
