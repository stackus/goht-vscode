# Hamlet (Go+Haml)

This extension provides syntax highlighting for the Hamlet file from [Hamlet](https://github.com/stackus/hamlet). It also provides language server support for both Hamlet and Go.

## Features
- Syntax Highlighting
- Language Server Support for Hamlet and Go

## Requirements

### LSPs
**GoPls**: You should install the Go extension into VSCode which will install this LSP as well. You may also manually install it by running:

```bash
go install golang.org/x/tools/gopls@latest
```

**Hamlet**: You should install the latest version of [Hamlet](https://github.com/stackus/hamlet) which will include the LSP. You may manually install it by running:

```bash
go install github.com/stackus/hamlet/cmd/hamlet@latest
```

#### Note
Both LSPs must be in your PATH for this extension to work. You may need to include the `~/go/bin` directory in your PATH if it is not already there.

### Configuration
There is no required configuration for this extension. However, it does provide some settings to help with debugging problems.

## Known Issues
- Some syntax highlighting is not quite correct.
- Odd "textDocument/codeAction" error on startup from time to time.
