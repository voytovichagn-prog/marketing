#!/usr/bin/env bash
# Устанавливает Claude Code marketing skills из двух репо в .claude/skills/
# Запуск: bash scripts/install-skills.sh

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/.claude/skills"
TMP_DIR="$(mktemp -d -t marketing-skills.XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "→ Папка скилов: $SKILLS_DIR"
mkdir -p "$SKILLS_DIR"

echo "→ Клонирую ericosiu/ai-marketing-skills…"
git clone --depth=1 --quiet \
  https://github.com/ericosiu/ai-marketing-skills.git \
  "$TMP_DIR/ericosiu"

echo "→ Клонирую coreyhaines31/marketingskills…"
git clone --depth=1 --quiet \
  https://github.com/coreyhaines31/marketingskills.git \
  "$TMP_DIR/coreyhaines"

copy_skills() {
  local src="$1"
  local label="$2"
  if [ -d "$src" ]; then
    echo "→ Копирую скилы из $label ($(ls "$src" | wc -l | tr -d ' ') шт.)"
    # копируем содержимое, не перезатирая чужие папки одного и того же имени
    cp -R "$src/." "$SKILLS_DIR/"
  else
    echo "⚠️  В $label не найдена папка skills/, пропускаю"
  fi
}

copy_skills "$TMP_DIR/ericosiu/skills"   "ericosiu/ai-marketing-skills"
copy_skills "$TMP_DIR/coreyhaines/skills" "coreyhaines31/marketingskills"

echo
echo "✓ Готово. Установлено скилов: $(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
echo
echo "Список:"
find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort | sed 's/^/  · /'
echo
echo "Дальше: откройте проект в Claude Code и спросите «Какие маркетинговые скилы установлены?»"
