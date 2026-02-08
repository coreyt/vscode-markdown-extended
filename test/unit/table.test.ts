import * as assert from 'assert';
import { MDTable, TableAlign } from '../../src/services/table/mdTable';
import { splitColumns } from '../../src/services/table/mdTableParse';
import * as csv from '../../src/services/table/csv';

suite('Table Utilities', () => {
    test('MDTable.parse parses alignments and header separator', () => {
        const source = [
            '| A | B |',
            '| :- | -: |',
            '| 1 | 2 |',
        ].join('\n');

        const table = MDTable.parse(source);
        assert.ok(table);
        assert.strictEqual(table?.columnCount, 2);
        assert.strictEqual(table?.rowCount, 2);
        assert.strictEqual(table?.headerRowCount, 1);
        assert.deepStrictEqual(table?.aligns, [TableAlign.left, TableAlign.right]);
    });

    test('MDTable.stringify emits compact table output', () => {
        const source = [
            '| A | B |',
            '| :- | -: |',
            '| 1 | 2 |',
        ].join('\n');

        const table = MDTable.parse(source);
        assert.ok(table);

        const output = table?.stringify(true);
        const expected = [
            '|A|B|',
            '|:-|-:|',
            '|1|2|',
        ].join('\n');

        assert.strictEqual(output, expected);
    });

    test('MDTable row/column operations update counts', () => {
        const table = new MDTable([
            ['a', 'b'],
            ['c', 'd'],
        ], 1);

        table.addRow(0, 1);
        assert.strictEqual(table.rowCount, 3);

        table.addColumn(1, 1);
        assert.strictEqual(table.columnCount, 3);

        table.deleteRow(0, 1);
        assert.strictEqual(table.rowCount, 2);

        table.deleteColumn(0, 1);
        assert.strictEqual(table.columnCount, 2);
    });

    test('splitColumns handles escaped pipes and code spans', () => {
        const line = '| a \\| b | `c | d` | e |';
        const cells = splitColumns(line);
        assert.deepStrictEqual(cells.map(c => c.trim()), ['', 'a \\| b', '`c | d`', 'e', '']);
    });

    test('csv parse/stringify round-trip basic data', () => {
        const source = [
            'a\tb',
            '1\t2',
        ].join('\n');

        const table = csv.parse(source);
        assert.ok(table);
        assert.strictEqual(table?.rowCount, 2);
        assert.strictEqual(table?.columnCount, 2);

        const output = csv.stringify(table as MDTable);
        assert.ok(output.includes('a\tb'));
        assert.ok(output.includes('1\t2'));
    });
});
