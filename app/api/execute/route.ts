import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const languageIds = {
  go: 60,
  python: 71,
  javascript: 63,
  typescript: 74,
} as const;

type Language = keyof typeof languageIds;
type JudgeResult = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id: number; description: string };
};

const attempts = new Map<string, { count: number; resetAt: number }>();

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && Object.hasOwn(languageIds, value);
}

function rateLimited(ip: string) {
  const now = Date.now();
  if (attempts.size > 1_000) attempts.clear();
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 12;
  // ponytail: this is per server instance; use a shared store if runner abuse becomes a real problem.
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

function judgeHeaders() {
  const headers: Record<string, string> = { "content-type": "application/json" };
  const key = process.env.JUDGE0_API_KEY;
  const host = process.env.JUDGE0_API_HOST;
  if (key && host) {
    headers["X-RapidAPI-Key"] = key;
    headers["X-RapidAPI-Host"] = host;
  } else if (key) {
    headers["X-Auth-Token"] = key;
  }
  return headers;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many runs. Please wait a minute." }, { status: 429 });
  }

  if (Number(request.headers.get("content-length") ?? 0) > 45_000) {
    return NextResponse.json({ error: "The program is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { language, code, stdin = "" } = body as { language?: unknown; code?: unknown; stdin?: unknown };
  if (!isLanguage(language)) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }
  if (typeof code !== "string" || !code.trim() || code.length > 32_768) {
    return NextResponse.json({ error: "Code must be between 1 byte and 32 KB." }, { status: 400 });
  }
  if (typeof stdin !== "string" || stdin.length > 8_192) {
    return NextResponse.json({ error: "Standard input must be 8 KB or less." }, { status: 400 });
  }

  const baseUrl = (process.env.JUDGE0_URL ?? "https://ce.judge0.com").replace(/\/$/, "");
  const headers = judgeHeaders();

  try {
    const submission = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=false`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: code,
        stdin,
        language_id: languageIds[language],
        cpu_time_limit: 5,
        wall_time_limit: 8,
        memory_limit: 128_000,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!submission.ok) throw new Error(`Runner rejected the submission (${submission.status}).`);

    const { token } = (await submission.json()) as { token?: string };
    if (!token) throw new Error("Runner did not return a submission token.");

    for (let poll = 0; poll < 24; poll += 1) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const response = await fetch(
        `${baseUrl}/submissions/${encodeURIComponent(token)}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status`,
        { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) },
      );
      if (!response.ok) throw new Error(`Runner could not read the result (${response.status}).`);
      const result = (await response.json()) as JudgeResult;
      if ((result.status?.id ?? 0) > 2) {
        return NextResponse.json({ output: formatExecution(result) });
      }
    }

    return NextResponse.json({ error: "The program took too long to finish." }, { status: 504 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Code runner unavailable.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
