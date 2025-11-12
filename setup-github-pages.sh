#!/bin/bash
# Quick Git Setup Script untuk GitHub Pages Deployment
# Usage: bash setup-github-pages.sh

echo "🚀 GitHub Pages Deployment Setup"
echo "=================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git from https://git-scm.com/"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Prompt for GitHub username and repo name
read -p "📝 Enter your GitHub username: " github_user
read -p "📝 Enter your repository name (e.g., story-map): " repo_name

if [ -z "$github_user" ] || [ -z "$repo_name" ]; then
    echo "❌ Username and repository name are required"
    exit 1
fi

# Repository URL
repo_url="https://github.com/$github_user/$repo_name.git"
live_url="https://$github_user.github.io/$repo_name/"

echo ""
echo "📋 Configuration:"
echo "  GitHub Username: $github_user"
echo "  Repository Name: $repo_name"
echo "  Repository URL: $repo_url"
echo "  Live URL: $live_url"
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "⚙️  Initializing Git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already exists"
fi

# Add/update remote
echo "⚙️  Setting up remote repository..."
git remote remove origin 2>/dev/null || true
git remote add origin "$repo_url"

# Stage all files
echo "📦 Staging files..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Story Map PWA with offline support" --allow-empty

# Push to GitHub
echo "🚀 Pushing to GitHub (this will open browser for authentication if needed)..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Go to: https://github.com/$github_user/$repo_name/settings/pages"
    echo "  2. Enable GitHub Pages with 'GitHub Actions' source"
    echo "  3. Wait for deployment to complete (1-2 minutes)"
    echo ""
    echo "🎉 Your app will be live at: $live_url"
    echo ""
    echo "💡 Tip: Every time you push to main branch,"
    echo "   GitHub Actions will automatically deploy your app!"
else
    echo "❌ Failed to push to GitHub"
    echo "   Check your internet connection and GitHub credentials"
    exit 1
fi
