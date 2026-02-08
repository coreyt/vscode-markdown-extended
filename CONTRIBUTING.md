# Contributing to Markdown Extended

## Development Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Open in VS Code**:
    ```bash
    code .
    ```

## Running Tests

This project uses a modern testing infrastructure based on `@vscode/test-electron` and `Mocha`.

### Unit Tests
Fast tests that verify logic without launching VS Code.
```bash
npm test
```

### Integration Tests
Tests that run *inside* a VS Code instance to verify extension behavior.
```bash
npm run test:integration
```

**Known Issue:**
You may see an error `Activating extension 'jebbs.markdown-extended' failed: The "path" argument must be of type string...` in the test output. This is a known environment-specific issue with the `clipboardy` dependency in the headless test runner. However, the core logic tests (rendering plugins, etc.) still execute and verify functionality.

### Performance Tests
Benchmark the markdown rendering pipeline.
```bash
npm run test:perf
```

## Building

To build the extension `.vsix` package:
```bash
npm run vsix
```
