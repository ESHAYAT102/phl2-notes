"use client";

import { go } from "@codemirror/lang-go";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";

import type { PlaygroundLanguage } from "./code-playground";

const languageExtensions = {
  go: go(),
  python: python(),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
};

export default function CodeEditor({
  language,
  value,
  onChange,
}: {
  language: PlaygroundLanguage;
  value: string;
  onChange: (value: string) => void;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <CodeMirror
      aria-label="Code editor"
      autoFocus
      basicSetup={{
        bracketMatching: true,
        closeBrackets: true,
        foldGutter: false,
        highlightActiveLineGutter: false,
        indentOnInput: true,
        lineNumbers: true,
      }}
      className="playground-editor"
      extensions={[languageExtensions[language]]}
      height="100%"
      onChange={onChange}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      value={value}
    />
  );
}
