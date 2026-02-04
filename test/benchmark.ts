/**
 * Performance benchmarks for markdown-it plugins.
 * Run with: npm run benchmark
 *
 * Measures:
 * 1. Base markdown-it render time (no plugins)
 * 2. Each plugin's individual overhead
 * 3. All plugins combined
 * 4. TOC caching effectiveness
 */

import MarkdownIt from 'markdown-it';

// Sample documents of varying sizes
const SMALL_DOC = `
# Heading 1

This is a paragraph with **bold** and *italic* text.

## Heading 2

- List item 1
- List item 2

\`\`\`javascript
const x = 1;
\`\`\`
`;

const MEDIUM_DOC = Array(20).fill(SMALL_DOC).join('\n\n');

const LARGE_DOC = `
# Main Title

[[toc]]

${Array(50).fill(`
## Section Heading

This is a paragraph with **bold**, *italic*, ==marked==, ^super^, and ~sub~ text.

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

::: container
This is a container block with some content.
:::

!!! note
    This is an admonition.

- [ ] Task 1
- [x] Task 2

Here is a footnote[^1].

[^1]: Footnote content.

Some ++underlined++ and ~~strikethrough~~ text.

\`\`\`typescript
function example(): void {
    console.log("Hello");
}
\`\`\`
`).join('\n')}
`;

// Plugin configurations
const PLUGINS: Record<string, { pkg: string; args?: unknown[] }> = {
    'toc': { pkg: 'markdown-it-table-of-contents', args: [{ includeLevel: [1, 2, 3] }] },
    'multimd-table': { pkg: 'markdown-it-multimd-table', args: [{ multiline: true, rowspan: true }] },
    'container': { pkg: 'markdown-it-container', args: ['container'] },
    'footnote': { pkg: 'markdown-it-footnote' },
    'abbr': { pkg: 'markdown-it-abbr' },
    'sup': { pkg: 'markdown-it-sup' },
    'sub': { pkg: 'markdown-it-sub' },
    'checkbox': { pkg: 'markdown-it-checkbox' },
    'attrs': { pkg: 'markdown-it-attrs' },
    'kbd': { pkg: 'markdown-it-kbd' },
    'underline': { pkg: 'markdown-it-underline' },
    'mark': { pkg: 'markdown-it-mark' },
    'deflist': { pkg: 'markdown-it-deflist' },
    'html5-media': { pkg: 'markdown-it-html5-media' },
};

interface BenchmarkResult {
    name: string;
    iterations: number;
    totalMs: number;
    avgMs: number;
    minMs: number;
    maxMs: number;
    opsPerSec: number;
}

function benchmark(name: string, fn: () => void, iterations = 100): BenchmarkResult {
    // Warmup
    for (let i = 0; i < 5; i++) fn();

    const times: number[] = [];
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        const iterStart = performance.now();
        fn();
        times.push(performance.now() - iterStart);
    }

    const totalMs = performance.now() - start;
    const avgMs = totalMs / iterations;

    return {
        name,
        iterations,
        totalMs,
        avgMs,
        minMs: Math.min(...times),
        maxMs: Math.max(...times),
        opsPerSec: Math.round(1000 / avgMs),
    };
}

function formatResult(result: BenchmarkResult): string {
    return `${result.name.padEnd(25)} avg: ${result.avgMs.toFixed(3)}ms  min: ${result.minMs.toFixed(3)}ms  max: ${result.maxMs.toFixed(3)}ms  ops/s: ${result.opsPerSec}`;
}

async function runBenchmarks() {
    console.log('='.repeat(80));
    console.log('MARKDOWN-IT PLUGIN PERFORMANCE BENCHMARKS');
    console.log('='.repeat(80));

    const docs = [
        { name: 'Small (1 section)', content: SMALL_DOC },
        { name: 'Medium (20 sections)', content: MEDIUM_DOC },
        { name: 'Large (50 sections)', content: LARGE_DOC },
    ];

    for (const doc of docs) {
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`Document: ${doc.name} (${doc.content.length} chars)`);
        console.log('─'.repeat(80));

        // Baseline: no plugins
        const mdBase = new MarkdownIt();
        const baseResult = benchmark('Base (no plugins)', () => mdBase.render(doc.content));
        console.log(formatResult(baseResult));

        // Individual plugin overhead
        console.log('\nIndividual plugin overhead (sorted by impact):');
        const pluginResults: Array<{ name: string; overhead: number; result: BenchmarkResult }> = [];

        for (const [name, config] of Object.entries(PLUGINS)) {
            try {
                const md = new MarkdownIt();
                const plugin = require(config.pkg);
                const pluginFn = plugin.default || plugin.html5Media || plugin;

                if (config.args) {
                    md.use(pluginFn, ...config.args);
                } else {
                    md.use(pluginFn);
                }

                const result = benchmark(`+ ${name}`, () => md.render(doc.content));
                const overhead = result.avgMs - baseResult.avgMs;
                pluginResults.push({ name, overhead, result });
            } catch (e) {
                console.log(`  ${name}: FAILED - ${(e as Error).message}`);
            }
        }

        // Sort by overhead (highest first)
        pluginResults.sort((a, b) => b.overhead - a.overhead);

        for (const { name, overhead, result } of pluginResults) {
            const overheadStr = overhead >= 0 ? `+${overhead.toFixed(3)}ms` : `${overhead.toFixed(3)}ms`;
            console.log(`  ${formatResult(result)}  overhead: ${overheadStr}`);
        }

        // All plugins combined
        console.log('\nAll plugins combined:');
        const mdAll = new MarkdownIt();
        for (const [name, config] of Object.entries(PLUGINS)) {
            try {
                const plugin = require(config.pkg);
                const pluginFn = plugin.default || plugin.html5Media || plugin;
                if (config.args) {
                    mdAll.use(pluginFn, ...config.args);
                } else {
                    mdAll.use(pluginFn);
                }
            } catch (e) {
                // Skip failed plugins
            }
        }
        const allResult = benchmark('All plugins', () => mdAll.render(doc.content));
        const totalOverhead = allResult.avgMs - baseResult.avgMs;
        console.log(`  ${formatResult(allResult)}  total overhead: +${totalOverhead.toFixed(3)}ms`);
    }

    // TOC caching test
    console.log(`\n${'─'.repeat(80)}`);
    console.log('TOC CACHING EFFECTIVENESS');
    console.log('─'.repeat(80));

    const mdToc = new MarkdownIt();
    const tocPlugin = require('markdown-it-table-of-contents');
    mdToc.use(tocPlugin, { includeLevel: [1, 2, 3] });

    // Simulate editing: same headings, different content
    const baseDoc = '# Heading\n\n[[toc]]\n\n';
    const variations = Array(100).fill(null).map((_, i) =>
        baseDoc + `Paragraph content ${i} with some text that changes.\n\n## Subheading\n\nMore content ${i * 2}.`
    );

    console.log('\nRendering 100 variations (same headings, different content):');
    const tocStart = performance.now();
    for (const variation of variations) {
        mdToc.render(variation);
    }
    const tocTotal = performance.now() - tocStart;
    console.log(`  Total: ${tocTotal.toFixed(2)}ms  Avg per render: ${(tocTotal / 100).toFixed(3)}ms`);

    // Different headings each time
    const differentHeadings = Array(100).fill(null).map((_, i) =>
        `# Heading ${i}\n\n[[toc]]\n\n## Sub ${i}\n\nContent.`
    );

    console.log('\nRendering 100 documents (different headings each time):');
    const diffStart = performance.now();
    for (const doc of differentHeadings) {
        mdToc.render(doc);
    }
    const diffTotal = performance.now() - diffStart;
    console.log(`  Total: ${diffTotal.toFixed(2)}ms  Avg per render: ${(diffTotal / 100).toFixed(3)}ms`);

    console.log('\n' + '='.repeat(80));
    console.log('BENCHMARK COMPLETE');
    console.log('='.repeat(80));
}

// Run benchmarks
runBenchmarks().catch(console.error);
