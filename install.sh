#!/bin/bash
# install.sh — Symlink skills and global CLAUDE.md to ~/.claude/
# Run once after cloning. Re-run only when adding new skills.
# Edits to project files take effect immediately (symlinks, not copies).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills"

echo "Installing infrastructure-skills from $SCRIPT_DIR"

# Ensure ~/.claude/skills/ exists
mkdir -p "$SKILLS_DIR"

# Symlink global CLAUDE.md
if [ -f "$CLAUDE_DIR/CLAUDE.md" ] && [ ! -L "$CLAUDE_DIR/CLAUDE.md" ]; then
    echo "  Backing up existing ~/.claude/CLAUDE.md to ~/.claude/CLAUDE.md.bak"
    mv "$CLAUDE_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md.bak"
fi
ln -sfn "$SCRIPT_DIR/global/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
echo "  Linked ~/.claude/CLAUDE.md"

# Symlink each skill directory
for skill_dir in "$SCRIPT_DIR"/skills/*/; do
    skill_name="$(basename "$skill_dir")"
    target="$SKILLS_DIR/$skill_name"

    # Remove existing (file, dir, or broken symlink)
    if [ -e "$target" ] || [ -L "$target" ]; then
        rm -rf "$target"
    fi

    ln -sfn "$skill_dir" "$target"
    echo "  Linked ~/.claude/skills/$skill_name"
done

echo ""
echo "Done. $(ls -d "$SKILLS_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ') skills installed."
echo "Edits in $SCRIPT_DIR/skills/ are immediately available globally."
