# GoHT for VSCode

![GoHT](goht_header.png)

This extension provides IDE features and syntax highlighting for the .goht extension from [GoHT](https://github.com/stackus/goht). It also provides language server support for both GoHT and Go.

## Features
- Syntax Highlighting
- Language Server Support for GoHT and Go

## Requirements

### LSPs
**GoPls**: You should install the Go extension into VSCode which will install this LSP as well. You may also manually install it by running:

```bash
go install golang.org/x/tools/gopls@latest
```

**GoHT**: You should install the latest version of [GoHT](https://github.com/stackus/goht) which will include the LSP. You may manually install it by running:

```bash
go install github.com/stackus/goht/cmd/goht@latest
```

#### Note
Both LSPs must be in your PATH for this extension to work. You may need to include the `~/go/bin` directory in your PATH if it is not already there.

### Configuration
There is no required configuration for this extension. However, it does provide some settings to help with debugging problems.

## Known Issues
- Some syntax highlighting is not quite correct.
- Odd "textDocument/codeAction" error on startup from time to time.
