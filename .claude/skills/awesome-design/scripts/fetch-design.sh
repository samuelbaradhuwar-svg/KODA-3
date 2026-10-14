#!/usr/bin/env bash
# Fetch one DESIGN.md from VoltAgent/awesome-design-md into a local cache and print its path.
# Usage: bash .claude/skills/awesome-design/scripts/fetch-design.sh <slug>
# Uses a sparse git checkout because raw.githubusercontent.com is blocked in some sandboxes.
set -euo pipefail

slug="${1:-}"
if [[ -z "$slug" || ! "$slug" =~ ^[a-z0-9.-]+$ ]]; then
  echo "usage: fetch-design.sh <slug>   (slug from the catalog in SKILL.md, e.g. stripe, linear.app)" >&2
  exit 2
fi

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cache="$root/.claude/cache/design-md"
out="$cache/$slug.md"
mkdir -p "$cache"

if [[ -s "$out" ]]; then
  echo "$out"
  exit 0
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git clone -q --depth 1 --filter=blob:none --sparse https://github.com/VoltAgent/awesome-design-md.git "$tmp/r"
git -C "$tmp/r" sparse-checkout set "design-md/$slug" >/dev/null 2>&1
src="$tmp/r/design-md/$slug/DESIGN.md"
if [[ ! -s "$src" ]]; then
  echo "No DESIGN.md for '$slug'. Check the slug against the catalog." >&2
  exit 1
fi
cp "$src" "$out"
echo "$out"
