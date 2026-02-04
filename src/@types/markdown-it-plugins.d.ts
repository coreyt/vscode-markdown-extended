declare module 'markdown-it-container' {
    import MarkdownIt from 'markdown-it';
    function container(md: MarkdownIt, name: string, options?: object): void;
    export = container;
}

declare module 'markdown-it-table-of-contents' {
    import MarkdownIt from 'markdown-it';
    function toc(md: MarkdownIt, options?: object): void;
    export = toc;
}

declare module 'markdown-it-html5-media' {
    import MarkdownIt from 'markdown-it';
    export function html5Media(md: MarkdownIt, options?: object): void;
}
