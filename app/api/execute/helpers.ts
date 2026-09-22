export const languageIds = {
  go: 60,
  python: 71,
  javascript: 63,
  typescript: 74,
} as const;

export type Language = keyof typeof languageIds;
export type JudgeResult = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id: number; description: string };
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && Object.hasOwn(languageIds, value);
}

export function formatExecution(result: JudgeResult) {
  const sections = [result.compile_output, result.stderr, result.stdout, result.message]
    .filter((value): value is string => Boolean(value?.trim()));
  const output = sections.join("\n");
  if (output.trim()) return output.slice(0, 65_536);
  return result.status?.id === 3
    ? "Program finished without output."
    : (result.status?.description ?? "Execution failed.");
}
