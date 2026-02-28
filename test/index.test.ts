import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";

// We test the pure formatting functions and the report structure
// Git calls are tested via integration with a temp repo

import { formatText, formatMarkdown, type StandupReport } from "../dist/index.js";

const sampleReport: StandupReport = {
  since: "2024-01-15",
  until: "2024-01-16",
  author: null,
  totalCommits: 3,
  repos: [
    {
      repo: "my-app",
      path: "/home/user/my-app",
      commits: [
        { hash: "abc1234567890", author: "Sen", date: "2024-01-15T10:00:00+08:00", message: "feat: add login page" },
        { hash: "def4567890123", author: "Sen", date: "2024-01-15T14:00:00+08:00", message: "fix: correct validation" },
      ],
    },
    {
      repo: "lib",
      path: "/home/user/lib",
      commits: [
        { hash: "ghi7890123456", author: "Sen", date: "2024-01-15T16:00:00+08:00", message: "chore: update deps" },
      ],
    },
  ],
};

const emptyReport: StandupReport = {
  since: "2024-01-15",
  until: "2024-01-16",
  author: null,
  totalCommits: 0,
  repos: [],
};

describe("formatText", () => {
  it("formats a report with commits", () => {
    const text = formatText(sampleReport);
    assert.ok(text.includes("Standup Report: 2024-01-15 → 2024-01-16"));
    assert.ok(text.includes("my-app (2)"));
    assert.ok(text.includes("lib (1)"));
    assert.ok(text.includes("feat: add login page"));
    assert.ok(text.includes("abc1234"));
    assert.ok(text.includes("3 commit(s) across 2 repo(s)"));
  });

  it("formats empty report", () => {
    const text = formatText(emptyReport);
    assert.ok(text.includes("No commits found"));
  });
});

describe("formatMarkdown", () => {
  it("formats a report with commits as markdown", () => {
    const md = formatMarkdown(sampleReport);
    assert.ok(md.includes("# Standup Report"));
    assert.ok(md.includes("## my-app (2)"));
    assert.ok(md.includes("- feat: add login page (`abc1234`)"));
    assert.ok(md.includes("## lib (1)"));
  });

  it("formats empty report", () => {
    const md = formatMarkdown(emptyReport);
    assert.ok(md.includes("No commits found"));
  });
});

describe("report structure", () => {
  it("has correct shape", () => {
    assert.equal(sampleReport.totalCommits, 3);
    assert.equal(sampleReport.repos.length, 2);
    assert.equal(sampleReport.repos[0].commits.length, 2);
    assert.equal(sampleReport.repos[1].commits.length, 1);
  });

  it("JSON serializes cleanly", () => {
    const json = JSON.stringify(sampleReport);
    const parsed = JSON.parse(json);
    assert.equal(parsed.totalCommits, 3);
    assert.equal(parsed.repos[0].repo, "my-app");
  });
});
