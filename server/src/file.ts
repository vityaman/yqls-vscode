import Parser from 'tree-sitter'
import { CompletionItem, CompletionItemKind, integer, Position } from 'vscode-languageserver'
import { YQLSSymbolTable } from './symbolTable'

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
  return left.column < right.column;
}

function isIndexAtWord(position: Parser.Point, node: Parser.SyntaxNode) {
  return less(node.startPosition, position) && less(position, { row: node.endPosition.row, column: node.endPosition.column + 1 })
}
import { CompletionItem, CompletionItemKind, Position} from 'vscode-languageserver'

export class YQLsFile {
  #text: string
  parseTree: Parser.Tree
  #symbolTable: YQLSSymbolTable

  constructor(text: string, parseTree: Parser.Tree, uri: string) {
    this.#text = text
    this.parseTree = parseTree
    this.#symbolTable = new YQLSSymbolTable(uri)

    if (parseTree.rootNode) {
      this.#symbolTable.buildFromTree(parseTree)
    }
  }

  setText(text: string, parseTree: Parser.Tree) {
    this.#text = text
    this.parseTree = parseTree

 if (parseTree.rootNode) {
      this.#symbolTable.buildFromTree(parseTree)
    }

    console.log("Parse tree: ${this.parseTree}!")
    console.log(this.parseTree.rootNode.toString())
  }

  formatted(): string {
    return this.#text + ' (formatted)'
  }

  findNodeUnderPosition(position: Position): CursorPointsToListPosition {
    let treeWalker = this.parseTree.walk()
    var oldNode = treeWalker.currentNode
    while (true) {
      treeWalker.gotoFirstChildForPosition({ row: position.line, column: position.character })
      let start = treeWalker.startPosition
      let end = treeWalker.endPosition
      console.log(`cur position: ${start.row + 1}:${start.column + 1} to ${end.row + 1}:${end.column + 1} `)
      var newNode = treeWalker.currentNode
      let cond = newNode.type == oldNode.type
        && newNode.startPosition.row == oldNode.startPosition.row
        && newNode.startPosition.column == oldNode.startPosition.column
        && newNode.endPosition.row == oldNode.endPosition.row
        && newNode.endPosition.column == oldNode.endPosition.column
      if (cond) {
        break
      }
      oldNode = newNode
    }
    var containingList = oldNode
    var relativeIndex = -1
    var directSon = oldNode
    while (true) {
      let parent = containingList.parent
      if (parent != null && parent.type == 'list') {
        for (var i = 0; i < parent.childCount; ++i) {
          let child = parent.child(i)!;
          if (child.startPosition.row == containingList.startPosition.row
            && child.startPosition.column == containingList.startPosition.column) {
            relativeIndex = i
            directSon = containingList
            containingList = parent
            break
          }
        }
        break
      } else if (parent != null) {
        containingList = parent
      }
    }
    let isInsideElement = isIndexAtWord({ row: position.line, column: position.character }, directSon)
    if (isInsideElement) {
      return {
        containining: containingList,
        childrenToTheLeft: relativeIndex - 1, // -1 to exclude the left brace
        isInsideTheElement: true,
        elementPastPosition: directSon
      }
    } else {
      let prevSibling = directSon.previousSibling;
      if (prevSibling != null && prevSibling.type != "(" && isIndexAtWord({ row: position.line, column: position.character }, prevSibling)) {
        return {
          containining: containingList,
          childrenToTheLeft: relativeIndex - 1 - 1, // -1 to exclude the left brace
          isInsideTheElement: true,
          elementPastPosition: prevSibling
        }
      } else {
        return {
          containining: containingList,
          childrenToTheLeft: relativeIndex - 1, // -1 to exclude the left brace
          isInsideTheElement: false,
          elementPastPosition: directSon
        }
      }
    }
  }

  #callables = [ "Apply", "NamedApply", "Udf", "Callable", "TypeOf", "DataType" ]
  #types = [ "Bool", "Data", "Date32", "pginternal", "pginterval", "Void"]

  candidatesAt(position: Position): CompletionItem[] {
    let caretState = this.findNodeUnderPosition(position)
    // console.log(`position:${position.line}:${position.character}\nmatchlist=${result.containining.text}\ndirectson=${result.elementPastPosition.text}\ndirectsonpos=${result.elementPastPosition.startPosition.row}:${result.elementPastPosition.startPosition.column}\nindex=${result.childrenToTheLeft}\nisInside${result.isInsideTheElement}`)
    let result: CompletionItem[] = [
      { kind: CompletionItemKind.Text, label: 'Text' },
    ]
    if (!caretState.isInsideTheElement && caretState.childrenToTheLeft == 0) {
      for (let callable of this.#callables) {
        result.push({ kind: CompletionItemKind.Function, label: callable })
      }
      for (let callable of this.#types) {
        result.push({ kind: CompletionItemKind.Class, label: callable })
      }
    }

    return result
  }

  nameAt(position: Position): string | undefined {
    const node = this.parseTree.rootNode.descendantForPosition({
      row: position.line,
      column: position.character
    })

    if (node && node.type === 'identifier') {
      return node.text
    }

    return undefined
  }

  symbolAt(position: Position) {
    return this.#symbolTable.findSymbolAtPosition(position)
  }
}
