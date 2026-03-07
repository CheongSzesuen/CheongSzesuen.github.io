#!/usr/bin/env python3
"""Dim ANSI avatar palette indices in JSON payload."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def ansi256_to_rgb(index: int) -> tuple[int, int, int]:
  if index < 0 or index > 255:
    raise ValueError(f"Invalid ANSI index: {index}")

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


PALETTE = [ansi256_to_rgb(i) for i in range(256)]


def nearest_ansi_index(rgb: tuple[int, int, int]) -> int:
  r, g, b = rgb
  best_index = 0
  best_dist = 10**12
  for i, (pr, pg, pb) in enumerate(PALETTE):
    dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if dist < best_dist:
      best_dist = dist
      best_index = i
  return best_index


def luminance(rgb: tuple[int, int, int]) -> float:
  r, g, b = rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b


def dim_index(index: int, factor: float) -> int:
  r, g, b = PALETTE[index]
  dimmed = (
    max(0, min(255, round(r * factor))),
    max(0, min(255, round(g * factor))),
    max(0, min(255, round(b * factor))),
  )
  return nearest_ansi_index(dimmed)


def main() -> None:
  parser = argparse.ArgumentParser(description="Dim ANSI avatar JSON colors.")
  parser.add_argument("input", type=Path, help="Input avatar json")
  parser.add_argument(
    "-o",
    "--output",
    type=Path,
    default=None,
    help="Output avatar json (default: overwrite input)",
  )
  parser.add_argument(
    "-f",
    "--factor",
    type=float,
    default=0.82,
    help="Brightness factor. <1 darker, >1 brighter. Default: 0.82",
  )
  args = parser.parse_args()

  if args.factor <= 0:
    raise SystemExit("factor must be > 0")

  raw = json.loads(args.input.read_text(encoding="utf-8"))
  rows = raw.get("rows")
  if not isinstance(rows, list):
    raise SystemExit("Invalid input: rows missing")

  old_luma_total = 0.0
  old_count = 0
  new_luma_total = 0.0
  new_count = 0

  new_rows: list[list[int | None]] = []
  for row in rows:
    if not isinstance(row, list):
      continue
    out_row: list[int | None] = []
    for value in row:
      if value is None:
        out_row.append(None)
        continue
      if not isinstance(value, int):
        out_row.append(None)
        continue
      src_rgb = PALETTE[value]
      dst_index = dim_index(value, args.factor)
      dst_rgb = PALETTE[dst_index]
      out_row.append(dst_index)
      old_luma_total += luminance(src_rgb)
      new_luma_total += luminance(dst_rgb)
      old_count += 1
      new_count += 1
    new_rows.append(out_row)

  out_payload = {
    "width": raw.get("width"),
    "height": raw.get("height"),
    "rows": new_rows,
  }

  output = args.output or args.input
  output.write_text(json.dumps(out_payload, ensure_ascii=False), encoding="utf-8")

  old_avg = old_luma_total / old_count if old_count else 0
  new_avg = new_luma_total / new_count if new_count else 0
  print(f"factor: {args.factor}")
  print(f"avg luminance: {old_avg:.2f} -> {new_avg:.2f}")
  print(f"output: {output}")


if __name__ == "__main__":
  main()
