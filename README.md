# CodeCraft CLI 🚀

> **AI Governance & Assistant CLI for Developers**
> Manage your project's architecture, planning, and code quality with an AI-powered CLI.

CodeCraft is a next-generation CLI that brings LLM-powered reasoning to your terminal. It acts as a Project Manager, Architect, and QA Lead, helping you build software faster and with higher quality.

## ✨ Features

- **Interactive REPL**: A "Claude Code" style interactive shell with persistent context.
- **Role-Based AI**: Switch between personas (PM, Architect, Backend/Frontend Developer, QA).
- **Slash Commands**: Trigger workflows effortlessly (`/plan`, `/code`, `/verify`, `/doctor`).
- **Scope Guard**: Prevents AI from modifying files outside the allowed scope.
- **Rule Engine**: Enforces project-specific architectural rules.

## 📦 Installation

```bash
npm install -g @gkganesh12/codecraft-cli
```

## 🚀 Quick Start

1. **Initialize CodeCraft** in your project:
   ```bash
   codecraft init
   ```

2. **Start the Interactive Mode**:
   ```bash
   codecraft
   ```
   You will see the `CodeCraft >` prompt.

3. **Try a Command**:
   ```text
   /plan "Create a user authentication API with JWT"
   ```

## 🛠️ Usage

### Interactive Commands (REPL)

| Command | Description |
| :--- | :--- |
| `/init` | Initialize CodeCraft in the current directory. |
| `/plan <task>` | Create a detailed implementation plan using the **Project Manager** persona. |
| `/architect` | Review the current plan against architecture rules using the **Architect** persona. |
| `/code` | Generate code based on the approved plan using **Developer** personas. |
| `/verify` | Analyze risks and suggest tests using the **QA** persona. |
| `/feature <desc>` | Draft a comprehensive Feature Specification. |
| `/adr <title>` | Create an Architecture Decision Record (ADR). |
| `/test <file>` | Generate unit tests for a specific file. |
| `/review <file>` | Perform an AI code review on a file. |
| `/explain <file>` | Explain complex code in plain English. |
| `/config` | Manage CLI settings (API keys, models, verbose mode). |
| `/doctor` | Check environment health and dependencies. |
| `/update` | Check for the latest version of CodeCraft. |

### CLI Flags

You can also run commands directly without entering the REPL:

```bash
# Run a specific command
codecraft doctor

# Run with verbose logging
codecraft --verbose plan "Refactor the database schema"

# Override the AI model for a session
codecraft --model gpt-4o code
```

## ⚙️ Configuration

CodeCraft stores its configuration in `~/.codecraft/config.json`. You can manage it via:

```bash
codecraft config
```

Supported settings:
- **API Key**: Your OpenAI or supported LLM provider key.
- **Model**: Default model to use (e.g., `gpt-4-turbo`, `gpt-4o`).
- **Verbose**: Enable detailed debug logs.

## 🤝 Contributing

Contributions are welcome! Please look at the `Docs/` folder for architectural guidelines.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

## 📄 License

MIT
