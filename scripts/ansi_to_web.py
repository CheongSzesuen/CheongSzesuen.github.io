#!/usr/bin/env python3
"""Convert ANSI 256-color blocks to web-friendly HTML/JSON."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ANSI_RE = re.compile(r"\x1b\[([0-9;]*)m")


def ansi256_to_rgb(index: int) -> tuple[int, int, int]:
  if index < 0 or index > 255:
    raise ValueError(f"Invalid ANSI 256 index: {index}")

  base16 = [
    (0, 0, 0),
    (128, 0, 0),
    (0, 128, 0),
    (128, 128, 0),
    (0, 0, 128),
    (128, 0, 128),
    (0, 128, 128),
    (192, 192, 192),
    (128, 128, 128),
    (255, 0, 0),
    (0, 255, 0),
    (255, 255, 0),
    (0, 0, 255),
    (255, 0, 255),
    (0, 255, 255),
    (255, 255, 255),
  ]
  if index < 16:
    return base16[index]

  if index <= 231:
    n = index - 16
    r = n // 36
    g = (n % 36) // 6
    b = n % 6
    steps = [0, 95, 135, 175, 215, 255]
    return (steps[r], steps[g], steps[b])

  gray = 8 + (index - 232) * 10
  return (gray, gray, gray)


def _apply_sgr(params: list[int], state: dict[str, int | None]) -> None:
  if not params:
    params = [0]

  i = 0
  while i < len(params):
    p = params[i]

    if p == 0:
      state["fg"] = None
      state["bg"] = None
      i += 1
      continue

    if p == 39:
      state["fg"] = None
      i += 1
      continue

    if p == 49:
      state["bg"] = None
      i += 1
      continue

    if p == 38 and i + 2 < len(params) and params[i + 1] == 5:
      state["fg"] = params[i + 2]
      i += 3
      continue

    if p == 48 and i + 2 < len(params) and params[i + 1] == 5:
      state["bg"] = params[i + 2]
      i += 3
      continue

    if 30 <= p <= 37:
      state["fg"] = p - 30
      i += 1
      continue

    if 90 <= p <= 97:
      state["fg"] = (p - 90) + 8
      i += 1
      continue

    if 40 <= p <= 47:
      state["bg"] = p - 40
      i += 1
      continue

    if 100 <= p <= 107:
      state["bg"] = (p - 100) + 8
      i += 1
      continue

    i += 1


def parse_ansi_lines(text: str) -> list[list[int | None]]:
  normalized = text.replace("␛", "\x1b")
  rows: list[list[int | None]] = []

  for raw_line in normalized.splitlines():
    state: dict[str, int | None] = {"fg": None, "bg": None}
    row: list[int | None] = []

    pos = 0
    for match in ANSI_RE.finditer(raw_line):
      chunk = raw_line[pos:match.start()]
      if chunk:
        color_index = state["bg"] if state["bg"] is not None else state["fg"]
        for ch in chunk:
          if ch == "\r":
            continue
          row.append(color_index)

      params_text = match.group(1).strip()
      params = [int(x) if x else 0 for x in params_text.split(";")] if params_text else [0]
      _apply_sgr(params, state)
      pos = match.end()

    tail = raw_line[pos:]
    if tail:
      color_index = state["bg"] if state["bg"] is not None else state["fg"]
      for ch in tail:
        if ch == "\r":
          continue
        row.append(color_index)

    if row:
      rows.append(row)

  return rows


def build_html(rows: list[list[int | None]], block_char: str) -> str:
  lines: list[str] = []
  for row in rows:
    parts: list[str] = []
    for color_index in row:
      if color_index is None:
        parts.append("<span style=\"color: transparent\">&nbsp;</span>")
        continue
      r, g, b = ansi256_to_rgb(color_index)
      parts.append(f"<span style=\"color: rgb({r}, {g}, {b})\">{block_char}</span>")
    lines.append("".join(parts))

  html = (
    "<!doctype html>\n"
    "<html lang=\"zh-CN\">\n"
    "<head>\n"
    "  <meta charset=\"UTF-8\" />\n"
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
    "  <title>ANSI Parse Result</title>\n"
    "  <style>\n"
    "    body { background: #0b0f17; color: #dbe4ff; margin: 0; padding: 16px; }\n"
    "    .art {\n"
    "      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;\n"
    "      line-height: 1;\n"
    "      letter-spacing: 0;\n"
    "      font-size: 10px;\n"
    "      white-space: pre;\n"
    "    }\n"
    "  </style>\n"
    "</head>\n"
    "<body>\n"
    "  <div class=\"art\">"
    + "<br/>\n".join(lines)
    + "</div>\n"
    "</body>\n"
    "</html>\n"
  )
  return html


def main() -> None:
  parser = argparse.ArgumentParser(description="Convert ANSI file to web HTML/JSON.")
  parser.add_argument("input", type=Path, help="Path to ANSI text file")
  parser.add_argument("--html-out", type=Path, default=Path("ansi-output.html"))
  parser.add_argument("--json-out", type=Path, default=Path("ansi-output.json"))
  parser.add_argument("--char", default="█", help="Character for HTML output")
  args = parser.parse_args()

  raw = args.input.read_text(encoding="utf-8")
  rows = parse_ansi_lines(raw)

  if not rows:
    raise SystemExit("No ANSI rows parsed from input.")

  width = max(len(row) for row in rows)
  height = len(rows)

  padded_rows: list[list[int | None]] = []
  for row in rows:
    if len(row) < width:
      row = row + [None] * (width - len(row))
    padded_rows.append(row)

  payload = {
    "width": width,
    "height": height,
    "rows": padded_rows,
  }
  args.json_out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
  args.html_out.write_text(build_html(padded_rows, args.char), encoding="utf-8")

  print(f"Parsed size: {width} x {height}")
  print(f"JSON -> {args.json_out}")
  print(f"HTML -> {args.html_out}")


if __name__ == "__main__":
  main()
