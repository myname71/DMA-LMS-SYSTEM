#!/usr/bin/env bash
set -euo pipefail

# scripts/fix-corrupted-tree-safe.sh
# Safer repair script for corrupted long-filename tree entry under src/data.
# Features:
# - Validates working tree is clean
# - Verifies required blobs exist
# - Creates a backup branch before modifying history
# - Prints a dry-run summary
# - Requires explicit confirmation to proceed (or use --yes)
# - Force-pushes the new commit to the current branch (origin)

# USAGE:
#   chmod +x scripts/fix-corrupted-tree-safe.sh
#   ./scripts/fix-corrupted-tree-safe.sh      # prompts before making changes
#   ./scripts/fix-corrupted-tree-safe.sh --yes  # run non-interactively

set -o pipefail
SCRIPT_NAME="$(basename "$0")"

confirm() {
  if [[ "${AUTO_YES:-false}" == "true" ]]; then
    return 0
  fi
  read -r -p "$* [y/N]: " ans
  case "$ans" in
    [Yy]|[Yy][Ee][Ss]) return 0 ;; 
    *) return 1 ;;
  esac
}

usage() {
  cat <<EOF
Usage: $SCRIPT_NAME [--yes]

Options:
  --yes    don't prompt, proceed automatically (use with care)

This script rebuilds the git trees to remove a corrupted long-filename entry under src/data
and creates a new commit which is then force-pushed to the current branch on origin.
A backup branch is created first.

EOF
}

# Parse args
for arg in "$@"; do
  case "$arg" in
    --yes) AUTO_YES=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $arg"; usage; exit 1 ;;
  esac
done

# Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: this script must be run from inside a git repository." >&2
  exit 2
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ -z "$BRANCH" ]]; then
  echo "Error: could not determine current branch." >&2
  exit 2
fi

# Ensure working tree is clean
if ! git diff-index --quiet HEAD --; then
  echo "Error: working tree is not clean. Commit or stash changes before running this script." >&2
  git status --porcelain
  exit 3
fi

# Check required files exist in src/data as blobs in the current commit
# Look for the blob SHAs for the expected files
COURSES_BLOB=$(git ls-tree HEAD src/data/ | grep "coursesData.ts" | awk '{print $3}' || true)
DBDOCS_BLOB=$(git ls-tree HEAD src/data/ | grep -v "export const" | grep "dbDocsData.ts" | awk '{print $3}' || true)

if [[ -z "$COURSES_BLOB" || -z "$DBDOCS_BLOB" ]]; then
  echo "Error: required blobs not found in src/data. Found:" >&2
  git ls-tree HEAD src/data/ || true
  exit 4
fi

# Show dry-run summary
echo "Current branch: $BRANCH"
echo "Creating backup branch: backup-before-tree-fix-$(date +%s)"
echo "Found blobs:" 
echo "  coursesData.ts -> $COURSES_BLOB"
echo "  dbDocsData.ts  -> $DBDOCS_BLOB"

echo
echo "Current src/data tree entries (git ls-tree HEAD src/data/):"
git ls-tree HEAD src/data/ || true

echo
if ! confirm "Proceed with creating backup branch and rebuilding trees?"; then
  echo "Aborted by user.";
  exit 0
fi

# Create backup branch
BACKUP_BRANCH="backup-before-tree-fix-$(date +%s)"
git branch "$BACKUP_BRANCH" HEAD
echo "Created backup branch: $BACKUP_BRANCH"

# Build new data tree with only the known good blobs
NEW_DATA_TREE=$(printf "100644 blob %s\tcoursesData.ts\n100644 blob %s\tdbDocsData.ts" \
  "$COURSES_BLOB" "$DBDOCS_BLOB" | git mktree)
if [[ -z "$NEW_DATA_TREE" ]]; then
  echo "Error: git mktree failed to create new data tree." >&2
  exit 5
fi

echo "New src/data tree: $NEW_DATA_TREE"

# Get the root commit tree and the src tree object
ROOT_TREE=$(git rev-parse HEAD^{tree})
if [[ -z "$ROOT_TREE" ]]; then
  echo "Error: could not get root tree." >&2
  exit 6
fi

SRC_TREE=$(git ls-tree "$ROOT_TREE" src | awk '{print $3}' || true)
if [[ -z "$SRC_TREE" ]]; then
  echo "Error: could not find src tree under root tree." >&2
  exit 7
fi

# Rebuild the src tree by replacing the data subtree
# Read src tree entries and replace the data entry's SHA with NEW_DATA_TREE
SRC_ENTRIES=$(git ls-tree "$SRC_TREE")
if ! echo "$SRC_ENTRIES" | grep -q "\bdata\$"; then
  echo "Warning: src tree does not contain a data entry; continuing anyway."
fi

NEW_SRC_CONTENT=$(echo "$SRC_ENTRIES" | awk -v newdata="$NEW_DATA_TREE" 'BEGIN{OFS="\t"} {
  # output mode, type, sha, name
  mode=$1; type=$2; sha=$3; name=$4;
  if (name=="data") sha=newdata;
  print mode, type, sha, name;
}')

# git mktree expects the format like: "100644 blob <sha>\t<name>\n"
# Convert the above to the proper printf'd lines
NEW_SRC_TREE=$(echo "$NEW_SRC_CONTENT" | awk '{printf "%s %s %s\t%s\n", $1, $2, $3, $4}' | git mktree)
if [[ -z "$NEW_SRC_TREE" ]]; then
  echo "Error: git mktree failed to create new src tree." >&2
  exit 8
fi

echo "New src tree: $NEW_SRC_TREE"

# Rebuild the root tree by replacing the src subtree
ROOT_ENTRIES=$(git ls-tree "$ROOT_TREE")
NEW_ROOT_CONTENT=$(echo "$ROOT_ENTRIES" | awk -v newsrc="$NEW_SRC_TREE" 'BEGIN{OFS="\t"} {
  mode=$1; type=$2; sha=$3; name=$4;
  if (name=="src") sha=newsrc;
  print mode, type, sha, name;
}')

NEW_ROOT_TREE=$(echo "$NEW_ROOT_CONTENT" | awk '{printf "%s %s %s\t%s\n", $1, $2, $3, $4}' | git mktree)
if [[ -z "$NEW_ROOT_TREE" ]]; then
  echo "Error: git mktree failed to create new root tree." >&2
  exit 9
fi

echo "New root tree: $NEW_ROOT_TREE"

if ! confirm "About to create a new commit replacing history on branch $BRANCH and force-push. Proceed?"; then
  echo "Aborted by user (before commit).";
  exit 0
fi

# Create commit and force-push to origin
NEW_COMMIT=$(git commit-tree "$NEW_ROOT_TREE" -p HEAD -m "fix: remove corrupted long-filename tree entry")
if [[ -z "$NEW_COMMIT" ]]; then
  echo "Error: failed to create new commit." >&2
  exit 10
fi

echo "Created new commit: $NEW_COMMIT"

git push origin ${NEW_COMMIT}:refs/heads/$BRANCH --force

if [[ $? -ne 0 ]]; then
  echo "Error: git push failed." >&2
  exit 11
fi

echo "Force-pushed new commit to origin/$BRANCH"

echo "Done. If anything went wrong, you can restore the previous state from branch: $BACKUP_BRANCH"
