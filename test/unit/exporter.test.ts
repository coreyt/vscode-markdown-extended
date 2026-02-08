import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { renderTemplate } from '../../src/services/exporter/template';
import { cssFileToDataUri, fileToDataUri, getDataUriSchema } from '../../src/services/common/dataUri';

suite('Export Helpers', () => {
    test('getDataUriSchema returns expected mime prefix', () => {
        const schema = getDataUriSchema('image.png');
        assert.strictEqual(schema, 'data:image/png;base64,');
    });

    test('fileToDataUri encodes file content', () => {
        const tmpDir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-export-'));
        const filePath = path.join(tmpDir, 'sample.png');
        fs.writeFileSync(filePath, 'hello', 'utf-8');

        const uri = fileToDataUri(filePath);
        assert.ok(uri.startsWith('data:image/png;base64,'));
        assert.ok(uri.includes(Buffer.from('hello').toString('base64')));
    });

    test('cssFileToDataUri inlines url() assets', () => {
        const tmpDir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-export-'));
        const imgPath = path.join(tmpDir, 'icon.png');
        const cssPath = path.join(tmpDir, 'styles.css');

        fs.writeFileSync(imgPath, 'x');
        fs.writeFileSync(cssPath, 'body { background: url(\"icon.png\"); }');

        const uri = cssFileToDataUri(cssPath);
        assert.ok(uri.startsWith('data:text/css;base64,'));
        const encodedCss = uri.replace('data:text/css;base64,', '');
        const decodedCss = Buffer.from(encodedCss, 'base64').toString('utf-8');
        assert.ok(decodedCss.includes('data:image/png;base64,'));
    });

    test('renderTemplate returns formatted HTML', () => {
        const result = renderTemplate('MyTitle', 'MyStyle', 'MyClass', 'MyHTML', 'MyScripts');
        assert.ok(result.includes('<title>MyTitle</title>'));
        assert.ok(result.includes('MyStyle'));
        assert.ok(result.includes('class="MyClass"'));
        assert.ok(result.includes('MyHTML'));
        assert.ok(result.includes('MyScripts'));
    });
});
