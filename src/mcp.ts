#!/usr/bin/env node

/**
 * MCP Server for git-standup
 * Tools: generate_standup, list_repos
 */

import { generateStandup, findRepos, formatText, formatMarkdown, type StandupOptions } from "./index.js";
import { createInterface } from "node:readline";

interface McpRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

function respond(id: number | string, result: unknown) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function respondError(id: number | string, code: number, message: string) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
}

const TOOLS = [
  {
    name: "generate_standup",
    description: "Generate a git standup report from local repositories. Returns commit summaries grouped by repo.",
    inputSchema: {
      type: "object" as const,
      properties: {
        dir: { type: "string", description: "Directory to scan for git repos (default: cwd)" },
        since: { type: "string", description: "Start date, e.g. 'yesterday', '2 days ago', '2024-01-01'" },
        until: { type: "string", description: "End date (default: today)" },
        author: { type: "string", description: "Filter by author name (substring match)" },
        format: { type: "string", enum: ["text", "markdown", "json"], description: "Output format (default: json)" },
      },
    },
  },
  {
    name: "list_repos",
    description: "List git repositories found in a directory.",
    inputSchema: {
      type: "object" as const,
      properties: {
        dir: { type: "string", description: "Directory to scan (default: cwd)" },
      },
    },
  },
];

function handleRequest(req: McpRequest) {
  const { id, method, params } = req;

  switch (method) {
    case "initialize":
      respond(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "git-standup", version: "1.0.0" },
      });
      break;

    case "notifications/initialized":
      // no response needed
      break;

    case "tools/list":
      respond(id, { tools: TOOLS });
      break;

    case "tools/call": {
      const toolName = (params as any)?.name;
      const toolArgs = (params as any)?.arguments ?? {};

      if (toolName === "generate_standup") {
        const opts: StandupOptions = {
          dir: toolArgs.dir,
          since: toolArgs.since,
          until: toolArgs.until,
          author: toolArgs.author,
        };
        const report = generateStandup(opts);
        const format = toolArgs.format ?? "json";
        let text: string;
        if (format === "text") text = formatText(report);
        else if (format === "markdown") text = formatMarkdown(report);
        else text = JSON.stringify(report, null, 2);

        respond(id, { content: [{ type: "text", text }] });
      } else if (toolName === "list_repos") {
        const dir = toolArgs.dir ?? process.cwd();
        const repos = findRepos(dir);
        respond(id, { content: [{ type: "text", text: JSON.stringify(repos, null, 2) }] });
      } else {
        respondError(id, -32601, `Unknown tool: ${toolName}`);
      }
      break;
    }

    default:
      if (id !== undefined) {
        respondError(id, -32601, `Method not found: ${method}`);
      }
  }
}

const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  try {
    handleRequest(JSON.parse(line));
  } catch (e) {
    process.stderr.write(`Parse error: ${e}\n`);
  }
});
