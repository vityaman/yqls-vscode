import { DocumentUri } from 'vscode-languageserver'
import { YQLsFile } from './file'
import { YQLsTreeSitter } from './tree-sitter'

export class YQLsLanguageService {
  #filesByUri: Map<DocumentUri, YQLsFile>
  #parser: YQLsTreeSitter
  constructor() {
    this.#filesByUri = new Map()
    this.#parser = new YQLsTreeSitter()
  }

  fileByUri(uri: DocumentUri): YQLsFile {
    if (!this.#filesByUri.has(uri)) {
      this.#filesByUri.set(uri, new YQLsFile("", this.#parser.parse("")))
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.#filesByUri.get(uri)!
  }

  removeFileByUri(uri: DocumentUri) {
    this.#filesByUri.delete(uri)
  }

  setTextToFile(uri: DocumentUri, text: string) {
    let file = this.fileByUri(uri)
    file.setText(text, this.#parser.parse(text))
  }
}
