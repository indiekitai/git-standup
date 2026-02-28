import { execSync } from "node:child_process";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";
function yesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}
function today() {
    return new Date().toISOString().slice(0, 10);
}
export function findRepos(dir, recursive = true) {
    const abs = resolve(dir);
    const repos = [];
    // If dir itself is a repo
    if (existsSync(join(abs, ".git"))) {
        repos.push(abs);
        if (!recursive)
            return repos;
    }
    try {
        for (const entry of readdirSync(abs)) {
            if (entry.startsWith("."))
                continue;
            const full = join(abs, entry);
            try {
                if (!statSync(full).isDirectory())
                    continue;
            }
            catch {
                continue;
            }
            if (existsSync(join(full, ".git"))) {
                repos.push(full);
            }
            else if (recursive) {
                // Only go one level deep for performance
            }
        }
    }
    catch { /* permission errors etc */ }
    return repos;
}
export function getCommits(repoPath, since, until, author) {
    const authorFlag = author ? `--author="${author}"` : "";
    const cmd = `git -C "${repoPath}" log --since="${since}" --until="${until}" ${authorFlag} --pretty=format:"%H|%an|%aI|%s" --no-merges 2>/dev/null`;
    let output;
    try {
        output = execSync(cmd, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }).trim();
    }
    catch {
        return [];
    }
    if (!output)
        return [];
    return output.split("\n").map((line) => {
        const [hash, authorName, date, ...msgParts] = line.split("|");
        return { hash, author: authorName, date, message: msgParts.join("|") };
    });
}
export function generateStandup(options = {}) {
    const since = options.since ?? yesterday();
    const until = options.until ?? today();
    const dir = options.dir ?? process.cwd();
    const author = options.author;
    const repoPaths = findRepos(dir, options.recursive !== false);
    // If no repos found in dir, try dir itself
    if (repoPaths.length === 0 && existsSync(join(resolve(dir), ".git"))) {
        repoPaths.push(resolve(dir));
    }
    const repos = [];
    let totalCommits = 0;
    for (const repoPath of repoPaths) {
        const commits = getCommits(repoPath, since, until, author);
        if (commits.length > 0) {
            repos.push({ repo: basename(repoPath), path: repoPath, commits });
            totalCommits += commits.length;
        }
    }
    return { since, until, author: author ?? null, repos, totalCommits };
}
export function formatText(report) {
    if (report.totalCommits === 0) {
        return `No commits found (${report.since} to ${report.until})`;
    }
    const lines = [];
    lines.push(`Standup Report: ${report.since} → ${report.until}`);
    if (report.author)
        lines.push(`Author: ${report.author}`);
    lines.push(`Total: ${report.totalCommits} commit(s) across ${report.repos.length} repo(s)`);
    lines.push("");
    for (const repo of report.repos) {
        lines.push(`📁 ${repo.repo} (${repo.commits.length})`);
        for (const c of repo.commits) {
            lines.push(`  • ${c.message} (${c.hash.slice(0, 7)})`);
        }
        lines.push("");
    }
    return lines.join("\n").trim();
}
export function formatMarkdown(report) {
    if (report.totalCommits === 0) {
        return `# Standup Report\n\nNo commits found (${report.since} to ${report.until})`;
    }
    const lines = [];
    lines.push(`# Standup Report: ${report.since} → ${report.until}`);
    if (report.author)
        lines.push(`\n**Author:** ${report.author}`);
    lines.push(`\n**Total:** ${report.totalCommits} commit(s) across ${report.repos.length} repo(s)\n`);
    for (const repo of report.repos) {
        lines.push(`## ${repo.repo} (${repo.commits.length})\n`);
        for (const c of repo.commits) {
            lines.push(`- ${c.message} (\`${c.hash.slice(0, 7)}\`)`);
        }
        lines.push("");
    }
    return lines.join("\n").trim();
}
