#!/usr/bin/env node

import { generateStandup, formatText, formatMarkdown } from "./index.js";

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") { args.json = true; continue; }
    if (a === "--markdown" || a === "--md") { args.markdown = true; continue; }
    if (a === "--help" || a === "-h") { args.help = true; continue; }
    if (a === "--version" || a === "-v") { args.version = true; continue; }
    if (a.startsWith("--") && i + 1 < argv.length) {
      args[a.slice(2)] = argv[++i];
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`Usage: git-standup [options]

Options:
  --since <date>    Start date (default: yesterday)
  --until <date>    End date (default: today)
  --dir <path>      Directory to scan for repos (default: cwd)
  --author <name>   Filter by author name
  --json            Output as JSON
  --markdown, --md  Output as Markdown
  -h, --help        Show help
  -v, --version     Show version`);
  process.exit(0);
}

if (args.version) {
  console.log("1.0.0");
  process.exit(0);
}

const report = generateStandup({
  since: typeof args.since === "string" ? args.since : undefined,
  until: typeof args.until === "string" ? args.until : undefined,
  dir: typeof args.dir === "string" ? args.dir : undefined,
  author: typeof args.author === "string" ? args.author : undefined,
});

if (args.json) {
  console.log(JSON.stringify(report, null, 2));
} else if (args.markdown) {
  console.log(formatMarkdown(report));
} else {
  console.log(formatText(report));
}
