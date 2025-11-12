import callables from './asset/docs.json'

export class YQLsDocumentation {
  #name2description: Map<string, string>

  constructor() {
    this.#name2description = new Map<string, string>()
  }

  loadJson(): object {
    return callables
  }

  initializeName() {
    const name_desc = this.loadJson()

    Object.entries(name_desc).forEach(([name, description]) => {
      this.#name2description.set(name, description as string)
    })
  }

  findByName(name: string): string | undefined {
    if (this.#name2description.has(name)) {
      return this.#name2description.get(name)
    }

    return undefined
  }
}
