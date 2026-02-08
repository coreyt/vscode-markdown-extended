import { MarkdownIt } from '../@types/markdown-it';
import { slugify } from './shared';

interface TokenChild {
    type: string;
    tag?: string;
    attrs?: [string, string][];
}

interface Token {
    type: 'inline' | string;
    children?: TokenChild[];
}

export function MarkdownItAnchorLink(md: MarkdownIt) {
    md.core.ruler.push("anchorLink", anchorLinkWorker);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function anchorLinkWorker(state: any) {
    for (const t of state.tokens as Token[]) {
        if (t.type !== 'inline' || !t.children || !t.children.length) {
            continue;
        }
        for (const child of t.children) {
            if (child.type !== 'link_open' || !child.attrs) {
                continue;
            }
            const href = child.attrs.find(a => a[0] === 'href');
            if (!href || !href[1] || href[1].charAt(0) !== '#') {
                continue;
            }
            const target = href[1].slice(1).trim();
            href[1] = '#' + slugify(target);
        }
    }
}
