import { execFileSync } from "node:child_process";
import type { ChangedFile } from "./types.js";

function git(repositoryPath: string, args: string[]): string {
  try {
    return execFileSync("git", args, {
      cwd: repositoryPath,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

export function changedFiles(repositoryPath: string, baseRef?: string): ChangedFile[] {
  const base = baseRef ?? "HEAD~1";
  const output = git(repositoryPath, ["diff", "--name-status", `${base}..HEAD`]);

  const files: ChangedFile[] = output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [code, ...pathParts] = line.split("\t");
      const status = code === "A" ? "added" : code === "D" ? "deleted" : "modified";
      return { path: pathParts.join("\t"), status };
    });

  try {
    const statusOutput = git(repositoryPath, ["status", "--porcelain"]);
    const untracked = statusOutput
      .split("\n")
      .filter((line) => line.startsWith("?? "))
      .map((line) => ({ path: line.slice(3), status: "untracked" as const }));
    files.push(...untracked);
  } catch {
    // No untracked files or git error
  }

  return files;
}