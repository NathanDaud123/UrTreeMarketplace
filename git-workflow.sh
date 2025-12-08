#!/bin/bash
# Git Workflow Script - Pull, Commit, Push
# Usage: ./git-workflow.sh "commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Commit message is required"
    echo "Usage: ./git-workflow.sh \"commit message\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo "🔄 Starting Git Workflow..."

# Step 1: Pull latest changes
echo ""
echo "📥 Step 1: Pulling latest changes..."
if ! git pull origin main; then
    echo "❌ Pull failed or has conflicts!"
    echo "Please resolve conflicts manually before continuing."
    exit 1
fi
echo "✅ Pull successful!"

# Step 2: Check for changes
echo ""
echo "📋 Step 2: Checking for changes..."
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to commit."
    echo "✅ Workflow complete!"
    exit 0
fi

# Show what will be committed
echo ""
echo "📝 Changes to be committed:"
git status --short

# Step 3: Add all changes
echo ""
echo "➕ Step 3: Staging changes..."
git add -A
echo "✅ Changes staged!"

# Step 4: Commit
echo ""
echo "💾 Step 4: Committing changes..."
if ! git commit -m "$COMMIT_MESSAGE"; then
    echo "❌ Commit failed!"
    exit 1
fi
echo "✅ Commit successful!"

# Step 5: Push
echo ""
echo "📤 Step 5: Pushing to remote..."
if ! git push origin main; then
    echo "❌ Push failed!"
    exit 1
fi
echo "✅ Push successful!"

echo ""
echo "🎉 Git workflow completed successfully!"

