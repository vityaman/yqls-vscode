package tree_sitter_yqls_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_yqls "github.com/tree-sitter/tree-sitter-yqls/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_yqls.Language())
	if language == nil {
		t.Errorf("Error loading Yqls grammar")
	}
}
