"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Code2, LoaderCircle, Play, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => <div className="playground-editor-loading">Loading editor…</div>,
});

export type PlaygroundLanguage = "go" | "python" | "javascript" | "typescript";

const examples: Record<PlaygroundLanguage, string> = {
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
}`,
  python: `name = "Python"
print(f"Hello from {name}!")`,
  javascript: `const language = "JavaScript";
console.log(\`Hello from \${language}!\`);`,
  typescript: `const language: string = "TypeScript";
console.log(\`Hello from \${language}!\`);`,
};

const labels: Record<PlaygroundLanguage, string> = {
  go: "Go",
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

const languages = Object.keys(labels) as PlaygroundLanguage[];
const storageKey = (language: PlaygroundLanguage) => `notes-playground:${language}`;
const openPlaygroundEvent = "open-code-playground";

export function MobilePlaygroundTrigger() {
  return (
    <button
      type="button"
      className="playground-control mobile-playground-trigger"
      onClick={(event) => {
        window.dispatchEvent(new Event(openPlaygroundEvent));
        const popover = event.currentTarget.closest<HTMLElement>("[data-toc-popover]");
        if (popover?.id) {
          document.querySelector<HTMLButtonElement>(`button[aria-controls="${popover.id}"]`)?.click();
        }
      }}
    >
      <Code2 aria-hidden="true" size={18} />
      Open code playground
    </button>
  );
}

export function CodePlayground() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [language, setLanguage] = useState<PlaygroundLanguage>("go");
  const [code, setCode] = useState(examples.go);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Run your code to see the output here.");
  const [running, setRunning] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const languageOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const saved = localStorage.getItem("notes-playground:language");
    const selected = languages.includes(saved as PlaygroundLanguage)
      ? (saved as PlaygroundLanguage)
      : "go";
    setLanguage(selected);
    setCode(localStorage.getItem(storageKey(selected)) ?? examples[selected]);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey(language), code);
  }, [code, language, ready]);

  useEffect(() => {
    const openPlayground = () => setOpen(true);
    window.addEventListener(openPlaygroundEvent, openPlayground);
    return () => window.removeEventListener(openPlaygroundEvent, openPlayground);
  }, []);

  const close = useCallback(() => {
    setLanguageMenuOpen(false);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setOutput("Running…");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      const result = (await response.json()) as { output?: string; error?: string };
      setOutput(result.output ?? result.error ?? "The runner returned no output.");
    } catch {
      setOutput("Could not reach the code runner. Please try again.");
    } finally {
      setRunning(false);
    }
  }, [code, language, running, stdin]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        if (languageMenuOpen) {
          setLanguageMenuOpen(false);
          languageButtonRef.current?.focus();
        } else {
          close();
        }
      }
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (open) void run();
        else setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, languageMenuOpen, open, run]);

  useEffect(() => {
    if (!languageMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) setLanguageMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [languageMenuOpen]);

  const chooseLanguage = (next: PlaygroundLanguage) => {
    localStorage.setItem("notes-playground:language", next);
    setLanguage(next);
    setCode(localStorage.getItem(storageKey(next)) ?? examples[next]);
    setOutput("Run your code to see the output here.");
    setLanguageMenuOpen(false);
    requestAnimationFrame(() => languageButtonRef.current?.focus());
  };

  const openLanguageMenu = () => {
    setLanguageMenuOpen(true);
    requestAnimationFrame(() => languageOptionRefs.current[languages.indexOf(language)]?.focus());
  };

  const moveLanguageFocus = (event: React.KeyboardEvent) => {
    const current = languageOptionRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === "ArrowDown") next = (current + 1) % languages.length;
    else if (event.key === "ArrowUp") next = (current - 1 + languages.length) % languages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = languages.length - 1;
    else return;
    event.preventDefault();
    languageOptionRefs.current[next]?.focus();
  };

  const reset = () => {
    setCode(examples[language]);
    setStdin("");
    setOutput("Example restored.");
  };

  return (
    <aside className="code-playground" data-open={open} data-mobile-inline={pathname.startsWith("/docs")} aria-label="Code playground">
      <button
        ref={triggerRef}
        type="button"
        className="playground-trigger group"
        aria-expanded={open}
        aria-label="Open code playground"
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
      >
        <Code2 aria-hidden="true" size={22} />
        <span role="tooltip" className="playground-tooltip">Try some code</span>
      </button>

      <div className="playground-panel" role="dialog" aria-label="Code playground" aria-hidden={!open} inert={!open}>
        <header className="playground-toolbar">
          <div className="flex min-w-0 items-center gap-2">
            <Code2 aria-hidden="true" className="hidden shrink-0 sm:block" size={18} />
            <span className="hidden text-sm font-semibold sm:inline">Playground</span>
            <div ref={languageMenuRef} className="playground-language">
              <button
                ref={languageButtonRef}
                type="button"
                className="playground-control playground-language-button"
                aria-controls="playground-language-menu"
                aria-expanded={languageMenuOpen}
                aria-haspopup="listbox"
                onClick={() => languageMenuOpen ? setLanguageMenuOpen(false) : openLanguageMenu()}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    openLanguageMenu();
                  }
                }}
              >
                <span>{labels[language]}</span>
                <ChevronDown aria-hidden="true" className="playground-language-chevron" size={16} />
              </button>
              <div
                id="playground-language-menu"
                className="playground-language-menu"
                role="listbox"
                aria-label="Language"
                aria-hidden={!languageMenuOpen}
                inert={!languageMenuOpen}
                data-open={languageMenuOpen}
                onKeyDown={moveLanguageFocus}
              >
                {languages.map((item, index) => (
                  <button
                    key={item}
                    ref={(element) => { languageOptionRefs.current[index] = element; }}
                    type="button"
                    role="option"
                    aria-selected={language === item}
                    onClick={() => chooseLanguage(item)}
                  >
                    <span>{labels[item]}</span>
                    <Check aria-hidden="true" size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button type="button" className="playground-control playground-icon-button" onClick={reset} aria-label="Reset example">
              <RotateCcw aria-hidden="true" size={17} />
            </button>
            <button type="button" className="playground-control playground-run-button" disabled={running} onClick={() => void run()}>
              {running ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> : <Play aria-hidden="true" size={16} fill="currentColor" />}
              {running ? "Running" : <><span className="sm:hidden">Run</span><span className="hidden sm:inline">Run code</span></>}
            </button>
            <button type="button" className="playground-control playground-icon-button" onClick={close} aria-label="Close playground">
              <X aria-hidden="true" size={18} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden border-y border-fd-border">
          {open && <CodeEditor language={language} value={code} onChange={setCode} />}
        </div>

        <details className="playground-stdin">
          <summary>Standard input <span>(optional)</span></summary>
          <textarea
            aria-label="Standard input"
            placeholder="Input passed to your program"
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
          />
        </details>

        <section className="playground-output" aria-label="Program output">
          <div className="playground-output-label">Output</div>
          <pre aria-live="polite">{output}</pre>
        </section>
      </div>
    </aside>
  );
}
