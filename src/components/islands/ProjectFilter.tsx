import { useMemo, useState } from "react";
import type { Project } from "../../types/portfolio";

interface Props {
  projects: Project[];
}

const HIGHLIGHT = new Set(["AI/LLM", "GitLab"]);

export default function ProjectFilter({ projects }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => project.technologies.forEach((tech) => set.add(tech)));
    return Array.from(set).sort();
  }, [projects]);

  const visible = active
    ? projects.filter((project) => project.technologies.includes(active))
    : projects;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
            active === null
              ? "border-matcha-600 bg-matcha-950/40 text-matcha-200"
              : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-matcha-700 hover:text-matcha-300"
          }`}
        >
          all
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActive(tag === active ? null : tag)}
            className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
              active === tag
                ? "border-matcha-600 bg-matcha-950/40 text-matcha-200"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-matcha-700 hover:text-matcha-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visible.map((project, i) => (
          <article
            key={project.name}
            className="tech-card group flex flex-col rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-matcha-600/50"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-matcha-300">
                P.{String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                {project.role}
              </span>
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-zinc-100">
              {project.name}
            </h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-zinc-400">
              {project.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-800/60 pt-5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className={`rounded border px-2 py-0.5 font-mono text-[11px] ${
                    HIGHLIGHT.has(tech)
                      ? "border-matcha-800/60 bg-matcha-950/40 text-matcha-300"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400"
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
