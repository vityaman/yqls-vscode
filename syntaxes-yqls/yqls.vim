if exists("b:current_syntax")
  finish
endif

syntax region yqlStringLiteralMultiline start="@@" skip="@@@@" end="@@"
syntax region yqlStringLiteralMultiline start="@@//js" skip="@@@@" end="@@"
syntax region yqlStringLiteralMultiline start="@@#py" skip="@@@@" end="@@"
syntax region yqlStringLiteralMultiline start="\"" skip="\\." end="\""
syn match yqlIdentifier "\v<([a-z_0-9][A-Za-z_\-0-9]*)>"
syn match yqlLiteral "\v('[A-Za-z_\-0-9]+)"
syn match yqlFunctionIdentifier "\v('"[A-Za-z_\-0-9]+\.[A-Za-z_\-0-9]+")"
syn match yqlFunctionIdentifier "\v('[A-Za-z_\-0-9]+\.[A-Za-z_\-0-9]+)"
syn match yqlFunctionIdentifier "\v([A-Z][A-Za-z_\-0-9]*)"
syn match yqlTypeIdentifier "\v<(pgpg_brin_minmax_multi_summary|pganycompatiblemultirange|pgpg_brin_bloom_summary|pganycompatiblenonarray|pganycompatiblerange|pganycompatiblearray|pgtable_am_handler|pglanguage_handler|pgindex_am_handler|pgpg_dependencies|_pgtstzmultirange|_pgint8multirange|_pgint4multirange|_pgdatemultirange|pgtstzmultirange|pgpg_ddl_command|pgint8multirange|pgint4multirange|pgdatemultirange|_pgtxid_snapshot|_pgregdictionary|_pgnummultirange|pgtxid_snapshot|pgregdictionary|pgnummultirange|pgevent_trigger|pganymultirange|pganycompatible|_pgtsmultirange|_pgregprocedure|_pgregnamespace|_pgregcollation|_pgpg_attribute|pgtsmultirange|pgregprocedure|pgregnamespace|pgregcollation|pgpg_node_tree|pgpg_ndistinct|pgpg_attribute|_pgtimestamptz|_pgregoperator|_pgpg_snapshot|pgtsm_handler|pgtimestamptz|pgregoperator|pgpg_snapshot|pgpg_mcv_list|pgfdw_handler|pganynonarray|_pgint2vector|TzTimestamp64|pgint2vector|pganyelement|_pgtstzrange|_pgtimestamp|_pgregconfig|_pgrefcursor|_pgoidvector|_pgint8range|_pgint4range|_pggtsvector|_pgdaterange|TzDatetime64|JsonDocument|pgtstzrange|pgtimestamp|pgregconfig|pgrefcursor|pgoidvector|pgint8range|pgint4range|pggtsvector|pgdaterange|_pgtsvector|_pgregclass|_pgpg_class|_pgnumrange|_pgmacaddr8|_pgjsonpath|_pginterval|TzTimestamp|Timestamp64|pgtsvector|pgregclass|pgpg_class|pgnumrange|pgmacaddr8|pgjsonpath|pginterval|pginternal|pganyrange|pganyarray|_pgvarchar|_pgtsrange|_pgtsquery|_pgregtype|_pgregrole|_pgregproc|_pgregoper|_pgpolygon|_pgpg_type|_pgpg_proc|_pgnumeric|_pgmacaddr|_pgcstring|_pgaclitem|TzDatetime|Interval64|Datetime64|pgvarchar|pgunknown|pgtsrange|pgtsquery|pgtrigger|pgregtype|pgregrole|pgregproc|pgregoper|pgpolygon|pgpg_type|pgpg_proc|pgnumeric|pgmacaddr|pgcstring|pganyenum|pgaclitem|_pgvarbit|_pgtimetz|_pgrecord|_pgpg_lsn|_pgfloat8|_pgfloat4|_pgcircle|_pgbpchar|Timestamp|EmptyList|EmptyDict|pgvarbit|pgtimetz|pgrecord|pgpg_lsn|pgfloat8|pgfloat4|pgcircle|pgbpchar|_pgpoint|_pgmoney|_pgjsonb|_pgbytea|TzDate32|Interval|DyNumber|Datetime|pgpoint|pgmoney|pgjsonb|pgbytea|_pgxid8|_pguuid|_pgtime|_pgtext|_pgpath|_pgname|_pglseg|_pgline|_pgjson|_pgint8|_pgint4|_pgint2|_pginet|_pgdate|_pgcidr|_pgchar|_pgbool|Generic|pgxid8|pgvoid|pguuid|pgtime|pgtext|pgpath|pgname|pglseg|pgline|pgjson|pgint8|pgint4|pgint2|pginet|pgdate|pgcidr|pgchar|pgbool|_pgxml|_pgxid|_pgtid|_pgoid|_pgcid|_pgbox|_pgbit|Uint64|Uint32|Uint16|TzDate|String|Double|Date32|pgxml|pgxid|pgtid|pgoid|pgcid|pgbox|pgbit|pgany|Uint8|Int64|Int32|Int16|Float|Yson|Void|Uuid|Utf8|Unit|Json|Int8|Date|Bool)>"
syn match yqlTypeIdentifier "\v<(DECIMAL)>"
syn match yqlTypeIdentifier "\v<(%([a-zA-Z_])%([a-zA-Z_0-9])*)(\<)@=>"
syn match yqlQuotedIdentifier "\v([A-Z][A-Za-z_\-0-9]*!)"
syn match yqlBindParameterIdentifier "\v<(world)>"
syn match yqlKeyword "\v<(set_package_version|override_library|package|library|declare|return|lambda|import|export|quote|block|let)>"
syn match yqlComment "\v(#.*)"

highlight default link yqlPunctuationMultiline Operator
highlight default link yqlPunctuation Operator
highlight default link yqlStringLiteralMultiline String
highlight default link yqlStringLiteral String
highlight default link yqlIdentifierMultiline Identifier
highlight default link yqlIdentifier Identifier
highlight default link yqlLiteralMultiline Number
highlight default link yqlLiteral Number
highlight default link yqlFunctionIdentifierMultiline Function
highlight default link yqlFunctionIdentifier Function
highlight default link yqlTypeIdentifierMultiline Type
highlight default link yqlTypeIdentifier Type
highlight default link yqlQuotedIdentifierMultiline Special
highlight default link yqlQuotedIdentifier Special
highlight default link yqlQuotedIdentifierMultiline Underlined
highlight default link yqlQuotedIdentifier Underlined
highlight default link yqlBindParameterIdentifierMultiline Define
highlight default link yqlBindParameterIdentifier Define
highlight default link yqlKeywordMultiline Keyword
highlight default link yqlKeyword Keyword
highlight default link yqlCommentMultiline Comment
highlight default link yqlComment Comment

let b:current_syntax = "yqls"
