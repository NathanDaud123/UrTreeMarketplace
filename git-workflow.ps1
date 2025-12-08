# Git Workflow Script - Pull, Commit, Push
# Usage: .\git-workflow.ps1 "commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "🔄 Starting Git Workflow..." -ForegroundColor Cyan

# Step 1: Pull latest changes
Write-Host "`n📥 Step 1: Pulling latest changes..." -ForegroundColor Yellow
try {
    $pullResult = git pull origin main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Pull failed or has conflicts!" -ForegroundColor Red
        Write-Host $pullResult
        Write-Host "`n❌ Please resolve conflicts manually before continuing." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Pull successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during pull: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check for changes
Write-Host "`n📋 Step 2: Checking for changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️  No changes to commit." -ForegroundColor Yellow
    Write-Host "✅ Workflow complete!" -ForegroundColor Green
    exit 0
}

# Show what will be committed
Write-Host "`n📝 Changes to be committed:" -ForegroundColor Cyan
git status --short

# Step 3: Add all changes
Write-Host "`n➕ Step 3: Staging changes..." -ForegroundColor Yellow
try {
    git add -A
    Write-Host "✅ Changes staged!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error staging changes: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Commit
Write-Host "`n💾 Step 4: Committing changes..." -ForegroundColor Yellow
try {
    git commit -m $CommitMessage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Commit failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Commit successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during commit: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Push
Write-Host "`n📤 Step 5: Pushing to remote..." -ForegroundColor Yellow
try {
    $pushResult = git push origin main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Push failed!" -ForegroundColor Red
        Write-Host $pushResult
        exit 1
    }
    Write-Host "✅ Push successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during push: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Git workflow completed successfully!" -ForegroundColor Green

