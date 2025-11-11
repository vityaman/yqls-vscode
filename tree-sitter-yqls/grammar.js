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
    /\s/, // whitespace; TODO add comments here
  ],
  rules: {
    source_file: $ => repeat($.list),

    list: $ => seq(
      '(',
      repeat($.element),
      ')'
    ),
    element: $ => choice(
      $.list,
      $.atom,
    ),
    atom: $ => $.string,
    string: $ => '"str"', // hardcoded value for now
  }
});
