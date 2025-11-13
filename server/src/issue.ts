import { DiagnosticSeverity, Position } from 'vscode-languageserver'

export interface YQLsIssue {
  position: Position
  severity: DiagnosticSeverity
  message: string
}

function getSeverity(severity: string): DiagnosticSeverity {
  switch (severity.toLowerCase()) {
    case 'error':
      return DiagnosticSeverity.Error
    case 'warning':
      return DiagnosticSeverity.Warning
    default:
      return DiagnosticSeverity.Information
  }
}

export function parseYQLsIssues(text: string): YQLsIssue[] {
  const issues: YQLsIssue[] = []

  const issueRegex = /<main>:(?<line>\d+):(?<character>\d+): (?<severity>error|warning): (?<message>.*)/gim

  let match
  while ((match = issueRegex.exec(text)) !== null) {
    if (match.groups) {
      const { line, character, severity, message } = match.groups

      const position: Position = {
        line: parseInt(line, 10) - 1,
        character: parseInt(character, 10) - 1,
      }

      const issue: YQLsIssue = {
        position,
        severity: getSeverity(severity),
        message: message.trim(),
      }

      issues.push(issue)
    }
  }

  return issues
}
