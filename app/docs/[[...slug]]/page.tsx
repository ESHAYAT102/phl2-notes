import { getPageImage, source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";

const projects = [
  {
    name: "Xenon",
    description: "GitHub with Raycast and Twitter",
    href: "https://xenon.eshayat.com",
  },
  {
    name: "Adrian",
    description: "Self hostable private GitHub",
    href: "https://github.com/ESHAYAT102/adrian",
  },
  {
    name: "ESYT",
    description: "Automated React project scaffolding tool",
    href: "https://esyt.eshayat.com",
  },
  {
    name: "Skater",
    description: "TUI for skate (by Charm)",
    href: "https://github.com/ESHAYAT102/skater",
  },
  {
    name: "Milo",
    description: "CLI email client (for Resend)",
    href: "https://github.com/ESHAYAT102/milo",
  },
  {
    name: "Moonify",
    description: "CLI moon phase calendar",
    href: "https://github.com/ESHAYAT102/moonify",
  },
  {
    name: "AirPipe",
    description: "File transfer platform",
    href: "https://airpipe.eshayat.com",
  },
  {
    name: "Archon",
    description: "Automated setup script for Omarchy",
    href: "https://github.com/ESHAYAT102/archon",
  },
  {
    name: "Catppuccin theme",
    description: "Sleek Catppuccin mocha theme for Omarchy",
    href: "https://github.com/ESHAYAT102/omarchy-catppuccin-mocha-theme",
  },
] as const;

const MAX_TOC_ITEMS_FOR_PROMO = 11;

function hashString(input: string) {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function getProjectPromo(slugs: readonly string[]) {
  const seed = hashString(slugs.join("/") || "index");

  return projects[seed % projects.length];
}

function ProjectPromo({
  project,
}: {
  project: (typeof projects)[number];
}) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer noopener sponsored nofollow"
      className="group mt-4 flex cursor-pointer flex-col justify-between rounded-2xl border border-zinc-200 bg-white/80 p-5 text-zinc-900 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md active:translate-y-1 active:shadow-none dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-50 dark:hover:border-zinc-700"
    >
      <h3 className="text-base font-semibold">
        {project.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>
    </a>
  );
}

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const projectPromo =
    page.data.toc.length <= MAX_TOC_ITEMS_FOR_PROMO
      ? getProjectPromo(page.slugs)
      : null;

  return (
    <DocsPage
      tableOfContent={{
        style: "clerk",
        footer: projectPromo ? <ProjectPromo project={projectPromo} /> : undefined,
      }}
      tableOfContentPopover={{
        footer: projectPromo ? <ProjectPromo project={projectPromo} /> : undefined,
      }}
      toc={page.data.toc}
      full={page.data.full}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
