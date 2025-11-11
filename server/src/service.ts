import { DocumentUri } from 'vscode-languageserver'
import { YQLsFile } from './file'

export class YQLsLanguageService {
  #filesByUri: Map<string, YQLsFile>

  constructor() {
    this.#filesByUri = new Map()
  }

  fileByUri(uri: DocumentUri): YQLsFile {
    if (!this.#filesByUri.has(uri)) {
      this.#filesByUri.set(uri, new YQLsFile())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.#filesByUri.get(uri)!
  }

  removeFileByUri(uri: DocumentUri) {
    this.#filesByUri.delete(uri)
  }
}
