import { Position, Location, Range } from 'vscode-languageserver';
import Parser from 'tree-sitter';
import { SymbolTable } from '../symbolTable';
import { Symbol } from '../symbol';
import { Scope } from '../scope';
import { ScopeType } from '../models/scopeType';
import { SymbolCollector } from './symbolCollector';

function compare(lhs: Position, rhs: Position): boolean {
  if (lhs.line < rhs.line) {
    return true
  }
  if (rhs.line < lhs.line) {
    return false;
  }
  return lhs.character < rhs.character;
}

export class YQLSSymbolTable implements SymbolTable {
  private globalScope: Scope;
  private documentUri: string;

  constructor(documentUri: string) {
    this.documentUri = documentUri;
    this.globalScope = {
      type: ScopeType.Global,
      symbols: new Map(),
      children: [],
      range: {
        start: { line: 0, character: 0 },
        end: { line: Infinity, character: Infinity }
      }
    };
  }

  findVisibleSymbolsAt(position: Position): Symbol[] {
    let result: Symbol[] = []
    for (let x of this.globalScope.symbols.values()) {
      if (compare(x.location.range.end, position)) {
        result.push(x)
      }
    }
    return result
  }

  buildFromTree(tree: Parser.Tree): void {
    this.globalScope.symbols.clear();
    this.globalScope.children = [];

    const collector = new SymbolCollector(this.documentUri, this.globalScope);
    collector.collect(tree.rootNode);
  }

  addSymbol(symbol: Symbol): void {
    this.globalScope.symbols.set(symbol.name, symbol);
  }

  findSymbol(name: string, scope?: Scope): Symbol | undefined {
    const searchScope = scope || this.globalScope;
    return this.resolveSymbol(name, searchScope);
  }

  findSymbolAtPosition(position: Position): Symbol | undefined {
    const scope = this.findScopeAtPosition(position, this.globalScope);

    for (const [, symbol] of scope.symbols) {
      if (this.isPositionInRange(position, symbol.location.range)) {
        return symbol;
      }
    }

    let currentScope: Scope | undefined = scope;
    while (currentScope) {
      for (const [, symbol] of currentScope.symbols) {
        for (const ref of symbol.references) {
          if (this.isPositionInRange(position, ref.range)) {
            return symbol;
          }
        }
      }
      currentScope = currentScope.parent;
    }

    return undefined;
  }

  enterScope(scopeType: ScopeType): void {
    const newScope: Scope = {
      type: scopeType,
      parent: this.globalScope,
      symbols: new Map(),
      children: [],
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      }
    };
    this.globalScope.children.push(newScope);
  }

  exitScope(): void {}

  getCurrentScope(): Scope {
    return this.globalScope;
  }

  getAllSymbolsInScope(scope?: Scope): Symbol[] {
    const symbols: Symbol[] = [];
    const searchScope = scope || this.globalScope;
    this.collectSymbolsFromScope(searchScope, symbols);
    return symbols;
  }

  getReferences(symbol: Symbol): Location[] {
    return symbol.references;
  }

  updateDocument(uri: string, content: string): void {
    void content
    this.documentUri = uri;
  }

  clear(): void {
    this.globalScope.symbols.clear();
    this.globalScope.children = [];
  }

  private resolveSymbol(name: string, scope: Scope): Symbol | undefined {
    const symbol = scope.symbols.get(name);
    if (symbol) return symbol;

    if (scope.parent) {
      return this.resolveSymbol(name, scope.parent);
    }

    return undefined;
  }

  private findScopeAtPosition(position: Position, scope: Scope): Scope {
    for (const child of scope.children) {
      if (this.isPositionInRange(position, child.range)) {
        return this.findScopeAtPosition(position, child);
      }
    }
    return scope;
  }

  private isPositionInRange(position: Position, range: Range): boolean {
    if (position.line < range.start.line || position.line > range.end.line) {
      return false;
    }
    if (position.line === range.start.line && position.character < range.start.character) {
      return false;
    }
    if (position.line === range.end.line && position.character > range.end.character) {
      return false;
    }
    return true;
  }

  private collectSymbolsFromScope(scope: Scope, result: Symbol[]): void {
    scope.symbols.forEach(symbol => result.push(symbol));
    scope.children.forEach(child => this.collectSymbolsFromScope(child, result));
  }
}
