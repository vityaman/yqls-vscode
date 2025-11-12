export class SymbolCollector {
    collect(node: SyntaxNode): void {
        switch (node.type) {
            case 'declare_statement':
                this.handleDeclareStatement(node);
                break;
            case 'select_statement':
                this.handleSelectStatement(node);
                break;
        }
    }
}