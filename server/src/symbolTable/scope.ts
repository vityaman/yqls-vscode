import { Range } from "vscode-languageserver";
import { ScopeType } from "./models/scopeType";

export interface Scope {
    type: ScopeType;
    parent?: Scope;
    symbols: Map<string, Symbol>;
    children: Scope[];
    range: Range;
}