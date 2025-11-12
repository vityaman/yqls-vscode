#!/bin/sh

set -e

cd "$(dirname "$0")" || exit 1

YDB_PATH="$1"
YQL_DATA_PATH="yql/essentials/data/language"
DST="../server/src/asset"

if [ ! -e "$YDB_PATH" ]; then
    echo "error: path does not exist: '$YDB_PATH'" >&2
    exit 1
fi

echo "YDB_PATH: $YDB_PATH"

cp "$YDB_PATH/$YQL_DATA_PATH/pragmas_opensource.json" "$DST/pragmas.json"
cp "$YDB_PATH/$YQL_DATA_PATH/types.json" "$DST/types.json"
cp "$YDB_PATH/$YQL_DATA_PATH/udfs_basic.json" "$DST/udfs.json"

echo "Yandex is downloaded."
