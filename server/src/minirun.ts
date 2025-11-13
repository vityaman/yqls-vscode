import { spawnSync } from 'child_process'
import { parseYQLsIssues, YQLsIssue } from './issue'
import { DiagnosticSeverity } from 'vscode-languageserver'

export interface YQLsMinirunResult {
  issues: YQLsIssue[]
}

function fatal(message: string): YQLsMinirunResult {
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

export class YQLsMinirun {
  readonly #path: string
  readonly #udfs?: string

  constructor(path: string, udfs?: string) {
    this.#path = path
    this.#udfs = udfs
  }

  execute(text: string): YQLsMinirunResult {
    try {
      const args = []
      args.push('--langver', '2025.04')
      if (this.#udfs) {
        args.push('--udfs-dir', this.#udfs)
      }
      args.push('--print-result')
      args.push('-p', '-')

      const result = spawnSync(this.#path, args, {
        input: text,
      })

      if (result.error) {
        return fatal(`${result.error.name}: ${result.error.message}`)
      }

      console.log('Minirun STDOUT:')
      console.log(result.stdout.toString())

      console.log('Minirun STDERR')
      const stderr = result.stderr.toString()
      console.log(stderr)

      if (stderr.includes('xception)')) {
        return fatal(stderr)
      }

      return {
        issues: parseYQLsIssues(result.stderr.toString()),
      }
    }
    catch (error: unknown) {
      let message = 'Unknown error'
      if (error instanceof Error) {
        message = `${error.name}: ${error.message}`
      }

      return fatal(message)
    }
  }
}
