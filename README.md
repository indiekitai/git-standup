# @indiekitai/git-standup

Git standup report generator — scan local repos and generate human-readable work summaries from `git log`.

**Zero dependencies.** Only uses `child_process` to call `git`.

## Install

```bash
npm install -g @indiekitai/git-standup
```

## CLI Usage

```bash
# Yesterday's commits in current directory
npx @indiekitai/git-standup

# Custom time range
npx @indiekitai/git-standup --since "2 days ago"
npx @indiekitai/git-standup --since "2024-01-01" --until "2024-01-31"

# Scan multiple repos in a directory
npx @indiekitai/git-standup --dir ~/projects

# Filter by author
npx @indiekitai/git-standup --author "sen"

# JSON output (agent-friendly)
npx @indiekitai/git-standup --json

# Markdown output
npx @indiekitai/git-standup --markdown
```

### Output Formats

**Text (default):**
```
Standup Report: 2024-01-15 → 2024-01-16
Total: 3 commit(s) across 2 repo(s)

📁 my-app (2)
  • feat: add login page (abc1234)
  • fix: correct validation (def4567)

📁 lib (1)
  • chore: update deps (ghi7890)
```

**JSON (`--json`):**
```json
{
  "since": "2024-01-15",
  "until": "2024-01-16",
  "author": null,
  "totalCommits": 3,
  "repos": [
    {
      "repo": "my-app",
      "path": "/home/user/my-app",
      "commits": [
        { "hash": "abc1234...", "author": "Sen", "date": "2024-01-15T10:00:00+08:00", "message": "feat: add login page" }
      ]
    }
  ]
}
```

## Programmatic API

```typescript
import { generateStandup, formatText, formatMarkdown } from "@indiekitai/git-standup";

const report = generateStandup({
  dir: "~/projects",
  since: "yesterday",
  author: "sen",
});

console.log(formatText(report));
console.log(formatMarkdown(report));
console.log(JSON.stringify(report)); // JSON
```

## MCP Server

Built-in MCP server for AI agent integration:

```json
{
  "mcpServers": {
    "git-standup": {
      "command": "npx",
      "args": ["@indiekitai/git-standup", "--mcp"]
    }
  }
}
```

### Tools

| Tool | Description |
|------|-------------|
| `generate_standup` | Generate standup report with optional dir, since, until, author, format params |
| `list_repos` | List git repositories found in a directory |

## License

MIT
