import Parser from 'tree-sitter'
import { CompletionItem, CompletionItemKind, Position} from 'vscode-languageserver'

export class YQLsFile {
  #text: string
  parseTree: Parser.Tree

  constructor(text: string, parseTree: Parser.Tree) {
    this.#text = text
    this.parseTree = parseTree
  }

  setText(text: string, parseTree: Parser.Tree) {
    this.#text = text
    this.parseTree = parseTree

    console.log('Parse tree: ${this.parseTree}!')
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

  nameAt(offset: number): string | undefined {
    let start = offset
    while (start > 0 && /\w/.test(this.#text[start - 1])) {
        start--
    }

    let end = offset
    while (end < this.#text.length && /\w/.test(this.#text[end])) {
        end++
    }

    return this.#text.substring(start, end);
  }
}
