import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    const extensionDevelopmentPath = path.resolve(__dirname, '..');
    const extensionTestsPath = path.resolve(__dirname, '../out/test/index');

    await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

main().catch(error => {
    console.error('Failed to run extension tests');
    console.error(error);
    process.exit(1);
});
