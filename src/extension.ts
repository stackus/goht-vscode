// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {CompletionItemKind} from 'vscode';
import {
    CloseAction,
    CloseHandlerResult,
    ErrorAction,
    ErrorHandlerResult,
    LanguageClient,
    LanguageClientOptions,
    ProvideCompletionItemsSignature,
    ServerOptions
} from "vscode-languageclient/node"
import {Message, ResponseError} from "vscode-languageclient";
import {LSPAny} from "vscode-languageserver-types";

type Config = {
    logFile: string;
    traceClient: boolean;
    traceGoPls: boolean;
    toArgs: () => string[];
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(_context: vscode.ExtensionContext) {
    try {
        const c = loadConfig();
        const lc = await newLanguageClient(c);
        await lc.start()
    } catch (err) {
        const msg = err && err as Error ? (err as Error).message : 'unknown'
        vscode.window.showErrorMessage(`error initializing goht LSP: ${msg}`);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
}

function loadConfig(): Config {
    const config = vscode.workspace.getConfiguration('goht');
    return {
        logFile: config.get('logFile', ''),
        traceClient: config.get('traceClient', false),
        traceGoPls: config.get('traceGoPls', false),
        toArgs() {
            const args: string[] = [];
            if (this.logFile != "") {
                args.push(`--logFile=${this.logFile}`);
            }
            if (this.traceClient) {
                args.push('--traceClient');
            }
            if (this.traceGoPls) {
                args.push('--traceGoPls');
            }
            // vscode.window.showInformationMessage(`Starting LSP: goht with ${args.join(' ')}`)
            return args;
        }
    } as Config;
}

// crashLimit is the number of times the language server is allowed
// to crash in a row before we stop restarting it.
const crashLimit = 10;

async function newLanguageClient(c: Config): Promise<LanguageClient> {
    const documentSelector = [
        {
            language: "goht",
            scheme: "file",
        }
    ]

    const serverOptions: ServerOptions = {
        command: "goht",
        args: ["lsp", ...c.toArgs()]
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector,
        uriConverters: {
            code2Protocol(uri: vscode.Uri): string {
                if (!uri.scheme) {
                    uri = uri.with({scheme: "file"})
                }
                return uri.toString();
            },
            protocol2Code(uri: string): vscode.Uri {
                return vscode.Uri.parse(uri)
            }
        },
        errorHandler: {
            error(error: Error, message: Message | undefined, count: number | undefined): ErrorHandlerResult | Promise<ErrorHandlerResult> {
                vscode.window.showErrorMessage(
                    `error communicating with the goht language server: ${error}: ${message}`
                )
                return {
                    action: (count || 0) < crashLimit ? ErrorAction.Continue : ErrorAction.Shutdown,
                }
            },
            closed(): CloseHandlerResult | Promise<CloseHandlerResult> {
                return {
                    action: CloseAction.DoNotRestart,
                }
            },
        },
        middleware: {
            async didOpen(doc: vscode.TextDocument, next: (doc: vscode.TextDocument) => Promise<void>): Promise<void> {
                return next(doc);
            },
            async didChange(doc: vscode.TextDocumentChangeEvent, next: (doc: vscode.TextDocumentChangeEvent) => Promise<void>): Promise<void> {
                return next(doc);
            },
            didClose(doc: vscode.TextDocument, next: (doc: vscode.TextDocument) => Promise<void>): Promise<void> {
                return next(doc);
            },
            didSave(doc: vscode.TextDocument, next: (doc: vscode.TextDocument) => Promise<void>): Promise<void> {
                return next(doc);
            },
            async provideCompletionItem(
                document: vscode.TextDocument,
                position: vscode.Position,
                context: vscode.CompletionContext,
                token: vscode.CancellationToken,
                next: ProvideCompletionItemsSignature
            ): Promise<any> {
                const list: vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem> | null | undefined = await next(document, position, context, token);
                if (!list) {
                    return list;
                }

                const items: vscode.CompletionItem[] = Array.isArray(list) ? list : list.items;

                if (!Array.isArray(list) && list.isIncomplete && list.items.length > 1) {
                    let hcFilterText = items[0].filterText;
                    if (!hcFilterText) {
                        hcFilterText = items[0].label.toString();
                    }
                    for (const item of items) {
                        item.filterText = hcFilterText
                    }
                }

                const editorParamHintsEnabled = vscode.workspace.getConfiguration(
                    "editor.parameterHints",
                    document.uri,
                )["enabled"];

                const goParamHintsEnabled = vscode.workspace.getConfiguration(
                    "[go]", document.uri
                )["editor.parameterHints.enabled"];

                let paramHintsEnabled: boolean = false;

                if (typeof goParamHintsEnabled === 'undefined') {
                    paramHintsEnabled = editorParamHintsEnabled;
                } else {
                    paramHintsEnabled = goParamHintsEnabled;
                }
                if (paramHintsEnabled) {
                    for (const item of items) {
                        if (item.kind === CompletionItemKind.Method || item.kind === CompletionItemKind.Function) {
                            item.command = {
                                title: "triggerParameterHints",
                                command: "editor.action.triggerParameterHints"
                            };
                        }
                    }
                }
                return list;
            },
            workspace: {
                async configuration(
                    params,
                    token,
                    next
                ): Promise<LSPAny[] | ResponseError<void>> {
                    const configs = next(params, token);
                    if (!configs || !Array.isArray(configs)) {
                        return configs;
                    }
                    const ret: LSPAny[] = [];
                    for (let i = 0; i < configs.length; i++) {
                        let wsConfig = configs[i];
                        ret.push(wsConfig)
                    }
                    return ret
                }
            }
        }
    };

    return new LanguageClient("goht", serverOptions, clientOptions, false);
}