import { DocumentUri } from 'vscode-languageserver'
import { YQLsFile } from './file'
import { YQLsTreeSitter } from './tree-sitter'
import Parser from 'tree-sitter'
import { assert } from 'console'

interface ExportNode {
  ident: string
  origNode: Parser.SyntaxNode
}

export class YQLsLanguageService {
  #filesByUri: Map<DocumentUri, YQLsFile>
  #parser: YQLsTreeSitter
  exportedSymbols: string[]
  constructor() {
    this.#filesByUri = new Map()
    this.#parser = new YQLsTreeSitter()
    this.exportedSymbols = []
  }

  fileByUri(uri: DocumentUri): YQLsFile {
    if (!this.#filesByUri.has(uri)) {
      this.#filesByUri.set(uri, new YQLsFile('', this.#parser.parse('')))
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.#filesByUri.get(uri)!
  }

  removeFileByUri(uri: DocumentUri) {
    this.#filesByUri.delete(uri)
  }

  unwrapElemAtomIdent(node: Parser.SyntaxNode): string | null {
    if (node.type != "element") {
      return null
    }
    let atom = node.child(0)
    if (atom == null || atom.type != "atom") {
      return null
    }
    let ident = atom.child(0)
    if (ident == null || ident.type != "ident") {
      return null
    }
    return ident.text
  }



  isExportNode(node: Parser.SyntaxNode): ExportNode | null {
    if (node.type != "list" || node.childCount != 4) {
      return null
    }
    let potentialExport = this.unwrapElemAtomIdent(node.child(1)!)
    let potentialSymbol = this.unwrapElemAtomIdent(node.child(2)!);
    if (potentialExport != null && potentialSymbol != null) {
      console.log(`export=${potentialExport} symbol = ${potentialSymbol}`)
    }
    return null
  }


  extractExportedSymbols(tree: Parser.Tree): ExportNode[] {
    let sourceFile = tree.rootNode
    let decls = sourceFile.child(0);
    if (decls == null) {
      return []
    }
    let result: ExportNode[] = []
    for (var elementDecl of decls.children) {
      if (elementDecl.type != "element")
        continue
      // we assume that at this level there are only lists as elements
      console.log(elementDecl.text)

      assert(elementDecl.childCount == 1)
      let listDecl = elementDecl.child(0)!
      let exportNode = this.isExportNode(listDecl)
      if (exportNode != null) {
        result.push(exportNode)
      }
    }
    return result
  }

  setTextToFile(uri: DocumentUri, text: string) {
<<<<<<< HEAD
    const file = this.fileByUri(uri)
    file.setText(text, this.#parser.parse(text))
=======
    let file = this.fileByUri(uri)
    let parseTree = this.#parser.parse(text)
    let exported = this.extractExportedSymbols(parseTree)
    void exported
    file.setText(text, parseTree)
>>>>>>> 32c6b0a (Autocomplete p1)
  }
}
