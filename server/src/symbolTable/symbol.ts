import { Location, SymbolKind } from "vscode-languageserver";
import { Scope } from "./scope";

export interface Symbol {
    name: string;
    kind: SymbolKind;
    type?: string;
    location: Location;
    scope: Scope;
    documentation?: string;
    references: Location[];
    isExported?: boolean;
}