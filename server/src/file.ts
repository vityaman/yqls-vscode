import Parser from 'tree-sitter'
import { CompletionItem, CompletionItemKind, Position } from 'vscode-languageserver'
import { YQLSSymbolTable } from './symbolTable'

export class YQLsFile {
  #text: string
  parseTree: Parser.Tree
  #symbolTable: YQLSSymbolTable

  constructor(text: string, parseTree: Parser.Tree, uri: string) {
    this.#text = text
    this.parseTree = parseTree
    this.#symbolTable = new YQLSSymbolTable(uri)

    if (parseTree.rootNode) {
      this.#symbolTable.buildFromTree(parseTree)
    }
  }

  setText(text: string, parseTree: Parser.Tree) {
    this.#text = text
    this.parseTree = parseTree

    if (parseTree.rootNode) {
      this.#symbolTable.buildFromTree(parseTree)
    }

    console.log("Parse tree: ${this.parseTree}!")
    console.log(this.parseTree.rootNode.toString())
  }

  formatted(): string {
    return this.#text + ' (formatted)'
  }

  candidatesAt(position: Position): CompletionItem[] {
    void position
    return [
      { kind: CompletionItemKind.Text, label: 'Text' },
      { kind: CompletionItemKind.Method, label: 'Method' },
      { kind: CompletionItemKind.Function, label: 'Function' },
      { kind: CompletionItemKind.Constructor, label: 'Constructor' },
      { kind: CompletionItemKind.Field, label: 'Field' },
      { kind: CompletionItemKind.Variable, label: 'Variable' },
      { kind: CompletionItemKind.Class, label: 'Class' },
      { kind: CompletionItemKind.Interface, label: 'Interface' },
      { kind: CompletionItemKind.Module, label: 'Module' },
      { kind: CompletionItemKind.Property, label: 'Property' },
      { kind: CompletionItemKind.Unit, label: 'Unit' },
      { kind: CompletionItemKind.Value, label: 'Value' },
      { kind: CompletionItemKind.Enum, label: 'Enum' },
      { kind: CompletionItemKind.Keyword, label: 'Keyword' },
      { kind: CompletionItemKind.Snippet, label: 'Snippet' },
      { kind: CompletionItemKind.Color, label: 'Color' },
      { kind: CompletionItemKind.File, label: 'File' },
      { kind: CompletionItemKind.Reference, label: 'Reference' },
      { kind: CompletionItemKind.Folder, label: 'Folder' },
      { kind: CompletionItemKind.EnumMember, label: 'EnumMember' },
      { kind: CompletionItemKind.Constant, label: 'Constant' },
      { kind: CompletionItemKind.Struct, label: 'Struct' },
      { kind: CompletionItemKind.Event, label: 'Event' },
      { kind: CompletionItemKind.Operator, label: 'Operator' },
      { kind: CompletionItemKind.TypeParameter, label: 'TypeParameter' },
    ]
  }

  nameAt(position: Position): string | undefined {
    const node = this.parseTree.rootNode.descendantForPosition({
      row: position.line,
      column: position.character
    })

    if (node && node.type === 'identifier') {
      return node.text
    }

    return undefined
  }

  symbolAt(position: Position) {
    return this.#symbolTable.findSymbolAtPosition(position)
  }
}
