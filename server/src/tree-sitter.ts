import { readFile } from 'fs/promises'
import { Parser, Language, Tree } from 'web-tree-sitter'

let parser: Parser | undefined

export async function initializeYQLsTreeSitter() {
  await Parser.init()

  const path = './tree-sitter-yqls.wasm'
  const wasmPath = require.resolve(path)
  const file = await readFile(wasmPath)
  const language = await Language.load(file)

  parser = new Parser()
  parser.setLanguage(language)
}

export class YQLsTreeSitter {
  parse(text: string): Tree {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return parser!.parse(text)!
  }
}
