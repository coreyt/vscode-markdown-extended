//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    test("Activates and wires markdown-it plugins", async () => {
        const ext = vscode.extensions.getExtension('jebbs.markdown-extended');
        assert.ok(ext, 'Extension not found');

        const api = await ext?.activate();
        assert.ok(api?.extendMarkdownIt, 'API not exposed');

        const md = new MarkdownIt();
        api.extendMarkdownIt(md);

        const html = md.render([
            '::: container',
            'content',
            ':::',
            '',
            '!!! note \"Title\"',
            '',
            '    Body',
            '',
            '[Go](#My-Header)',
        ].join('\n'));

        assert.ok(html.includes('<div class=\"container\">'), 'Container not rendered');
        assert.ok(html.includes('class=\"admonition note\"'), 'Admonition not rendered');
        assert.ok(html.includes('class=\"admonition-title\"'), 'Admonition title not rendered');
        assert.ok(html.includes('href=\"#my-header\"'), 'Anchor link not slugified');
    });
});
