import * as assert from 'assert';
import MarkdownIt from 'markdown-it';
import { performance } from 'perf_hooks';
import { MarkdownItContainer } from '../../src/plugin/markdownItContainer';
import { MarkdownItAdmonition } from '../../src/plugin/markdownItAdmonition';
import { MarkdownItAnchorLink } from '../../src/plugin/markdownItAnchorLink';

const markdownItToc = require('markdown-it-table-of-contents');
const multimdTable = require('markdown-it-multimd-table');
const markdownItFootnote = require('markdown-it-footnote');
const markdownItAbbr = require('markdown-it-abbr');
const markdownItSup = require('markdown-it-sup');
const markdownItSub = require('markdown-it-sub');
const markdownItCheckbox = require('markdown-it-checkbox');
const markdownItAttrs = require('markdown-it-attrs2/full');
const markdownItKbd = require('markdown-it-kbd');
const markdownItUnderline = require('markdown-it-underline');
const markdownItMark = require('markdown-it-mark');
const markdownItDeflist = require('markdown-it-deflist');
const markdownItHtml5Media = require('markdown-it-html5-media');

const DOC = `
# Main Title

[[toc]]

${Array(30).fill(`
## Section Heading

This paragraph uses **bold**, *italic*, ==mark==, ^sup^ and ~sub~.

| Col A | Col B | Col C |
|-------|-------|-------|
| 1     | 2     | 3     |
| 4     | 5     | 6     |

::: container
content with [Anchor](#Section-Heading)
:::

!!! note "Heads up"
    Preview path performance test.

- [ ] task
- [x] done
`).join('\n')}
`;

function createPreviewMarkdownIt(includeExpensive: boolean): MarkdownIt {
    const md = new MarkdownIt();
    if (includeExpensive) {
        md.use(markdownItToc, { includeLevel: [1, 2, 3] });
        md.use(multimdTable, { multiline: true, rowspan: true, headerless: true });
    }
    md.use(MarkdownItContainer);
    md.use(MarkdownItAdmonition);
    md.use(MarkdownItAnchorLink);
    md.use(markdownItHtml5Media.html5Media || markdownItHtml5Media.default || markdownItHtml5Media);
    md.use(markdownItFootnote);
    md.use(markdownItAbbr);
    md.use(markdownItSup);
    md.use(markdownItSub);
    md.use(markdownItCheckbox);
    md.use(markdownItAttrs);
    md.use(markdownItKbd);
    md.use(markdownItUnderline);
    md.use(markdownItMark);
    md.use(markdownItDeflist);
    return md;
}

function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function renderMedianMs(md: MarkdownIt, content: string, iterations = 40): number {
    for (let i = 0; i < 8; i++) md.render(content);
    const samples: number[] = [];
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        md.render(content);
        samples.push(performance.now() - start);
    }
    return median(samples);
}

function runRounds(includeExpensive: boolean, rounds: number, iterations: number): number[] {
    const md = createPreviewMarkdownIt(includeExpensive);
    const results: number[] = [];
    for (let i = 0; i < rounds; i++) {
        results.push(renderMedianMs(md, DOC, iterations));
    }
    return results;
}

suite('Markdown Preview Performance', function () {
    this.retries(2);

    test('full preview pipeline stays under a reasonable median render budget', () => {
        const rounds = Number(process.env.PERF_ROUNDS ?? 5);
        const iterations = Number(process.env.PERF_ITERATIONS ?? 24);
        const budgetMs = Number(process.env.PERF_RENDER_MEDIAN_BUDGET_MS ?? 140);
        const medians = runRounds(true, rounds, iterations);
        const suiteMedian = median(medians);
        assert.ok(
            suiteMedian < budgetMs,
            `Expected suite median render < ${budgetMs}ms, got ${suiteMedian.toFixed(2)}ms from [${medians.map(v => v.toFixed(2)).join(', ')}]`,
        );
    });

    test('disabling expensive plugins provides measurable speedup', () => {
        const rounds = Number(process.env.PERF_ROUNDS ?? 5);
        const iterations = Number(process.env.PERF_ITERATIONS ?? 24);
        const minFasterRuns = Number(process.env.PERF_MIN_FASTER_RUNS ?? 4);
        const requiredMedianRatio = Number(process.env.PERF_REQUIRED_MEDIAN_RATIO ?? 0.92);
        const fullMedians = runRounds(true, rounds, iterations);
        const essentialMedians = runRounds(false, rounds, iterations);
        const fasterRuns = essentialMedians.filter((value, i) => value < fullMedians[i]).length;
        const ratios = essentialMedians.map((value, i) => value / fullMedians[i]);
        const medianRatio = median(ratios);

        assert.ok(
            fasterRuns >= minFasterRuns && medianRatio <= requiredMedianRatio,
            `Expected non-flaky speedup: fasterRuns=${fasterRuns}/${rounds}, medianRatio=${medianRatio.toFixed(3)} (threshold=${requiredMedianRatio}). full=[${fullMedians.map(v => v.toFixed(2)).join(', ')}], essential=[${essentialMedians.map(v => v.toFixed(2)).join(', ')}]`,
        );
    });
});
