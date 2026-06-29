import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Download } from "lucide-react";
import { ParticleField } from "@/components/ParticleField";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Omar Jamal — Full-Stack Software Engineer" },
      {
        name: "description",
        content:
          "Engineer working where systems, latency, and intention meet. Based in Marrakech.",
      },
      { property: "og:title", content: "Omar Jamal — Full-Stack Software Engineer" },
      {
        property: "og:description",
        content:
          "Engineer working where systems, latency, and intention meet. Based in Marrakech.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-image.jpg" },
      { property: "og:image:width", content: "1216" },
      { property: "og:image:height", content: "640" },
      { property: "og:image:alt", content: "Omar Jamal — Full-Stack Software Engineer" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Omar Jamal — Full-Stack Software Engineer" },
      {
        name: "twitter:description",
        content:
          "Engineer working where systems, latency, and intention meet. Based in Marrakech.",
      },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Omar Jamal",
          jobTitle: "Full-Stack Software Engineer",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Marrakech",
            addressCountry: "MA",
          },
          email: "mailto:ojamal710@gmail.com",
          telephone: "+212700339115",
          sameAs: [
            "https://github.com/0xakhii",
            "https://linkedin.com/in/ojamal-710-",
          ],
          knowsAbout: [
            "Python", "C++", "FastAPI", "React", "Docker", "Kubernetes",
            "PostgreSQL", "WebSockets", "IoT", "Cloud-Native Development",
          ],
          alumniOf: { "@type": "CollegeOrUniversity", name: "1337 Coding School (42 Network)" },
        }),
      },
    ],
  }),
  component: Portfolio,
});

const stackGroups: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "C / C++", "TypeScript", "Bash"] },
  { label: "Backend", items: ["FastAPI", "Django", "WebSockets", "LiveKit"] },
  { label: "Frontend", items: ["React", "React Native", "Tailwind"] },
  { label: "Infra", items: ["Docker", "Kubernetes", "GitHub Actions", "Linux"] },
  { label: "Data", items: ["PostgreSQL", "Redis", "MongoDB"] },
  { label: "Languages·Spoken", items: ["English", "Arabic", "French"] },
];

const projects = [
  {
    n: "01",
    tag: "K8s · Microservices",
    name: "FT_SERVICES",
    blurb:
      "A distributed system that doesn't flinch at scale. Automated rollouts, zero-downtime deployments, horizontal growth — stability as design, not luck.",
    href: "https://github.com/0xakhii",
  },
  {
    n: "02",
    tag: "WebSockets · Redis",
    name: "Pongify",
    blurb:
      "A game played in real time across distances. Shaved latency not by chasing numbers, but by removing everything unnecessary between the signal and the answer.",
    href: "https://github.com/0xakhii",
  },
  {
    n: "03",
    tag: "C++ · TCP/IP",
    name: "FT_IRC",
    blurb:
      "Built for when protocols have to speak in parallel without stuttering. Concurrency not as a feature, but as the only honest way to handle fifty simultaneous truths.",
    href: "https://github.com/0xakhii",
  },
];

const experience = [
  {
    role: "IoT Engineering Intern",
    company: "Dropolabs",
    period: "2025 — 2026",
    location: "Ben Guerir, MA",
    current: true,
    bullets: [
      "Built an end-to-end IoT platform for qPCR machines — from edge agent to cloud backend — as the sole engineer.",
      "Designed a backend with twenty-plus endpoints, persisted state, and container orchestration that behaved predictably under load.",
      "Established CI pipelines that tested and deployed every service without shortcuts or late-night assumptions.",
    ],
  },
  {
    role: "AI Engineering Intern",
    company: "SMValley",
    period: "2025",
    location: "Agadir, MA",
    current: false,
    bullets: [
      "Designed a real-time voice pipeline for elderly users — speech to meaning to speech, across live connections.",
      "Created a decorator-based tool framework that let healthcare actions speak for themselves without wiring.",
      "Threaded multilingual understanding through the interface — Darija and French, because context isn't optional for humans.",
    ],
  },
];

