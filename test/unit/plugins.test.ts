import * as assert from 'assert';
import MarkdownIt from 'markdown-it';
import { MarkdownItAdmonition } from '../../src/plugin/markdownItAdmonition';
import { MarkdownItAnchorLink } from '../../src/plugin/markdownItAnchorLink';
import { MarkdownItContainer } from '../../src/plugin/markdownItContainer';
import { slugify } from '../../src/plugin/shared';

suite('Markdown-It Plugins', () => {
    test('Admonition renders wrapper and title', () => {
        const md = new MarkdownIt();
        MarkdownItAdmonition(md);

        const html = md.render([
            '!!! note \"Title\"',
            '',
            '    Body',
        ].join('\n'));

        assert.ok(html.includes('class=\"admonition note\"'));
        assert.ok(html.includes('class=\"admonition-title\"'));
        assert.ok(html.includes('Title'));
    });

    test('Anchor link rewrites slug to lowercase', () => {
        const md = new MarkdownIt();
        MarkdownItAnchorLink(md);

        const html = md.render('[Go](#My-Header)');
        assert.ok(html.includes('href=\"#my-header\"'));
    });

    test('Container wraps content in a div', () => {
        const md = new MarkdownIt();
        MarkdownItContainer(md);

        const html = md.render([
            '::: container',
            'content',
            ':::',
        ].join('\n'));

        assert.ok(html.includes('<div class=\"container\">'));
        assert.ok(html.includes('content'));
        assert.ok(html.includes('</div>'));
    });

    test('Slugify lowercases and encodes spaces', () => {
        const value = slugify('Hello World');
        assert.strictEqual(value, 'hello-world');
    });
});
