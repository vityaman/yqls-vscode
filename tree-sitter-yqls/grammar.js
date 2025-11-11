/**
 * @file Yqls grammar for tree-sitter
 * @author vityaman
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check




module.exports = grammar({
  name: "yqls",
  extras: ($) => [
    /\s/,
    // $.comment
  ],
  rules: {
    source_file: $ => repeat($.list),

    list: $ => seq(
      '(',
      repeat($.element),
      ')'
    ),
    element: $ => choice(
      $.quotedatom,
      $.list,
      $.atom,
    ),
    quotedatom: $ => seq(
      '\'',
      choice($.list, $.atom)
    ),
    atom: $ => choice(
      $.ident,
      $.hexstring,
      $.string,
      $.multilinestring
    ),
    ident: $ => /[^ \t\n\r"#'()@]+/,
    string: $ => token(seq('"',
      repeat(/[^"\\]/),
      repeat(seq("\\",
        /./,
        repeat(/[^"\\]/))),
      '"')),
    multilinestring: $ => seq(
      "@@",
      repeat(/[^@]/),
      "@@",
    ),
    hexstring: $ => token(seq('x"',
      repeat(/[^"\\]/),
      repeat(seq("\\",
        /./,
        repeat(/[^"\\]/))),
      '"'))
  }
});
