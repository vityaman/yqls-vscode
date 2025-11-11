export class YQLsLanguageService {
  contentByUri: Map<string, string>

  constructor() {
    this.contentByUri = new Map()
  }
}
