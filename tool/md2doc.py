#!/usr/bin/env python3

import sys
import json
import re


if __name__ == "__main__":
    lines = sys.stdin.readlines()

    functions = {}
    current_func = None
    current_docs = []

    func_header_pattern = re.compile(r"^###\s+([A-Za-z][A-Za-z0-9_]*)\s*$")

    for line in lines:
        line = line.rstrip("\n")

        match = func_header_pattern.match(line)
        if match:
            if current_func is not None:
                functions[current_func] = "\n".join(current_docs).strip()

            current_func = match.group(1)
            current_docs = []
        elif current_func is not None:
            current_docs.append(line)

    if current_func is not None:
        functions[current_func] = "\n".join(current_docs).strip()

    print(json.dumps(functions, ensure_ascii=False, indent=4))
