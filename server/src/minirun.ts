import { spawnSync } from 'child_process'
import { parseYQLsIssues, YQLsIssue } from './issue'
import { DiagnosticSeverity } from 'vscode-languageserver'

export interface YQLsMinirunResult {
  issues: YQLsIssue[]
}

export class YQLsMinirun {
  readonly #path: string

  constructor(path: string) {
    this.#path = path
  }

  execute(text: string): YQLsMinirunResult {
    try {
      const args = ['--langver', '2025.04', '--print-result', '-p', '-']
      const result = spawnSync(this.#path, args, {
        input: text,
      })

      if (result.error) {
        return {
          issues: [
            {
              position: { line: 0, character: 0 },
              severity: DiagnosticSeverity.Error,
              message: `${result.error.name}: ${result.error.message}`,
            },
          ],
        }
      }

      console.log('Minirun STDOUT:')
      console.log(result.stdout.toString())

      console.log('Minirun STDERR')
      console.log(result.stderr.toString())

      return {
        issues: parseYQLsIssues(result.stderr.toString()),
      }
    }
    catch (error: unknown) {
      let message = 'Unknown error'
      if (error instanceof Error) {
        message = `${error.name}: ${error.message}`
      }

      return {
        issues: [
          {
            position: { line: 0, character: 0 },
            severity: DiagnosticSeverity.Error,
            message: message,
          },
        ],
      }
    }
  }
}
