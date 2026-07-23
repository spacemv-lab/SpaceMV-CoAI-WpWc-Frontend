# Contributing Guide

Thank you for your interest in contributing to `SpaceMV-CoAI-WpWc-Frontend`.

## Before You Start

- Read [README.md](./README.md) for project background and setup steps.
- Read [LICENSE](./LICENSE) for the open source license.
- Read [CLA.md](./CLA.md) or [CLA_EN.md](./CLA_EN.md) before submitting code.
- Do not submit any real secrets, internal IP addresses, private endpoints, or production credentials.

## Development Setup

1. Install Node.js 16+ and npm.
2. Install dependencies:

```bash
npm install
```

3. Use example environment files as templates and fill your own local values only:

```bash
cp .env.example .env.local
```

4. Start development server:

```bash
npm run dev
```

## Branching

- Create feature branches from the latest default branch.
- Keep changes focused and small when possible.
- Rebase or merge the latest upstream changes before opening a pull request.

## Commit Message Convention

Use conventional commits:

```text
type(scope): short summary
```

Examples:

- `feat(content): add article template picker`
- `fix(editor): sanitize chart preview url`
- `docs(readme): clarify local setup`

Recommended types:

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`
- `style`

## Pull Request Checklist

Before opening a PR, please confirm:

- The code builds successfully.
- New or changed behavior has been self-tested.
- No secrets, internal domains, internal IP addresses, or real credentials are included.
- Documentation is updated when behavior or setup changes.
- Copyright notices in existing files are preserved.

## Security and Sensitive Information

Please never submit:

- Real API keys, tokens, passwords, or certificates
- Internal URLs, internal IP addresses, or test environment addresses
- Customer data, employee data, or other real business data

Use placeholder values such as:

- `https://api.example.com`
- `https://docs.example.com`
- `https://charts.example.com`

## Reporting Issues

Use the GitHub issue templates to report bugs or request features.

## Questions

If you are unsure whether a change is safe to open source, open an issue or discussion before submitting a PR.
