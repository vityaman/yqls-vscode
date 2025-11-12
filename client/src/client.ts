import * as path from 'path'
import { ExtensionContext } from 'vscode'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node'

let client: LanguageClient | undefined = undefined

export function activate(context: ExtensionContext) {
  const module = context.asAbsolutePath(path.join('server', 'out', 'server.js'))

  const serverOptions: ServerOptions = {
    run: {
      module: module,
      transport: TransportKind.ipc,
    },
    debug: {
      module: module,
      transport: TransportKind.ipc,
    },
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        scheme: 'file',
        language: 'yqls',
      },
    ],
    initializationOptions: {
      assetsPath: context.extensionPath
    }
  }

  client = new LanguageClient(
    'languageServerYQLs',
    'YQLs LSP Server',
    serverOptions,
    clientOptions,
  )

  void client.start()
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined
  }

  return client.stop()
}
