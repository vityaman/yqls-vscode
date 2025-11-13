import { DiagnosticSeverity, DocumentUri } from 'vscode-languageserver'
import { YQLsFile } from './file'
import { YQLsTreeSitter } from './tree-sitter'
import TreeSitter from 'web-tree-sitter'
import { assert } from 'console'
import { YQLsIssue } from './issue'
import { YQLsConfig } from './config'
import { YQLsMinirun } from './minirun'

interface ExportNode {
  ident: string
  origNode: TreeSitter.Node
}

export class YQLsLanguageService {
  #filesByUri: Map<DocumentUri, YQLsFile>
  #parser: YQLsTreeSitter
  exportedSymbols: string[]
  #config: YQLsConfig

  constructor() {
    this.#filesByUri = new Map()
    this.#parser = new YQLsTreeSitter()
    this.exportedSymbols = []

    this.#config = {
      minirun: {
      },
      udf: {

      },
    }
  }

  fileByUri(uri: DocumentUri): YQLsFile {
    if (!this.#filesByUri.has(uri)) {
      this.#filesByUri.set(uri, new YQLsFile('', this.#parser.parse(''), uri))
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.#filesByUri.get(uri)!
  }

  removeFileByUri(uri: DocumentUri) {
    this.#filesByUri.delete(uri)
  }

  unwrapElemAtomIdent(node: TreeSitter.Node): string | null {
    if (node.type != 'element') {
      return null
    }
    const atom = node.child(0)
    if (atom?.type != 'atom') {
      return null
    }
    const ident = atom.child(0)
    if (ident?.type != 'ident') {
      return null
    }
    return ident.text
  }

  isExportNode(node: TreeSitter.Node): ExportNode | null {
    if (node.type != 'list' || node.childCount != 4) {
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const potentialExport = this.unwrapElemAtomIdent(node.child(1)!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const potentialSymbol = this.unwrapElemAtomIdent(node.child(2)!)
    if (potentialExport != null && potentialSymbol != null) {
      //   console.log(`export=${potentialExport} symbol = ${potentialSymbol}`)
    }
    return null
  }

  extractExportedSymbols(tree: TreeSitter.Tree): ExportNode[] {
    const sourceFile = tree.rootNode
    const decls = sourceFile.child(0)
    if (decls == null) {
      return []
    }
    const result: ExportNode[] = []
    for (const elementDecl of decls.children) {
      if (elementDecl?.type != 'element')
        continue
      // we assume that at this level there are only lists as elements
      //   console.log(elementDecl.text)

      assert(elementDecl.childCount == 1)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const listDecl = elementDecl.child(0)!
      const exportNode = this.isExportNode(listDecl)
      if (exportNode != null) {
        result.push(exportNode)
      }
    }
    return result
  }

  setTextToFile(uri: DocumentUri, text: string) {
    const file = this.fileByUri(uri)
    const parseTree = this.#parser.parse(text)
    const exported = this.extractExportedSymbols(parseTree)
    void exported
    file.setText(text, parseTree)
  }

  updateConfig(config: YQLsConfig) {
    this.#config = config
  }

  minirun(uri: DocumentUri): YQLsIssue[] {
    const path = this.#config.minirun.path
    if (!path) {
      return [
        {
          position: { line: 0, character: 0 },
          severity: DiagnosticSeverity.Information,
          message: 'Minirun path is not set',
        },
      ]
    }

    const file = this.fileByUri(uri)
    const text = file.getText()

    const minirun = new YQLsMinirun(path, this.#config.udf.path)
    return minirun.execute(text).issues
  }
}
