#!/usr/bin/env bash
# Copies this kit into your Herdr app home (default ~/.config/herdr-app).
# Never overwrites a file that exists unless you pass --force. Example config files are
# copied only when missing. keys.json is not touched: merge examples/keys.json yourself.
set -euo pipefail

force=0
[[ "${1:-}" == "--force" ]] && force=1
src="$(cd "$(dirname "$0")" && pwd)"
dest="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"

if [[ ! -d "$dest" ]]; then
  echo "No Herdr app home at $dest. Start the Herdr app once, or set HERDR_APP_HOME." >&2
  exit 1
fi

copy() { # copy <relative path>
  local from="$src/$1" to="$dest/$1"
  mkdir -p "$(dirname "$to")"
  if [[ -e "$to" && $force -eq 0 ]]; then
    echo "  skip   $1 (exists; --force to replace)"
  else
    cp "$from" "$to"
    echo "  copied $1"
  fi
}

echo "Installing into $dest"

# Each mod's mod.json goes in BEFORE its main.js: a new mod folder seen without
# mod.json gets docked by Herdr as a 320px panel on the right.
for dir in "$src"/mods/*/; do
  m="$(basename "$dir")"
  copy "mods/$m/mod.json"
  for f in "$dir"*; do
    name="$(basename "$f")"
    [[ "$name" == "mod.json" || "$name" == "main.js" ]] && continue
    copy "mods/$m/$name"
  done
  copy "mods/$m/main.js"
done

copy "themes/catppuccin-macchiato.json"
copy "layouts/my-main.json"

for f in companies.json worktree-setup.toml; do
  if [[ -e "$dest/$f" ]]; then echo "  keep   $f"; else cp "$src/examples/$f" "$dest/$f"; echo "  copied $f (example: edit it)"; fi
done

cat <<EOF

Done. Next:
  1. Switch to the layout:   herdr-app do layout.switch --name my-main   (or ⌘⇧L)
  2. Merge examples/keys.json into $dest/keys.json (the "layout:my-main" section).
  3. Linear: copy examples/linear-config.json to $dest/linear.json, put your API key
     in it, chmod 600 it, and never commit it.
  4. Edit $dest/companies.json and worktree-setup.toml for your orgs and repos.
EOF
