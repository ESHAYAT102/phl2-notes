import { describe, expect, test } from "bun:test";

import { formatExecution, isLanguage } from "./helpers.ts";

describe("formatExecution", () => {
  test("prefers useful runner output and handles silent programs", () => {
    expect(formatExecution({ stderr: "warning", stdout: "done", status: { id: 3, description: "Accepted" } })).toBe("warning\ndone");
    expect(formatExecution({ status: { id: 3, description: "Accepted" } })).toBe("Program finished without output.");
  });

  test("accepts only supported language keys", () => {
    expect(isLanguage("go")).toBe(true);
    expect(isLanguage("constructor")).toBe(false);
  });
});
