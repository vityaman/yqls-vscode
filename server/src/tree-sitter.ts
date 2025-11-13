import TSParser from 'tree-sitter'
import Yqls from 'tree-sitter-yqls'

export class YQLsTreeSitter {
  #ts: TSParser

  constructor() {
    this.#ts = new TSParser()
    this.#ts.setLanguage(Yqls as TSParser.Language)
  }

  parse(text: string): TSParser.Tree {
    return this.#ts.parse(text)
  }
}
