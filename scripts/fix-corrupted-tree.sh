#!/usr/bin/env bash
set -euo pipefail

# fix-corrupted-tree.sh
# Repairs a corrupted long-filename tree entry under src/data by rebuilding the tree
# and creating a new commit that replaces the corrupted tree entry.
#
# USAGE: run this from a local clone of the repository on the branch you want to fix (e.g., main):
#   chmod +x scripts/fix-corrupted-tree.sh
#   ./scripts/fix-corrupted-tree.sh
#
# WARNING: this script force-pushes a new commit to the current branch (origin).
# Make a backup branch first if you want: git branch backup-before-tree-fix

# Step 1: Get the blob hashes
COURSES_BLOB=$(git ls-tree HEAD src/data/ | grep "coursesData.ts" | awk '{print $3}')
DBDOCS_BLOB=$(git ls-tree HEAD src/data/ | grep -v "export const" | grep "dbDocsData.ts" | awk '{print $3}')

# Step 2: Create a clean src/data tree (removes the corrupted entry)
NEW_DATA_TREE=$(printf "100644 blob %s\tcoursesData.ts\n100644 blob %s\tdbDocsData.ts" \
  "$COURSES_BLOB" "$DBDOCS_BLOB" | git mktree)

# Step 3: Rebuild src/ tree with fixed data subtree
ROOT_TREE=$(git cat-file -p HEAD | grep tree | awk '{print $2}')
SRC_TREE=$(git cat-file -p $ROOT_TREE | grep "\tsrc$" | awk '{print $3}')
NEW_SRC_TREE=$(git cat-file -p $SRC_TREE | sed "s|\(040000 tree \)[^ ]*\(\tdata\)|\1${NEW_DATA_TREE}\2|" | git mktree)

# Step 4: Rebuild root tree
NEW_ROOT_TREE=$(git cat-file -p $ROOT_TREE | sed "s|\(040000 tree \)[^ ]*\(\tsrc\)|\1${NEW_SRC_TREE}\2|" | git mktree)

# Step 5: Create fix commit and force-push
NEW_COMMIT=$(git commit-tree $NEW_ROOT_TREE -p HEAD -m "fix: remove corrupted long-filename tree entry")
git push origin ${NEW_COMMIT}:refs/heads/$(git rev-parse --abbrev-ref HEAD) --force
