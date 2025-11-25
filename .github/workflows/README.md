# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD.

## 📋 Available Workflows

### 1. Deploy (`deploy.yml`)
**Triggers:** Push to `main` branch or manual dispatch

**What it does:**
- Builds the application with API keys from GitHub Secrets
- Deploys to GitHub Pages
- Runs on every push to main

**Required Secrets:**
- `VITE_GROQ_API_KEY` (optional)
- `VITE_OPENROUTER_API_KEY` (optional)

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

See [GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md) for detailed instructions.

Quick steps:
1. Go to Repository Settings → Secrets and variables → Actions
2. Add `VITE_GROQ_API_KEY` and `VITE_OPENROUTER_API_KEY`
3. Workflows will automatically use them

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

