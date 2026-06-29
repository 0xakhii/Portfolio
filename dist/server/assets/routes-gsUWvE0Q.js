import { useEffect, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowUpRight, Download } from "lucide-react";
//#region src/components/ParticleField.tsx
function ParticleField() {
	const ref = useRef(null);
	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let w = 0;
		let h = 0;
		let dpr = Math.min(window.devicePixelRatio || 1, 2);
		let raf = 0;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let particles = [];
		const resize = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const density = Math.min(120, Math.floor(w * h / 14e3));
			particles = Array.from({ length: density }, () => spawn());
		};
		const spawn = () => ({
			x: Math.random() * w,
			y: Math.random() * h,
			vx: (Math.random() - .5) * .15,
			vy: (Math.random() - .5) * .15,
			r: Math.random() * 1.2 + .3,
			a: Math.random() * .5 + .2
		});
		const mouse = {
			x: -9999,
			y: -9999
		};
		const onMove = (e) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		};
		const onLeave = () => {
			mouse.x = -9999;
			mouse.y = -9999;
		};
		const GOLD = "212, 175, 55";
		const draw = () => {
			ctx.clearRect(0, 0, w, h);
			const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75);
			grad.addColorStop(0, "rgba(212,175,55,0)");
			grad.addColorStop(1, "rgba(212,175,55,0.05)");
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, w, h);
			for (const p of particles) {
				p.x += p.vx;
				p.y += p.vy;
				const dx = mouse.x - p.x;
				const dy = mouse.y - p.y;
				const d2 = dx * dx + dy * dy;
				if (d2 < 22500) {
					const f = (1 - d2 / 22500) * .02;
					p.vx += dx * f * .01;
					p.vy += dy * f * .01;
				}
				p.vx *= .99;
				p.vy *= .99;
				if (p.x < -10) p.x = w + 10;
				if (p.x > w + 10) p.x = -10;
				if (p.y < -10) p.y = h + 10;
				if (p.y > h + 10) p.y = -10;
				ctx.beginPath();
				ctx.fillStyle = `rgba(${GOLD},${p.a})`;
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fill();
			}
			for (let i = 0; i < particles.length; i++) {
				const a = particles[i];
				for (let j = i + 1; j < particles.length; j++) {
					const b = particles[j];
					const dx = a.x - b.x;
					const dy = a.y - b.y;
					const d2 = dx * dx + dy * dy;
					if (d2 < 1e4) {
						ctx.strokeStyle = `rgba(${GOLD},${(1 - d2 / 1e4) * .12})`;
						ctx.lineWidth = .5;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					}
				}
			}
			if (!reduced) raf = requestAnimationFrame(draw);
		};
		resize();
		draw();
		if (reduced) cancelAnimationFrame(raf);
		window.addEventListener("resize", resize);
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseleave", onLeave);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseleave", onLeave);
		};
	}, []);
	return /* @__PURE__ */ jsx("canvas", {
		ref,
		"aria-hidden": "true",
		className: "pointer-events-none fixed inset-0 z-0 h-screen w-screen"
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var stackGroups = [
	{
		label: "Languages",
		items: [
			"Python",
			"C / C++",
			"TypeScript",
			"Bash"
		]
	},
	{
		label: "Backend",
		items: [
			"FastAPI",
			"Django",
			"WebSockets",
			"LiveKit"
		]
	},
	{
		label: "Frontend",
		items: [
			"React",
			"React Native",
			"Tailwind"
		]
	},
	{
		label: "Infra",
		items: [
			"Docker",
			"Kubernetes",
			"GitHub Actions",
			"Linux"
		]
	},
	{
		label: "Data",
		items: [
			"PostgreSQL",
			"Redis",
			"MongoDB"
		]
	},
	{
		label: "Languages·Spoken",
		items: [
			"English",
			"Arabic",
			"French"
		]
	}
];
var projects = [
	{
		n: "01",
		tag: "K8s · Microservices",
		name: "FT_SERVICES",
		blurb: "Cloud-native microservices cluster with automated rolling deployments and horizontal scaling — near-zero downtime.",
		href: "https://github.com/0xakhii"
	},
	{
		n: "02",
		tag: "WebSockets · Redis",
		name: "Pongify",
		blurb: "Real-time multiplayer game. Cut network latency 20% via optimized WebSocket pooling and Redis-backed sessions.",
		href: "https://github.com/0xakhii"
	},
	{
		n: "03",
		tag: "C++ · TCP/IP",
		name: "FT_IRC",
		blurb: "Concurrent IRC server in C++ supporting 50+ simultaneous users via non-blocking I/O and socket multiplexing.",
		href: "https://github.com/0xakhii"
	}
];
var experience = [{
	role: "IoT Engineering Intern",
	company: "Dropolabs",
	period: "2025 — 2026",
	location: "Ben Guerir, MA",
	current: true,
	bullets: [
		"Shipped a production IoT platform for qPCR machines as sole engineer — edge agent to containerized cloud backend.",
		"Designed FastAPI + PostgreSQL backend with 20+ REST endpoints and Docker multi-service orchestration.",
		"Built GitHub Actions CI/CD pipelines for end-to-end testing and deployment across all platform services."
	]
}, {
	role: "AI Engineering Intern",
	company: "SMValley",
	period: "2025",
	location: "Agadir, MA",
	current: false,
	bullets: [
		"Built a voice pipeline (STT → GPT agent → TTS) over real-time LiveKit WebRTC for elderly users.",
		"Designed a Python decorator-based tool-calling framework for healthcare actions (scheduling, reminders).",
		"Added Darija and French multilingual support across STT and LLM prompts in a React Native app."
	]
}];
function Portfolio() {
	return /* @__PURE__ */ jsxs("main", {
		className: "relative min-h-screen text-foreground antialiased",
		children: [
			/* @__PURE__ */ jsx(ParticleField, {}),
			/* @__PURE__ */ jsxs("nav", {
				className: "relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 py-8",
				children: [
					/* @__PURE__ */ jsxs("a", {
						href: "#top",
						className: "font-display text-sm font-bold tracking-tight",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-primary",
							children: "0x"
						}), "akhii"]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "hidden items-center gap-7 font-display text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:flex",
						children: [
							/* @__PURE__ */ jsx("a", {
								href: "#work",
								className: "transition-colors hover:text-foreground",
								children: "Work"
							}),
							/* @__PURE__ */ jsx("a", {
								href: "#experience",
								className: "transition-colors hover:text-foreground",
								children: "Experience"
							}),
							/* @__PURE__ */ jsx("a", {
								href: "#stack",
								className: "transition-colors hover:text-foreground",
								children: "Stack"
							}),
							/* @__PURE__ */ jsx("a", {
								href: "#contact",
								className: "transition-colors hover:text-foreground",
								children: "Contact"
							})
						]
					}),
					/* @__PURE__ */ jsxs("a", {
						href: "/OMAR_JAMAL_CV.pdf",
						download: true,
						className: "inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-primary hover:text-foreground transition-colors",
						children: [/* @__PURE__ */ jsx(Download, { className: "size-3.5" }), " CV"]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				id: "top",
				className: "relative z-10 mx-auto flex max-w-3xl flex-col gap-28 px-6 pb-24",
				children: [
					/* @__PURE__ */ jsxs("section", {
						className: "relative pt-8",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-display block text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
								children: "Portfolio — 2026"
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "font-display mt-5 text-7xl font-extrabold leading-[0.9] tracking-tight text-foreground sm:text-8xl",
								children: [
									"OMAR",
									/* @__PURE__ */ jsx("br", {}),
									"JAMAL"
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-10 flex items-start gap-5",
								children: [/* @__PURE__ */ jsx("div", { className: "mt-3 h-px w-14 shrink-0 bg-primary" }), /* @__PURE__ */ jsxs("p", {
									className: "max-w-md text-base font-light leading-relaxed text-muted-foreground",
									children: [
										"Full-stack engineer architecting real-time systems, cloud-native backends, and IoT platforms with a lens of",
										" ",
										/* @__PURE__ */ jsx("span", {
											className: "text-primary",
											children: "minimalist precision"
										}),
										"."
									]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-display text-[11px] uppercase tracking-[0.22em] text-muted-foreground",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-primary live-dot" }), "Available · Q1 2026"]
									}),
									/* @__PURE__ */ jsx("span", { children: "Marrakech, MA" }),
									/* @__PURE__ */ jsx("span", { children: "1337 · 42 Network" })
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
						className: "font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
						children: "/ Philosophy"
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-6 text-xl font-light leading-snug text-foreground/90 sm:text-2xl",
						children: [
							"I like low-level systems, clean APIs, and the small details of platform engineering. Most recently shipped an end-to-end IoT platform at",
							" ",
							/* @__PURE__ */ jsx("span", {
								className: "text-primary",
								children: "Dropolabs"
							}),
							" and a real-time voice AI pipeline at ",
							/* @__PURE__ */ jsx("span", {
								className: "text-primary",
								children: "SMValley"
							}),
							"."
						]
					})] }),
					/* @__PURE__ */ jsxs("section", {
						id: "stack",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
							children: "/ Arsenal"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-8 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3",
							children: stackGroups.map((g) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70",
								children: g.label.replace("·", " · ")
							}), /* @__PURE__ */ jsx("ul", {
								className: "mt-3 space-y-1.5 text-sm text-foreground/90",
								children: g.items.map((it) => /* @__PURE__ */ jsx("li", { children: it }, it))
							})] }, g.label))
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						id: "work",
						className: "space-y-14",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
								children: "/ Selected Works"
							}), /* @__PURE__ */ jsxs("a", {
								href: "https://github.com/0xakhii",
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex items-center gap-1 font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary",
								children: ["All on GitHub ", /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5" })]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-14",
							children: projects.map((p) => /* @__PURE__ */ jsxs("a", {
								href: p.href,
								target: "_blank",
								rel: "noreferrer",
								className: "group block",
								children: [
									/* @__PURE__ */ jsxs("p", {
										className: "font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70",
										children: [
											p.n,
											" // ",
											p.tag
										]
									}),
									/* @__PURE__ */ jsxs("h3", {
										className: "font-display mt-2 text-3xl font-semibold text-foreground transition-colors group-hover:text-primary sm:text-4xl",
										children: [p.name, /* @__PURE__ */ jsx(ArrowUpRight, { className: "ml-2 inline-block size-5 -translate-y-1 opacity-0 transition-all group-hover:opacity-100" })]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-3 max-w-xl text-sm font-light leading-relaxed text-muted-foreground",
										children: p.blurb
									})
								]
							}, p.name))
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						id: "experience",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
							children: "/ Experience"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-10 space-y-14 border-l border-border/60 pl-7",
							children: experience.map((e) => /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ jsx("div", { className: `absolute -left-[33px] top-1.5 size-2 ${e.current ? "bg-primary" : "bg-muted-foreground/40"}` }),
									/* @__PURE__ */ jsx("p", {
										className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-primary",
										children: e.period
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-display mt-2 text-lg font-bold uppercase tracking-wide text-foreground",
										children: e.role
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: [
											e.company,
											" ",
											/* @__PURE__ */ jsxs("span", {
												className: "text-muted-foreground/60",
												children: ["· ", e.location]
											})
										]
									}),
									/* @__PURE__ */ jsx("ul", {
										className: "mt-4 space-y-2",
										children: e.bullets.map((b) => /* @__PURE__ */ jsxs("li", {
											className: "flex gap-2.5 text-[13px] font-light leading-relaxed text-muted-foreground",
											children: [/* @__PURE__ */ jsx("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-primary/70" }), /* @__PURE__ */ jsx("span", { children: b })]
										}, b))
									})
								]
							}, e.company))
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						id: "contact",
						className: "border-t border-primary/20 pt-14",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-display text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl",
								children: "LET'S BUILD."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-5 max-w-md text-sm font-light leading-relaxed text-muted-foreground",
								children: "Open to engineering roles and ambitious collaborations. Marrakech-based, comfortable remote across time zones."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-12 flex flex-col",
								children: [
									/* @__PURE__ */ jsx(ContactLine, {
										label: "Email",
										value: "ojamal710@gmail.com",
										href: "mailto:ojamal710@gmail.com",
										primary: true
									}),
									/* @__PURE__ */ jsx(ContactLine, {
										label: "Phone",
										value: "+212 700 339 115",
										href: "tel:+212700339115"
									}),
									/* @__PURE__ */ jsx(ContactLine, {
										label: "GitHub",
										value: "github.com/0xakhii",
										href: "https://github.com/0xakhii"
									}),
									/* @__PURE__ */ jsx(ContactLine, {
										label: "LinkedIn",
										value: "linkedin.com/in/ojamal-710-",
										href: "https://linkedin.com/in/ojamal-710-"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("footer", {
						className: "flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ jsx("p", {
							className: "font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: "© 2026 Omar Jamal · Built in Marrakech"
						}), /* @__PURE__ */ jsx("p", {
							className: "font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: "GMT+1 · EN · AR · FR"
						})]
					})
				]
			})
		]
	});
}
function ContactLine({ label, value, href, primary = false }) {
	return /* @__PURE__ */ jsxs("a", {
		href,
		target: href.startsWith("http") ? "_blank" : void 0,
		rel: "noreferrer",
		className: "group flex items-center justify-between gap-4 border-b border-border/40 py-4 transition-colors hover:border-primary/60",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-baseline gap-5",
			children: [/* @__PURE__ */ jsx("span", {
				className: "font-display w-16 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70",
				children: label
			}), /* @__PURE__ */ jsx("span", {
				className: `font-display text-base tracking-wide transition-colors group-hover:text-primary ${primary ? "text-primary" : "text-foreground"}`,
				children: value
			})]
		}), /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" })]
	});
}
//#endregion
export { Portfolio as component };
