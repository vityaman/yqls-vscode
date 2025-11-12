export class YQLsDocumentation {
  #name2description: Map<string, string>

  constructor() {
    this.#name2description = new Map<string, string>
  }

  loadJson(): object {
    // TODO: load real json from ../assets/docs.json
    const sample_json = '{"let": "babanov", "ListType": "babanov ilya"}'
    return JSON.parse(sample_json);
  }

  initializeName() {
    const name_desc = this.loadJson()
    
    Object.entries(name_desc).forEach(([name, description]) => {
        this.#name2description.set(name, description);
    });
  }

  findByName(name: string): string | undefined {
    if (this.#name2description.has(name)) {
        return this.#name2description.get(name)
    }
    return name + " :(";
  }
}
