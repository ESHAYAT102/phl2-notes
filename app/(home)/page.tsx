import Link from "next/link";

const projects = [
  {
    name: "Xenon",
    description: "GitHub with Raycast and Twitter",
    link: "https://xenon.eshayat.com",
  },
  {
    name: "Adrian",
    description: "Self hostable private GitHub",
    link: "https://github.com/ESHAYAT102/adrian",
  },
  {
    name: "ESYT",
    description: "Automated React project scaffolding tool",
    link: "https://esyt.eshayat.com",
  },
  {
    name: "Skater",
    description: "TUI for skate (by Charm)",
    link: "https://github.com/ESHAYAT102/skater",
  },
  {
    name: "Milo",
    description: "CLI email client (for Resend)",
    link: "https://github.com/ESHAYAT102/milo",
  },
  {
    name: "Moonify",
    description: "CLI moon phase calendar",
    link: "https://github.com/ESHAYAT102/moonify",
  },
  {
    name: "AirPipe",
    description: "File transfer platform",
    link: "https://airpipe.eshayat.com",
  },
  {
    name: "Archon",
    description: "Automated setup script for Omarchy",
    link: "https://github.com/ESHAYAT102/archon",
  },
  {
    name: "Catppuccin theme",
    description: "Sleek Catppuccin mocha theme for Omarchy",
    link: "https://github.com/ESHAYAT102/omarchy-catppuccin-mocha-theme",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
        <section className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Next Level Web Development Notes
          </h1>
          <Link
            href="/docs"
            className="mt-6 inline-flex h-10 items-center rounded-full border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md active:translate-y-1 active:shadow-none dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-50 dark:hover:border-zinc-700"
          >
            View notes
          </Link>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold">My Open Source Projects</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <a
                key={project.name}
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md active:translate-y-1 active:shadow-none dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700"
              >
                <div>
                  <h3 className="text-base font-semibold">{project.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {project.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
