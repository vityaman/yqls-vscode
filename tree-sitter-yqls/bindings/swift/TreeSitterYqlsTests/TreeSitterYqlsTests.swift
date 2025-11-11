import XCTest
import SwiftTreeSitter
import TreeSitterYqls

final class TreeSitterYqlsTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_yqls())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Yqls grammar")
    }
}
