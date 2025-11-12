import { Position } from "vscode-languageserver";
import { Scope } from "../scope";

export class YQLSSymbolTable {
    private globalScope: Scope;

    buildFromTree(tree: Tree): void;
    findSymbol(name: string, position: Position): Symbol | undefined;
    getAllSymbols(): Symbol[];
}
