import {
  CompletionItem,
  createConnection,
  Definition,
  DefinitionParams,
  DocumentDiagnosticParams,
  DocumentDiagnosticReport,
  DocumentDiagnosticReportKind,
  DocumentFormattingParams,
  Hover,
  HoverParams,
  InitializeParams,
  Location,
  ProposedFeatures,
  TextDocumentChangeEvent,
  TextDocumentPositionParams,
  TextDocuments,
  TextDocumentSyncKind,
  TextEdit,
} from 'vscode-languageserver/node'

import { Position, TextDocument } from 'vscode-languageserver-textdocument'
import { YQLsLanguageService } from './service'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)
const service = new YQLsLanguageService()

connection.onInitialize((params: InitializeParams) => {
  connection.console.debug('Connection::onInitialize ' + (params.processId?.toString() ?? ''))
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
      hoverProvider: true,
      completionProvider: {
        resolveProvider: true,
      },
      definitionProvider: true,
      documentFormattingProvider: true,
    },
  }
})

connection.onInitialized(() => {
  connection.console.debug(`Connection::onInitialized`)
})

connection.languages.diagnostics.on((request: DocumentDiagnosticParams) => {
  connection.console.debug(`Connection::languages::diagnostics::on ${request.textDocument.uri}`)
  return {
    kind: DocumentDiagnosticReportKind.Full,
    items: [],
  } satisfies DocumentDiagnosticReport
})

connection.onHover((request: HoverParams): Hover => {
  connection.console.debug(`Connection::onHover ${request.textDocument.uri}`)
  return {
    contents: request.textDocument.uri,
  }
})

connection.onCompletion((request: TextDocumentPositionParams): CompletionItem[] => {
  connection.console.debug(`Connection::onCompletion ${request.textDocument.uri}`)
  return []
})

connection.onCompletionResolve((request: CompletionItem): CompletionItem => {
  connection.console.debug(`Connection::onCompletionResolve ${request.label}`)
  return request
})

connection.onDefinition((request: DefinitionParams): Definition => {
  connection.console.debug(
    `Connection::onDefinition `
    + `${request.textDocument.uri} `
    + `:${request.position.line.toString()}`
    + `:${request.position.character.toString()}`,
  )

  return {
    uri: request.textDocument.uri,
    range: {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 0 },
    },
  } satisfies Location
})

connection.onDocumentFormatting((request: DocumentFormattingParams): TextEdit[] => {
  connection.console.debug(`Connection::onDocumentFormatting ${request.textDocument.uri}`)

  const uri = request.textDocument.uri
  const file = service.fileByUri(uri)
  const formatted = file.formatted()

  return [
    {
      range: {
        start: { line: 0, character: 0 },
        end: { line: Number.MAX_SAFE_INTEGER, character: 0 },
      },
      newText: formatted,
    },
  ]
})

documents.onDidOpen((e: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.debug(`documents::onDidOpen ${e.document.uri}`)
  service.fileByUri(e.document.uri).setText(e.document.getText())
})

documents.onDidChangeContent((e: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.debug(`documents::onDidChangeContent ${e.document.uri}`)
  service.fileByUri(e.document.uri).setText(e.document.getText())
})

documents.onDidClose((e: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.debug(`documents::onDidClose ${e.document.uri}`)
  service.removeFileByUri(e.document.uri)
})

documents.listen(connection)
connection.listen()
