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
  ProposedFeatures,
  TextDocumentChangeEvent,
  TextDocumentPositionParams,
  TextDocuments,
  TextDocumentSyncKind,
  TextEdit,
} from 'vscode-languageserver/node'

import { TextDocument } from 'vscode-languageserver-textdocument'
import { YQLsLanguageService } from './service'
import { YQLsDocumentation } from './documentation'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

const service = new YQLsLanguageService()
const documentation = new YQLsDocumentation()

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
  documentation.initializeName()
  connection.console.debug(`Documents names initialized...`)
  connection.console.debug(`Connection::onInitialized`)
})

connection.languages.diagnostics.on((request: DocumentDiagnosticParams) => {
  connection.console.debug(`Connection::languages::diagnostics::on ${request.textDocument.uri}`)
  return {
    kind: DocumentDiagnosticReportKind.Full,
    items: [],
  } satisfies DocumentDiagnosticReport
})

connection.onHover((request: HoverParams): Hover | undefined => {
  connection.console.debug(`Connection::onHover ${request.textDocument.uri}`)

  const uri = request.textDocument.uri
  const file = service.fileByUri(uri)

  const document = documents.get(uri)
  if (!document) {
    return undefined
  }

  const offset = document.offsetAt(request.position);
  const name = file.nameAt(offset)
  if (!name) {
    return undefined
  }

  const contents = documentation.findByName(name)
  if (!contents) {
    return undefined
  }

  return {
    contents: `${contents}`,
  }
})

connection.onCompletion((request: TextDocumentPositionParams): CompletionItem[] => {
  connection.console.debug(`Connection::onCompletion ${request.textDocument.uri}`)
  const uri = request.textDocument.uri
  const file = service.fileByUri(uri)
  return file.candidatesAt(request.position)
})

connection.onCompletionResolve((request: CompletionItem): CompletionItem => {
  connection.console.debug(`Connection::onCompletionResolve ${request.label}`)
  return request
})

connection.onDefinition((request: DefinitionParams): Definition | undefined => {
  connection.console.debug(
    `Connection::onDefinition `
    + `${request.textDocument.uri} `
    + `:${request.position.line.toString()}`
    + `:${request.position.character.toString()}`,
  )

  const uri = request.textDocument.uri
  const file = service.fileByUri(uri)

  const symbol = file.symbolAt(request.position)

  if (symbol) {
    return symbol.location
  }

  return undefined
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
  service.setTextToFile(e.document.uri, e.document.getText())
})

documents.onDidChangeContent((e: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.debug(`documents::onDidChangeContent ${e.document.uri}`)
  // service.fileByUri(e.document.uri).setText(e.document.getText())
  service.setTextToFile(e.document.uri, e.document.getText())
  // connection.console.debug(`Updated parse tree: ${service.fileByUri(e.document.uri).parseTree}`)
})

documents.onDidClose((e: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.debug(`documents::onDidClose ${e.document.uri}`)
  service.removeFileByUri(e.document.uri)
})

documents.listen(connection)
connection.listen()
