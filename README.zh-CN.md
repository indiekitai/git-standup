[English](README.md) | [中文](README.zh-CN.md)

# @indiekitai/git-standup

Git standup 报告生成器 — 扫描本地仓库，从 `git log` 生成可读的工作摘要。

**零依赖。** 仅使用 `child_process` 调用 `git`。

## 安装

```bash
npm install -g @indiekitai/git-standup
```

## CLI 用法

```bash
# 当前目录昨天的提交
npx @indiekitai/git-standup

# 自定义时间范围
npx @indiekitai/git-standup --since "2 days ago"
npx @indiekitai/git-standup --since "2024-01-01" --until "2024-01-31"

# 扫描目录下的多个仓库
npx @indiekitai/git-standup --dir ~/projects

# 按作者过滤
npx @indiekitai/git-standup --author "sen"

# JSON 输出（agent 友好）
npx @indiekitai/git-standup --json

# Markdown 输出
npx @indiekitai/git-standup --markdown
```

### 输出格式

**文本（默认）：**
```
Standup Report: 2024-01-15 → 2024-01-16
Total: 3 commit(s) across 2 repo(s)

📁 my-app (2)
  • feat: add login page (abc1234)
  • fix: correct validation (def4567)

📁 lib (1)
  • chore: update deps (ghi7890)
```

**JSON（`--json`）：**
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

## 编程式 API

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

内置 MCP server，用于 AI agent 集成：

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

### 工具

| 工具 | 说明 |
|------|------|
| `generate_standup` | 生成 standup 报告，支持 dir、since、until、author、format 等参数 |
| `list_repos` | 列出目录中找到的 git 仓库 |

## License

MIT
