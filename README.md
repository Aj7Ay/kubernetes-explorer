# 🚀 Kubernetes Adventure

An interactive learning platform for understanding Kubernetes concepts through hands-on visualizations.

[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-AI%20Code%20Review-blue)](https://www.coderabbit.ai)
[![CodeQL](https://github.com/Aj7Ay/kubernetes-explorer/actions/workflows/codeql.yml/badge.svg)](https://github.com/Aj7Ay/kubernetes-explorer/actions/workflows/codeql.yml)

## 🤖 AI Code Review

This project uses [CodeRabbit](https://www.coderabbit.ai/) for automated AI-powered code reviews. CodeRabbit is **completely free forever** for open-source projects (Pro plan included!) and provides:

- ✅ Automated code reviews on every pull request
- ✅ Line-by-line feedback with suggestions
- ✅ Security and quality checks
- ✅ PR summarization

See [CODERABBIT.md](./CODERABBIT.md) for setup instructions.

## 🛠️ Tech Stack

Built with React + TypeScript + Vite

## 🤖 Chatbot Integration

The Kubernetes Explorer includes an AI-powered chatbot that helps answer questions about Kubernetes concepts. The chatbot uses either OpenRouter or Groq APIs through a secure backend proxy.

### Setup

1. **Backend API**: The chatbot requires a backend API endpoint. Set up your own backend API that handles chat requests.

2. **Environment Variables** (Required): Create a `.env` file with your backend API URL:

3. **Using the Chatbot**: Click the chat icon in the bottom-right corner to open the chatbot. The chatbot uses the **Satoshi font** for a modern, clean interface.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
