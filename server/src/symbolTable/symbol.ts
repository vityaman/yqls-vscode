import { Location } from "vscode-languageserver";
import { Scope } from "./scope";
import { SymbolKind } from "./models/symbolKind";

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