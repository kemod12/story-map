# Quick Git Setup Script untuk GitHub Pages Deployment (Windows PowerShell)
# Usage: .\setup-github-pages.ps1

Write-Host "🚀 GitHub Pages Deployment Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Prompt for GitHub username and repo name
$github_user = Read-Host "📝 Enter your GitHub username"
$repo_name = Read-Host "📝 Enter your repository name (e.g., story-map)"

if ([string]::IsNullOrWhiteSpace($github_user) -or [string]::IsNullOrWhiteSpace($repo_name)) {
    Write-Host "❌ Username and repository name are required" -ForegroundColor Red
    exit 1
}

# Repository URL
$repo_url = "https://github.com/$github_user/$repo_name.git"
$live_url = "https://$github_user.github.io/$repo_name/"

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  GitHub Username: $github_user"
Write-Host "  Repository Name: $repo_name"
Write-Host "  Repository URL: $repo_url"
Write-Host "  Live URL: $live_url"
Write-Host ""

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "⚙️  Initializing Git repository..." -ForegroundColor Cyan
    git init
    git branch -M main
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Add/update remote
Write-Host "⚙️  Setting up remote repository..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $repo_url

# Stage all files
Write-Host "📦 Staging files..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Story Map PWA with offline support" --allow-empty

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/$github_user/$repo_name/settings/pages"
    Write-Host "  2. Enable GitHub Pages with 'GitHub Actions' source"
    Write-Host "  3. Wait for deployment (1-2 minutes)"
    Write-Host ""
    Write-Host "🎉 Your app will be live at: $live_url" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Tip: Every push to main branch triggers auto-deployment!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "   Check your internet and GitHub credentials"
    exit 1
}
