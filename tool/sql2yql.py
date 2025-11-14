#!/usr/bin/env python3

import subprocess
import os
import re
from argparse import ArgumentParser
from typing import Any, Iterable
from collections import Counter
from itertools import chain
import json


def parse_args() -> Any:
    parser = ArgumentParser()
    parser.add_argument(
        "-p",
        "--path",
        help="Path to the ydb-platform/ydb repository clone.",
        required=True,
    )
    args = parser.parse_args()
    return args


def ya_path(ydb_path: str) -> str:
    return os.path.join(ydb_path, "ya")


def sql2yql_dir_path(ydb_path: str) -> str:
    return os.path.join(ydb_path, "yql/essentials/tools/sql2yql")


def sql2yql_path(ydb_path: str) -> str:
    return os.path.join(sql2yql_dir_path(ydb_path), "sql2yql")


def minirun_dir_path(ydb_path: str) -> str:
    return os.path.join(ydb_path, "yql/essentials/tools/minirun")


def minirun_path(ydb_path: str) -> str:
    return os.path.join(minirun_dir_path(ydb_path), "minirun")


def yql_sql_suites_path(ydb_path: str) -> str:
    return os.path.join(ydb_path, "yql/essentials/tests/sql/suites")


def yql_sexpr_suites_path(ydb_path: str) -> str:
    return os.path.join(ydb_path, "yql/essentials/tests/s-expressions/suites")


def yt_yql_sql_suites_path(ydb_path: str) -> str:
    return os.path.join(ydb_path, "yt/yql/tests/sql/suites")


walked_folders: int = 0
walked_files: int = 0


def walk(path: str) -> Iterable[str]:
    global walked_folders, walked_files
    frequency: int = 20

    for root, _, files in os.walk(path):
        walked_folders += 1
        for file in files:
            walked_files += 1

            if walked_files % frequency == 0:
                print(f"Walked {walked_files} files, {walked_folders} folders")

            full_path = os.path.join(root, file)
            yield full_path

    print(f"Walked {walked_files} files, {walked_folders} folders")


def yql_cases(path: str) -> Iterable[str]:
    return (file for file in walk(path) if file.endswith(".yql"))


def yqls_cases(path: str) -> Iterable[str]:
    return (file for file in walk(path) if file.endswith(".yqls"))


def all_sql_cases(ydb_path: str) -> Iterable[str]:
    return chain(
        yql_cases(yql_sql_suites_path(ydb_path)),
        yql_cases(yt_yql_sql_suites_path(ydb_path)),
    )


def all_yqls_cases(ydb_path: str) -> Iterable[str]:
    return yqls_cases(yql_sexpr_suites_path(ydb_path))


sql2yql_failures = 0


def all_yqls_texts(ydb_path: str) -> Iterable[str]:
    global sql2yql_failures

    for case in all_sql_cases(ydb_path):
        try:
            yield sql2yql(case)
        except Exception:
            sql2yql_failures += 1
            continue
    for case in all_yqls_cases(ydb_path):
        with open(case, "r") as f:
            yield f.read()


minirun_failures = 0


def all_callable_names(ydb_path: str) -> Iterable[str]:
    global minirun_failures

    for text in all_yqls_texts(ydb_path):
        try:
            minirun_text = minirun(text)
        except Exception:
            minirun_failures += 1
            minirun_text = None

        texts = [text]
        if minirun_text is not None:
            texts.append(minirun_text)

        for text in texts:
            for name in chain(callables(text)):
                yield name

    print("Failures:")
    print(f"  sql2yql: {sql2yql_failures}")
    print(f"  minirun: {minirun_failures}")

regex_callable = re.compile(r"(?<=[^\()']\()[A-Z][A-Za-z0-9]+!?")


def callables(text: str) -> Iterable[str]:
    for match in regex_callable.finditer(text):
        yield match.group()


def build(ydb_path: str):
    print("Building sql2yql...")
    subprocess.run(
        [ya_path(ydb_path), "make", "-r", sql2yql_dir_path(ydb_path)],
        check=True,
    )

    print("Building minirun...")
    subprocess.run(
        [ya_path(ydb_path), "make", "-r", minirun_dir_path(ydb_path)],
        check=True,
    )


def sql2yql(path: str) -> str:
    cmd = [
        sql2yql_path(ydb_path),
        "--yql",
        "--langver",
        "2025.04",
        path,
    ]
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True,
    )
    return str(result.stdout)


def minirun(text: str) -> str:
    cmd = [
        minirun_path(ydb_path),
        "--langver",
        "2025.04",
        "--print-expr",
        "-p",
        "-",
    ]
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True,
        input=text,
    )
    return str(result.stdout)


if __name__ == "__main__":
    args = parse_args()
    ydb_path = args.path

    print(f"{ydb_path = }")
    print(f"{ya_path(ydb_path) = }")
    print(f"{sql2yql_dir_path(ydb_path) = }")
    print(f"{minirun_dir_path(ydb_path) = }")

    build(ydb_path)

    frequencies = Counter(all_callable_names(ydb_path))
    print(json.dumps(dict(frequencies), indent=4, sort_keys=True))