function Portfolio() {
  return (
    <main className="relative min-h-screen text-foreground antialiased w-full overflow-x-hidden">
      <ParticleField />
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/20 border-b border-white/[0.12] shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#top" className="font-display text-sm font-bold tracking-tight">
          <span className="text-primary">0x</span>akhii
        </a>
        <div className="hidden items-center gap-4 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:flex md:gap-7">
          <a href="#work" className="transition-colors hover:text-foreground">Work</a>
          <a href="#experience" className="transition-colors hover:text-foreground">Experience</a>
          <a href="#stack" className="transition-colors hover:text-foreground">Stack</a>
          <a href="#contact" className="transition-colors hover:text-foreground">Contact</a>
        </div>
        <a
          href="/OMAR_JAMAL_CV.pdf"
          download
          className="inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors md:text-[11px]"
        >
          <Download className="size-3.5" /> CV
        </a>
        </div>
      </nav>
      <div className="h-[56px] sm:h-[60px]" aria-hidden="true" />

      <div id="top" className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 sm:gap-24 md:gap-28 px-4 pb-24 sm:px-6 md:px-8">
        {/* HERO */}
        <section className="relative pt-6">
          
          <h1 className="font-display mt-5 text-5xl font-extrabold leading-[0.9] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            OMAR<br />JAMAL
          </h1>
          <div className="mt-10 flex items-start gap-5">
            <div className="mt-3 h-px w-14 shrink-0 bg-primary" />
            <p className="max-w-md text-base font-light leading-relaxed text-muted-foreground">
            Builder of systems that carry weight beyond the moment they were made. Quiet, precise, finished.
          </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-display text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary live-dot" />
              Open ·
            </span>
            <span>Marrakech, MA</span>
            <span>1337 · 42</span>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section>
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            / Philosophy
          </h2>
          <p className="mt-6 text-xl font-light leading-snug text-foreground/90 sm:text-2xl">
            I shape what outlasts the shape. Not for keeping, not for showing — for the silence that comes after and finds nothing broken.
          </p>
        </section>

        {/* ARSENAL */}
        <section id="stack">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            / Arsenal
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 md:grid-cols-3">
            {stackGroups.map((g) => (
              <div key={g.label}>
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {g.label.replace("·", " · ")}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground/90">
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* SELECTED WORKS */}
        <section id="work" className="space-y-10 sm:space-y-14 md:space-y-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
              / Selected Works
            </h2>
            <a
              href="https://github.com/0xakhii"
              target="_blank"
              rel="noreferrer"
              className="hidden shrink-0 items-center gap-1 font-display text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary md:flex"
            >
              All on GitHub <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          <div className="space-y-10 sm:space-y-14 md:space-y-16">
            {projects.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
                  {p.n} // {p.tag}
                </p>
                <h3 className="font-display mt-2 text-3xl font-semibold text-foreground transition-colors group-hover:text-primary sm:text-4xl">
                  {p.name}
                  <ArrowUpRight className="ml-2 inline-block size-5 -translate-y-1 opacity-0 transition-all group-hover:opacity-100" />
                </h3>
                <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-muted-foreground">
                  {p.blurb}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            / Experience
          </h2>
          <div className="mt-8 space-y-10 sm:space-y-14 border-l border-border/60 pl-5 sm:pl-7">
            {experience.map((e) => (
              <div key={e.company} className="relative">
                <div
                  className={`absolute -left-[26px] top-1.5 size-2 sm:-left-[33px] ${
                    e.current ? "bg-primary" : "bg-muted-foreground/40"
                  }`}
                />
                <p className="font-display text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  {e.period}
                </p>
                <h3 className="font-display mt-2 text-base sm:text-lg font-bold uppercase tracking-wide text-foreground">
                  {e.role}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {e.company} <span className="text-muted-foreground/60">· {e.location}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {e.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2.5 text-[13px] font-light leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/70" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="border-t border-primary/20 pt-10 sm:pt-14">
          <h2 className="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            LET'S BUILD.
          </h2>
          <p className="mt-4 sm:mt-5 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
            If you need something built to last — a system, a pipeline, a product — write.
          </p>
          <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col">
            <ContactLine label="Email" value="ojamal710@gmail.com" href="mailto:ojamal710@gmail.com" primary />
            <ContactLine label="Phone" value="+212 700 339 115" href="tel:+212****9115" />
            <ContactLine label="GitHub" value="github.com/0xakhii" href="https://github.com/0xakhii" />
            <ContactLine label="LinkedIn" value="linkedin.com/in/ojamal-710-" href="https://linkedin.com/in/ojamal-710-" />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center">
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            © 2027 Omar Jamal
          </p>
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            GMT+1 · EN · AR · FR
          </p>
        </footer>
      </div>
    </main>
  );
}

function ContactLine({
  label,
  value,
  href,
  primary = false,
}: {
  label: string;
  value: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="group flex items-center justify-between gap-4 border-b border-border/40 py-4 transition-colors hover:border-primary/60"
    >
      <div className="flex items-baseline gap-5">
        <span className="font-display w-16 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
          {label}
        </span>
        <span
          className={`font-display text-base tracking-wide transition-colors group-hover:text-primary ${
            primary ? "text-primary" : "text-foreground"
          }`}
        >
          {value}
        </span>
      </div>
      <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
    </a>
  );
}
