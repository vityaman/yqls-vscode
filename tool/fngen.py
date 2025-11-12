#!/usr/bin/env python3

import json
from argparse import ArgumentParser
from typing import Any


def parse_args() -> Any:
    parser = ArgumentParser()
    parser.add_argument(
        "-t",
        "--types",
        help="Path to the types file",
        required=True,
    )
    parser.add_argument(
        "-f",
        "--frequencies",
        help="Path to the frequencies file",
        required=True,
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Path to the output file",
        required=True,
    )
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = parse_args()

    types = set(type["name"] for type in json.load(open(args.types, "r")))
    frequencies = json.load(open(args.frequencies, "r"))

    output: list[dict[str, Any]] = []
    for callable in frequencies:
        if callable in types:
            continue
        output.append({"name": callable})

    with open(args.output, "w") as f:
        json.dump(output, f, indent=4, sort_keys=True)
