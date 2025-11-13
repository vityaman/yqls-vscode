import TreeSitter from "web-tree-sitter";
import { Location } from 'vscode-languageserver';
import { Symbol } from '../symbol';
import { Scope } from '../scope';
import { SymbolKind } from '../models/symbolKind';

export class SymbolCollector {
    private currentScope: Scope;

    constructor(
        private documentUri: string,
        rootScope: Scope
    ) {
        this.currentScope = rootScope;
    }

    collect(node: TreeSitter.Node): void {
        if (node.type === 'list') {
            this.handleList(node);
        }

        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child) {
                this.collect(child);
            }
        }
    }

    private handleList(node: TreeSitter.Node): void {
        if (node.childCount < 2) {
            return;
        }

        const firstElement = this.getFirstElement(node);
        if (!firstElement) {
            return;
        }

        const firstIdent = this.getIdentFromElement(firstElement);
        if (!firstIdent) {
            return;
        }

        const command = firstIdent.text;

        if (command === 'declare' || command === 'let') {
            this.handleDeclaration(node, command);
        } else {
            this.handleIdentifierReferences(node);
        }
    }

    private handleDeclaration(node: TreeSitter.Node, command: string): void {
        const elements = this.getElements(node);
        if (elements.length < 2) {
            return;
        }

        const nameElement = elements[1];
        const nameIdent = this.getIdentFromElement(nameElement);

        if (!nameIdent) {
            return;
        }

        let typeInfo: string | undefined;
        if (elements.length > 2) {
            const typeElement = elements[2];
            typeInfo = this.extractTypeInfo(typeElement);
        }

        const symbol: Symbol = {
            name: nameIdent.text,
            kind: command === 'declare' ? SymbolKind.Variable : SymbolKind.Variable,
            type: typeInfo,
            location: this.nodeToLocation(nameIdent),
            scope: this.currentScope,
            references: []
        };

        this.currentScope.symbols.set(symbol.name, symbol);
    }

    private handleIdentifierReferences(node: TreeSitter.Node): void {
        const elements = this.getElements(node);

        for (const element of elements) {
            const ident = this.getIdentFromElement(element);
            if (ident) {
                const symbol = this.findSymbolInScope(ident.text, this.currentScope);
                if (symbol) {
                    const location = this.nodeToLocation(ident);
                    if (!this.isSameLocation(location, symbol.location)) {
                        symbol.references.push(location);
                    }
                }
            }
        }
    }

    private getFirstElement(listNode: TreeSitter.Node): TreeSitter.Node | null {
        for (let i = 0; i < listNode.childCount; i++) {
            const child = listNode.child(i);
            if (child && child.type === 'element') {
                return child;
            }
        }
        return null;
    }

    private getElements(listNode: TreeSitter.Node): TreeSitter.Node[] {
        const elements: TreeSitter.Node[] = [];
        for (let i = 0; i < listNode.childCount; i++) {
            const child = listNode.child(i);
            if (child && child.type === 'element') {
                elements.push(child);
            }
        }
        return elements;
    }

    private getIdentFromElement(elementNode: TreeSitter.Node): TreeSitter.Node | null {
        for (let i = 0; i < elementNode.childCount; i++) {
            const child = elementNode.child(i);
            if (!child) continue;

            if (child.type === 'atom') {
                for (let j = 0; j < child.childCount; j++) {
                    const atomChild = child.child(j);
                    if (atomChild && atomChild.type === 'ident') {
                        return atomChild;
                    }
                }
            } else if (child.type === 'ident') {
                return child;
            }
        }
        return null;
    }

    private extractTypeInfo(typeElement: TreeSitter.Node): string | undefined {
        const text = typeElement.text;
        return text;
    }

    private findSymbolInScope(name: string, scope: Scope): Symbol | undefined {
        const symbol = scope.symbols.get(name);
        if (symbol) {
            return symbol;
        }

        if (scope.parent) {
            return this.findSymbolInScope(name, scope.parent);
        }

        return undefined;
    }

    private isSameLocation(loc1: Location, loc2: Location): boolean {
        return loc1.uri === loc2.uri &&
            loc1.range.start.line === loc2.range.start.line &&
            loc1.range.start.character === loc2.range.start.character &&
            loc1.range.end.line === loc2.range.end.line &&
            loc1.range.end.character === loc2.range.end.character;
    }

    private nodeToLocation(node: TreeSitter.Node): Location {
        return {
            uri: this.documentUri,
            range: {
                start: {
                    line: node.startPosition.row,
                    character: node.startPosition.column
                },
                end: {
                    line: node.endPosition.row,
                    character: node.endPosition.column
                }
            }
        };
    }
}
