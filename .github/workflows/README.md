# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD.

## 📋 Available Workflows

### 1. Deploy (`deploy.yml`)
**Triggers:** Push to `main` branch or manual dispatch

**What it does:**
- Builds the application
- Deploys to GitHub Pages
- Runs on every push to main

### 2. CodeQL Analysis (`codeql.yml`)
**Triggers:** Push, PR, or weekly schedule

**What it does:**
- Scans code for security vulnerabilities
- Checks code quality
- Free for public repositories
- Runs CodeQL analysis

### 3. Code Quality Check (`code-quality.yml`)
**Triggers:** Push or PR

**What it does:**
- Runs ESLint
- Type checks TypeScript
- Verifies build succeeds
- Ensures code quality

### 4. CodeRabbit AI Code Review
**Triggers:** Automatically on pull requests

**What it does:**
- AI-powered code reviews
- Line-by-line feedback
- Security and quality checks
- PR summarization
- **Free for open-source projects!**

**Setup:** See [CODERABBIT.md](../../CODERABBIT.md) for installation instructions.

### 2. Release (`release.yml`)
**Triggers:** Push of version tag (e.g., `v1.0.0`)

**What it does:**
- Generates release notes from git commits
- Creates a GitHub release
- Updates changelog

**Usage:**
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 3. Release Notes (`release-notes.yml`)
**Triggers:** When a release is published

**What it does:**
- Auto-generates release notes using release-drafter
- Categorizes changes by labels

## 🔐 Setting Up Secrets

Quick steps:
1. Go to Repository Settings → Secrets and variables → Actions

## 🚀 Creating Releases

See [RELEASE_GUIDE.md](../RELEASE_GUIDE.md) for detailed instructions.

Quick steps:
1. Update `CHANGELOG.md`
2. Create a tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
3. Push tag: `git push origin v1.0.0`
4. Release workflow will create GitHub release automatically

## 📝 Workflow Files

- `deploy.yml` - Build and deploy to GitHub Pages
- `release.yml` - Create releases with notes
- `release-notes.yml` - Auto-generate release notes
- `release-drafter.yml` - Release notes template

