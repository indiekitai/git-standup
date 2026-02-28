export interface Commit {
    hash: string;
    author: string;
    date: string;
    message: string;
}
export interface RepoReport {
    repo: string;
    path: string;
    commits: Commit[];
}
export interface StandupReport {
    since: string;
    until: string;
    author: string | null;
    repos: RepoReport[];
    totalCommits: number;
}
export interface StandupOptions {
    dir?: string;
    since?: string;
    until?: string;
    author?: string;
    recursive?: boolean;
}
export declare function findRepos(dir: string, recursive?: boolean): string[];
export declare function getCommits(repoPath: string, since: string, until: string, author?: string): Commit[];
export declare function generateStandup(options?: StandupOptions): StandupReport;
export declare function formatText(report: StandupReport): string;
export declare function formatMarkdown(report: StandupReport): string;
