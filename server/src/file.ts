import callables from './asset/callables.json'
import types from './asset/types.json'
import udfs from './asset/udfs.json'
import freqs from './asset/frequencies.json'

import Parser from 'tree-sitter'
import { CompletionItem, CompletionItemKind, integer, Position } from 'vscode-languageserver'
import { YQLSSymbolTable } from './symbolTable'
import { formatClojure } from './format'

interface CursorPointsToListPosition {
  containining: Parser.SyntaxNode
  childrenToTheLeft: integer
  isInsideTheElement: boolean
  elementPastPosition: Parser.SyntaxNode
}

function less(left: Parser.Point, right: Parser.Point): boolean {
  if (left.row != right.row) {
    return left.row < right.row
  }
  return left.column < right.column
}

function isIndexAtWord(position: Parser.Point, node: Parser.SyntaxNode) {
  return less(node.startPosition, position) && less(position, { row: node.endPosition.row, column: node.endPosition.column + 1 })
}

interface Item {
  name: string
}

type Data = Record<string, Item[]>

type FrequenciesData = Record<string, number>

export class YQLsFile {
  #text: string
  parseTree: Parser.Tree
  #symbolTable: YQLSSymbolTable

  #callables = callables
  #types = types
  #udfs: string[]
  #freqs = new Map<string, number>(Object.entries(freqs as FrequenciesData))

  constructor(text: string, parseTree: Parser.Tree, uri: string) {
    this.#text = text
    this.parseTree = parseTree

    const data: Data = udfs as Data

    const result: string[] = Object.entries(data).flatMap(([category, items]) =>
      items.map(item => `'${category}.${item.name}`),
    )
    this.#udfs = result

    this.#symbolTable = new YQLSSymbolTable(uri)
    if (parseTree.rootNode) {
      this.#symbolTable.buildFromTree(parseTree)
    }
  }

  getText(): string {
    return this.#text
  }

  setText(text: string, parseTree: Parser.Tree) {
    this.#text = text
    this.parseTree = parseTree

    if (parseTree.rootNode) {
      this.#symbolTable.buildFromTree(parseTree)
    }
  }

  formatted(): string {
    console.log('formatted!!!')

    const result = formatClojure(this.#text)
    if (result.status != 'success') {
      return this.#text
    }

    return result.out
  }

  findNodeUnderPosition(position: Position): CursorPointsToListPosition {
    const treeWalker = this.parseTree.walk()
    let oldNode = treeWalker.currentNode
    for (; ;) {
      treeWalker.gotoFirstChildForPosition({ row: position.line, column: position.character })
      const newNode = treeWalker.currentNode
      const cond = newNode.type == oldNode.type
        && newNode.startPosition.row == oldNode.startPosition.row
        && newNode.startPosition.column == oldNode.startPosition.column
        && newNode.endPosition.row == oldNode.endPosition.row
        && newNode.endPosition.column == oldNode.endPosition.column
      if (cond) {
        break
      }
      oldNode = newNode
    }
    let containingList = oldNode
    let relativeIndex = -1
    let directSon = oldNode
    for (; ;) {
      const parent = containingList.parent
      if (parent?.type == 'list') {
        for (let i = 0; i < parent.childCount; ++i) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const child = parent.child(i)!
          if (child.startPosition.row == containingList.startPosition.row
            && child.startPosition.column == containingList.startPosition.column) {
            relativeIndex = i
            directSon = containingList
            containingList = parent
            break
          }
        }
        break
      }
      else if (parent != null) {
        containingList = parent
      }
    }
    const isInsideElement = isIndexAtWord({ row: position.line, column: position.character }, directSon)
    if (isInsideElement) {
      return {
        containining: containingList,
        childrenToTheLeft: relativeIndex - 1, // -1 to exclude the left brace
        isInsideTheElement: true,
        elementPastPosition: directSon,
      }
    }
    else {
      const prevSibling = directSon.previousSibling
      if (prevSibling != null && prevSibling.type != '(' && isIndexAtWord({ row: position.line, column: position.character }, prevSibling)) {
        return {
          containining: containingList,
          childrenToTheLeft: relativeIndex - 1 - 1, // -1 to exclude the left brace
          isInsideTheElement: true,
          elementPastPosition: prevSibling,
        }
      }
      else {
        return {
          containining: containingList,
          childrenToTheLeft: relativeIndex - 1, // -1 to exclude the left brace
          isInsideTheElement: false,
          elementPastPosition: directSon,
        }
      }
    }
  }

  numberToReverseOrderPreservingString(num: number): string {
    const maxValue = 999999
    const desiredLength = 6
    const invertedNum = maxValue - num
    return '$$$' + String(invertedNum).padStart(desiredLength, '0')
  }

  maxPriority = 99999

  candidatesAt(position: Position): CompletionItem[] {
    const localVars = this.#symbolTable.findVisibleSymbolsAt(position)
    const result: CompletionItem[] = [
      { kind: CompletionItemKind.Text, label: 'Text' },
    ]
    for (const s of localVars) {
      result.push({
        kind: CompletionItemKind.Variable,
        label: s.name,
        sortText: this.numberToReverseOrderPreservingString(this.maxPriority),
      })
    }
    const caretState = this.findNodeUnderPosition(position)

    if (caretState.childrenToTheLeft == 0) {
      for (const callable of this.#callables) {
        let priority = 0
        if (this.#freqs.has(callable.name)) {
          priority = this.#freqs.get(callable.name)!
        }
        result.push({
          kind: CompletionItemKind.Function,
          label: callable.name,
          sortText: this.numberToReverseOrderPreservingString(priority),
        })
      }
      for (const type of this.#types) {
        let priority = 0
        if (this.#freqs.has(type.name)) {
          priority = this.#freqs.get(type.name)!
        }
        result.push({ kind: CompletionItemKind.Class, label: type.name, sortText: this.numberToReverseOrderPreservingString(priority) })
      }
    }
    const isFirstUds = caretState.containining.child(1)?.text == 'Udf'
    if (caretState.childrenToTheLeft == 1 && isFirstUds) {
      for (const udf of this.#udfs) {
        result.push({ kind: CompletionItemKind.Function, label: udf })
      }
    }

    return result
  }

  nameAt(position: Position): string | undefined {
    const node = this.parseTree.rootNode.descendantForPosition({
      row: position.line,
      column: position.character,
    })
    if (node) {
      return node.text
    }

    return undefined
  }

  symbolAt(position: Position) {
    return this.#symbolTable.findSymbolAtPosition(position)
  }
}
