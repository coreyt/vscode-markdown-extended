import { MarkdownIt } from '../@types/markdown-it';
import { slugify } from './shared';

const anchorLinkReg = /\[.+?\]\(\s*#(\S+?)\s*\)/ig;

interface TokenChild {
    type: string;
    attrs?: [string, string][];
}

interface Token {
    type: string;
    content: string;
    children?: TokenChild[];
}

export function MarkdownItAnchorLink(md: MarkdownIt) {
    md.core.ruler.push("anchorLink", anchorLinkWorker);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function anchorLinkWorker(state: any) {
    state.tokens.map((t: Token) => {
        if (
            t.type == "inline" &&
            t.children &&
            t.children.length &&
            anchorLinkReg.test(t.content)
        ) {
            let matches: RegExpExecArray | null;
            let links: string[] = [];
            anchorLinkReg.lastIndex = 0;
            while ((matches = anchorLinkReg.exec(t.content)) !== null) {
                links.push("#" + slugify(matches[1]));
            }
            let linkCount: number = t.children.reduce((p: number, c: TokenChild) => p += c.type == "link_open" ? 1 : 0, 0);
            if (linkCount !== links.length) {
                console.log("markdownExtended: Link count and link token count mismatch!");
            } else {
                t.children.map((child: TokenChild) => {
                    if (child.type == "link_open") {
                        const href = links.shift();
                        if (href) {
                            child.attrs = [["href", href]];
                        }
                    }
                });
            }
        }
    });
}
