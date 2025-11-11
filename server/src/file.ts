import { Position } from 'vscode-languageserver'

export class YQLsFile {
  #text: string

  constructor() {
    this.#text = ''
  }

  setText(text: string) {
    this.#text = text
  }

  formatted(): string {
    return this.#text + ' (formatted)'
  }

  nameAt(position: Position): string | undefined {
    const line = position.line.toString()
    const character = position.character.toString()
    return `StubNameAtLine${line}Char${character}`
  }
}
