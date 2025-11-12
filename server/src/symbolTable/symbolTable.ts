import { Location, Position } from 'vscode-languageserver';
import { ScopeType } from './models/scopeType';
import { Scope } from './scope';

export interface SymbolTable {
    addSymbol(symbol: Symbol): void;
    findSymbol(name: string, scope?: Scope): Symbol | undefined;
    findSymbolAtPosition(position: Position): Symbol | undefined;
    enterScope(scopeType: ScopeType): void;
    exitScope(): void;
    getCurrentScope(): Scope;
    getAllSymbolsInScope(scope?: Scope): Symbol[];
    getReferences(symbol: Symbol): Location[];
    updateDocument(uri: string, content: string): void;
    clear(): void;
}
