import { MarkdownIt, Token } from '../@types/markdown-it';
import container from 'markdown-it-container';

export function MarkdownItContainer(md: MarkdownIt) {
    md.use(container, "container", { validate: validate, render: render });
}

function validate(): boolean {
    return true;
}

function render(tokens: Token[], idx: number): string {
    if (tokens[idx].nesting === 1) {
        // opening tag
        let cls = escape(tokens[idx].info.trim());
        return `<div class="${cls}">\n`;
    } else {
        // closing tag
        return '</div>\n';
    }
}

function escape(str: string): string {
    return str.replace(/"/g, '&quot;', )
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}
