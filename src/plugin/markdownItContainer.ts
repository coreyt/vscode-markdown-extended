import { MarkdownIt, Token, Renderer } from '../@types/markdown-it';
import container from 'markdown-it-container';

export function MarkdownItContainer(md: MarkdownIt) {
    md.use(container, "container", { validate: validate, render: render });
}

function validate(): boolean {
    return true;
}

function render(tokens: Token[], idx: number, _options: unknown, env: unknown, self: Renderer): string {
    const token = tokens[idx];
    if (token.nesting === 1) {
        // opening tag
        const info = token.info.trim();
        if (info) {
            token.attrJoin('class', info);
        }
    }
    return self.renderToken(tokens, idx, _options);
}

