import { useState } from "react";
import type { Project } from "../../types/portfolio";
import { isHighlightTech } from "../../lib/utils";

interface Props {
  projects: Project[];
}

export default function ProjectFilter({ projects }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const tags = Array.from(
    new Set(projects.flatMap((project) => project.technologies)),
  ).sort();

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
              ? "accent-border-strong accent-surface text-accent-strong"
              : "border-hairline surface-raised text-body hover:accent-border-strong hover:text-accent"
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
                ? "accent-border-strong accent-surface text-accent-strong"
                : "border-hairline surface-raised text-body hover:accent-border-strong hover:text-accent"
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
            style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}
            className="tech-card card-in group flex flex-col rounded-xl border border-hairline surface-sunken p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:accent-border-strong"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-accent">
                P.{String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-body">
                {project.role}
              </span>
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-strong">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent"
                >
                  {project.name}
                  <span className="font-mono text-xs text-accent">↗</span>
                </a>
              ) : (
                project.name
              )}
            </h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-body">
              {project.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-hairline pt-5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className={`rounded border px-2 py-0.5 font-mono text-[11px] ${
                    isHighlightTech(tech)
                      ? "accent-border accent-surface text-accent"
                      : "border-hairline surface-raised text-body"
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
