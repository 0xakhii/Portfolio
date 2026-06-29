import { useCallback, useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowUpRight, Download } from "lucide-react";
//#region src/components/ParticleField.tsx
function ParticleField() {
	const ref = useRef(null);
	const videoRef = useRef(null);
	const pipVideoRef = useRef(null);
	const overlayRef = useRef(null);
	const landmarksRef = useRef(null);
	const [gestureEnabled, setGestureEnabled] = useState(false);
	const [cameraStatus, setCameraStatus] = useState("idle");
	const [errorMessage, setErrorMessage] = useState(null);
	const gestureState = useRef({
		x: -9999,
		y: -9999,
		active: false
	});
	const pinchState = useRef({
		active: false,
		prevY: 0
	});
	const toggleGesture = useCallback(async () => {
		const next = !gestureState.current.active;
		gestureState.current.active = next;
		setGestureEnabled(next);
		if (next) {
			setCameraStatus("loading");
			setErrorMessage(null);
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: {
					facingMode: "user",
					width: 320,
					height: 240
				} });
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					await videoRef.current.play();
				}
				if (pipVideoRef.current) {
					pipVideoRef.current.srcObject = stream;
					await pipVideoRef.current.play();
				}
				setCameraStatus("ready");
			} catch (err) {
				console.error("Camera access failed:", err);
				gestureState.current.active = false;
				setGestureEnabled(false);
				setCameraStatus("error");
				setErrorMessage(err instanceof Error ? err.message : "Camera unavailable");
			}
		} else {
			const video = videoRef.current;
			const pipVideo = pipVideoRef.current;
			if (video?.srcObject) {
				video.srcObject.getTracks().forEach((t) => t.stop());
				video.srcObject = null;
			}
			if (pipVideo?.srcObject) pipVideo.srcObject = null;
			pinchState.current.active = false;
			gestureState.current.x = -9999;
			gestureState.current.y = -9999;
			setCameraStatus("idle");
			setErrorMessage(null);
		}
	}, []);
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
		let time = 0;
		let peaceCooldown = 0;
		let fistCooldown = 0;
		const mouse = {
			x: -9999,
			y: -9999,
			radius: 100,
			influence: .9
		};
		const GOLD = "212, 175, 55";
		let handLandmarker = null;
		let lastDetectTime = 0;
		const DETECT_COOLDOWN = 16;
		const loadMediaPipe = async () => {
			try {
				const { HandLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
				const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
				handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
					baseOptions: {
						modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
						delegate: "GPU"
					},
					runningMode: "VIDEO",
					numHands: 1
				});
				console.log("[ParticleField] MediaPipe HandLandmarker ready");
			} catch (err) {
				console.error("[ParticleField] MediaPipe init failed:", err);
			}
		};
		loadMediaPipe();
		const tryDetectHand = () => {
			const gs = gestureState.current;
			if (!gs.active || !handLandmarker || !videoRef.current) return;
			if (videoRef.current.readyState < 2) return;
			const now = performance.now();
			if (now - lastDetectTime < DETECT_COOLDOWN) return;
			lastDetectTime = now;
			try {
				const results = handLandmarker.detectForVideo(videoRef.current, now);
				if (results.landmarks && results.landmarks.length > 0) {
					const indexTip = results.landmarks[0][8];
					gs.x = (1 - indexTip.x) * window.innerWidth;
					gs.y = indexTip.y * window.innerHeight;
					landmarksRef.current = results.landmarks[0];
					const lm = results.landmarks[0];
					const thumb = lm[4];
					const indexF = lm[8];
					const isPinch = Math.hypot(thumb.x - indexF.x, thumb.y - indexF.y) < .07;
					if (isPinch) if (!pinchState.current.active) {
						pinchState.current.active = true;
						pinchState.current.prevY = gs.y;
					} else {
						const deltaY = gs.y - pinchState.current.prevY;
						window.scrollBy({
							top: deltaY * 1.5,
							behavior: "instant"
						});
						pinchState.current.prevY = gs.y;
					}
					else pinchState.current.active = false;
					const indexExtended = lm[8].y < lm[6].y;
					const middleExtended = lm[12].y < lm[10].y;
					const ringCurled = lm[16].y > lm[14].y;
					const pinkyCurled = lm[20].y > lm[18].y;
					const thumbCurled = lm[4].y > lm[3].y;
					const allCurled = indexExtended === false && middleExtended === false && ringCurled && pinkyCurled && thumbCurled;
					const allExtended = indexExtended && middleExtended && !ringCurled && !pinkyCurled;
					if (!isPinch) {
						if (allCurled && fistCooldown <= 0) {
							const cx = gs.x;
							const cy = gs.y;
							const gatherRadius = Math.max(w, h) * .45;
							for (let k = 0; k < particles.length; k++) {
								const p = particles[k];
								const dx = cx - p.x;
								const dy = cy - p.y;
								const dist = Math.hypot(dx, dy) || 1;
								const strength = Math.min(18, 6 + dist / gatherRadius * 12);
								p.vx = dx / dist * strength;
								p.vy = dy / dist * strength;
							}
							fistCooldown = 45;
						}
						if (allExtended && fistCooldown <= 0 && peaceCooldown <= 0) {
							const cx = gs.x;
							const cy = gs.y;
							for (let k = 0; k < particles.length; k++) {
								const p = particles[k];
								const angle = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - .5) * .7;
								const speed = 9 + Math.random() * 10;
								p.vx = Math.cos(angle) * speed;
								p.vy = Math.sin(angle) * speed;
							}
							fistCooldown = 50;
						}
					}
				} else {
					pinchState.current.active = false;
					gs.x = -9999;
					gs.y = -9999;
					landmarksRef.current = null;
				}
			} catch {
				pinchState.current.active = false;
				landmarksRef.current = null;
			}
		};
		const resize = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const density = Math.min(90, Math.max(40, Math.floor(w * h / 16e3)));
			particles = Array.from({ length: density }, () => spawn());
			return {
				w,
				h,
				dpr
			};
		};
		const spawn = () => {
			return {
				x: Math.random() * (w || window.innerWidth),
				y: Math.random() * (h || window.innerHeight),
				vx: (Math.random() - .5) * .25,
				vy: (Math.random() - .5) * .25,
				r: Math.random() * 1.4 + .5,
				a: Math.random() * .4 + .18,
				phase: Math.random() * Math.PI * 2
			};
		};
		const onMove = (e) => {
			if (!gestureState.current.active) {
				mouse.x = e.clientX;
				mouse.y = e.clientY;
			}
		};
		const onLeave = () => {
			if (!gestureState.current.active) {
				mouse.x = -9999;
				mouse.y = -9999;
			}
		};
		const draw = () => {
			time += 1;
			ctx.clearRect(0, 0, w, h);
			const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .85);
			grad.addColorStop(0, `rgba(${GOLD},0)`);
			grad.addColorStop(1, `rgba(${GOLD},0.07)`);
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, w, h);
			const gs = gestureState.current;
			if (gs.active) {
				tryDetectHand();
				mouse.x = gs.x;
				mouse.y = gs.y;
			}
			if (mouse.x > -999) {
				const mGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
				mGrad.addColorStop(0, `rgba(${GOLD},0.12)`);
				mGrad.addColorStop(.55, `rgba(${GOLD},0.04)`);
				mGrad.addColorStop(1, `rgba(${GOLD},0)`);
				ctx.fillStyle = mGrad;
				ctx.beginPath();
				ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
				ctx.fill();
			}
			if (gestureState.current.active && overlayRef.current && landmarksRef.current) {
				const overlay = overlayRef.current;
				const rect = overlay.getBoundingClientRect();
				const width = rect.width;
				const height = rect.height;
				if (overlay.width !== Math.floor(width) || overlay.height !== Math.floor(height)) {
					overlay.width = Math.floor(width);
					overlay.height = Math.floor(height);
				}
				const octx = overlay.getContext("2d");
				if (octx) {
					octx.clearRect(0, 0, overlay.width, overlay.height);
					const pts = landmarksRef.current;
					const connections = [
						[0, 1],
						[1, 2],
						[2, 3],
						[3, 4],
						[0, 5],
						[5, 6],
						[6, 7],
						[7, 8],
						[5, 9],
						[9, 10],
						[10, 11],
						[11, 12],
						[9, 13],
						[13, 14],
						[14, 15],
						[15, 16],
						[13, 17],
						[17, 18],
						[18, 19],
						[19, 20],
						[0, 17]
					];
					octx.strokeStyle = "rgba(255, 245, 210, 0.7)";
					octx.lineWidth = 1.5;
					octx.lineCap = "round";
					for (const [i, j] of connections) {
						const a = pts[i];
						const b = pts[j];
						if (!a || !b) continue;
						octx.beginPath();
						octx.moveTo(a.x * overlay.width, a.y * overlay.height);
						octx.lineTo(b.x * overlay.width, b.y * overlay.height);
						octx.stroke();
					}
					octx.fillStyle = "rgba(212, 175, 55, 0.9)";
					for (const lm of pts) {
						octx.beginPath();
						octx.arc(lm.x * overlay.width, lm.y * overlay.height, 2, 0, Math.PI * 2);
						octx.fill();
					}
				}
			}
			const mx = mouse.x;
			const my = mouse.y;
			const farRadius = mouse.radius * 2.8;
			let attractCooldown = 0;
			const nearCenter = [];
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				const driftX = Math.cos(time * 8e-4 + p.phase) * .9;
				const driftY = Math.sin(time * .0012 + p.phase) * .9;
				p.vx += (driftX - p.vx) * .05;
				p.vy += (driftY - p.vy) * .05;
				const dx = mx - p.x;
				const dy = my - p.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < farRadius && dist > 1e-4) {
					const nx = dx / dist;
					const ny = dy / dist;
					const relative = 1 - dist / farRadius;
					const falloff = relative * relative * mouse.influence;
					if (attractCooldown <= 0) {
						p.vx += nx * falloff * .08;
						p.vy += ny * falloff * .08;
					}
					const swirl = falloff * .05 * Math.sin(time * .001 + p.phase);
					p.vx += -ny * swirl;
					p.vy += nx * swirl;
				}
				if (dist < 30) nearCenter.push(i);
			}
			if (nearCenter.length >= 7) {
				for (const i of nearCenter) {
					const p = particles[i];
					const angle = Math.random() * Math.PI * 2;
					const speed = 5 + Math.random() * 4;
					p.vx = Math.cos(angle) * speed;
					p.vy = Math.sin(angle) * speed;
				}
				attractCooldown = 60;
			}
			if (attractCooldown > 0) attractCooldown--;
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				p.vx *= .965;
				p.vy *= .965;
				const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
				if (speed > 1.25) {
					p.vx = p.vx / speed * 1.25;
					p.vy = p.vy / speed * 1.25;
				}
				p.x += p.vx;
				p.y += p.vy;
				const margin = 30;
				if (p.x < -30) p.x = w + margin * .5;
				if (p.x > w + margin) p.x = -30 * .5;
				if (p.y < -30) p.y = h + margin * .5;
				if (p.y > h + margin) p.y = -30 * .5;
				const pulse = Math.sin(time * .002 + p.phase) * .06;
				const alpha = Math.max(0, Math.min(1, p.a + pulse));
				const size = p.r * 3;
				const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
				grd.addColorStop(0, `rgba(255, 245, 210,${alpha})`);
				grd.addColorStop(.2, `rgba(${GOLD},${alpha})`);
				grd.addColorStop(.55, `rgba(${GOLD},${alpha * .5})`);
				grd.addColorStop(1, `rgba(${GOLD},0)`);
				ctx.fillStyle = grd;
				ctx.beginPath();
				ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
				ctx.fill();
			}
			const connDist = 110;
			const connDistSq = connDist * connDist;
			for (let i = 0; i < particles.length; i++) {
				const a = particles[i];
				const ax = a.x - mx;
				const ay = a.y - my;
				if (ax * ax + ay * ay > (farRadius + 40) ** 2) continue;
				for (let j = i + 1; j < particles.length; j++) {
					const b = particles[j];
					const bx = b.x - mx;
					const by = b.y - my;
					if (bx * bx + by * by > (farRadius + 40) ** 2) continue;
					const ddx = a.x - b.x;
					const ddy = a.y - b.y;
					const d2 = ddx * ddx + ddy * ddy;
					if (d2 < connDistSq) {
						ctx.strokeStyle = `rgba(${GOLD},${(1 - d2 / connDistSq) * .22})`;
						ctx.lineWidth = .5;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					}
				}
			}
			if (peaceCooldown > 0) peaceCooldown--;
			if (fistCooldown > 0) fistCooldown--;
			if (!reduced) raf = requestAnimationFrame(draw);
		};
		const state = resize();
		w = state.w;
		h = state.h;
		draw();
		window.addEventListener("resize", resize);
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseleave", onLeave);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseleave", onLeave);
			if (gestureState.current.active) {
				const video = videoRef.current;
				const pipVideo = pipVideoRef.current;
				if (video?.srcObject) {
					video.srcObject.getTracks().forEach((t) => t.stop());
					video.srcObject = null;
				}
				if (pipVideo?.srcObject) pipVideo.srcObject = null;
			}
		};
	}, []);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("canvas", {
			ref,
			"aria-hidden": "true",
			className: "fixed inset-0 z-0 h-[100dvh] w-[100dvw] pointer-events-none"
		}),
		/* @__PURE__ */ jsx("video", {
			ref: videoRef,
			playsInline: true,
			muted: true,
			className: "hidden",
			"aria-hidden": "true"
		}),
		(gestureEnabled || cameraStatus === "error") && /* @__PURE__ */ jsxs("div", {
			className: "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2",
			children: [gestureEnabled && cameraStatus === "ready" && /* @__PURE__ */ jsxs("div", {
				className: "relative overflow-hidden rounded-xl border border-white/10 shadow-2xl ring-1 ring-white/5",
				children: [/* @__PURE__ */ jsx("video", {
					ref: pipVideoRef,
					playsInline: true,
					muted: true,
					autoPlay: true,
					className: "h-36 w-48 -scale-x-100 object-cover",
					"aria-label": "Camera preview"
				}), /* @__PURE__ */ jsx("canvas", {
					ref: overlayRef,
					className: "absolute inset-0 -scale-x-100 pointer-events-none",
					"aria-hidden": "true"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [errorMessage && /* @__PURE__ */ jsx("span", {
					className: "rounded-md bg-red-500/80 px-2 py-1 text-xs text-white",
					children: errorMessage
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: toggleGesture,
					className: "rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20",
					"aria-pressed": gestureEnabled,
					children: gestureEnabled ? "Disable Gestures" : "Enable Gestures"
				})]
			})]
		}),
		!gestureEnabled && cameraStatus === "idle" && /* @__PURE__ */ jsx("div", {
			className: "fixed bottom-4 right-4 z-50",
			children: /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: toggleGesture,
				className: "rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/60 backdrop-blur-md transition hover:bg-white/10 hover:text-white/80",
				children: "Hand Control"
			})
		})
	] });
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
		blurb: "A distributed system that doesn't flinch at scale. Automated rollouts, zero-downtime deployments, horizontal growth — stability as design, not luck.",
		href: "https://github.com/0xakhii"
	},
	{
		n: "02",
		tag: "WebSockets · Redis",
		name: "Pongify",
		blurb: "A game played in real time across distances. Shaved latency not by chasing numbers, but by removing everything unnecessary between the signal and the answer.",
		href: "https://github.com/0xakhii"
	},
	{
		n: "03",
		tag: "C++ · TCP/IP",
		name: "FT_IRC",
		blurb: "Built for when protocols have to speak in parallel without stuttering. Concurrency not as a feature, but as the only honest way to handle fifty simultaneous truths.",
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
		"Built an end-to-end IoT platform for qPCR machines — from edge agent to cloud backend — as the sole engineer.",
		"Designed a backend with twenty-plus endpoints, persisted state, and container orchestration that behaved predictably under load.",
		"Established CI pipelines that tested and deployed every service without shortcuts or late-night assumptions."
	]
}, {
	role: "AI Engineering Intern",
	company: "SMValley",
	period: "2025",
	location: "Agadir, MA",
	current: false,
	bullets: [
		"Designed a real-time voice pipeline for elderly users — speech to meaning to speech, across live connections.",
		"Created a decorator-based tool framework that let healthcare actions speak for themselves without wiring.",
		"Threaded multilingual understanding through the interface — Darija and French, because context isn't optional for humans."
	]
}];
function Portfolio() {
	return /* @__PURE__ */ jsxs("main", {
		className: "relative min-h-screen text-foreground antialiased w-full overflow-x-hidden",
		children: [
			/* @__PURE__ */ jsx(ParticleField, {}),
			/* @__PURE__ */ jsx("nav", {
				className: "fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/20 border-b border-white/[0.12] shadow-[0_4px_30px_rgba(0,0,0,0.35)]",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6",
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
							className: "hidden items-center gap-4 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:flex md:gap-7",
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
							className: "inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors md:text-[11px]",
							children: [/* @__PURE__ */ jsx(Download, { className: "size-3.5" }), " CV"]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "h-[56px] sm:h-[60px]",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ jsxs("div", {
				id: "top",
				className: "relative z-10 mx-auto flex max-w-7xl flex-col gap-16 sm:gap-24 md:gap-28 px-4 pb-24 sm:px-6 md:px-8",
				children: [
					/* @__PURE__ */ jsxs("section", {
						className: "relative pt-6",
						children: [
							/* @__PURE__ */ jsxs("h1", {
								className: "font-display mt-5 text-5xl font-extrabold leading-[0.9] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl",
								children: [
									"OMAR",
									/* @__PURE__ */ jsx("br", {}),
									"JAMAL"
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-10 flex items-start gap-5",
								children: [/* @__PURE__ */ jsx("div", { className: "mt-3 h-px w-14 shrink-0 bg-primary" }), /* @__PURE__ */ jsx("p", {
									className: "max-w-md text-base font-light leading-relaxed text-muted-foreground",
									children: "Builder of systems that carry weight beyond the moment they were made. Quiet, precise, finished."
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-display text-[11px] uppercase tracking-[0.22em] text-muted-foreground",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-primary live-dot" }), "Open ·"]
									}),
									/* @__PURE__ */ jsx("span", { children: "Marrakech, MA" }),
									/* @__PURE__ */ jsx("span", { children: "1337 · 42" })
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
						className: "font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
						children: "/ Philosophy"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-6 text-xl font-light leading-snug text-foreground/90 sm:text-2xl",
						children: "I shape what outlasts the shape. Not for keeping, not for showing — for the silence that comes after and finds nothing broken."
					})] }),
					/* @__PURE__ */ jsxs("section", {
						id: "stack",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
							children: "/ Arsenal"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 md:grid-cols-3",
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
						className: "space-y-10 sm:space-y-14 md:space-y-16",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between gap-4",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "font-display text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-primary",
								children: "/ Selected Works"
							}), /* @__PURE__ */ jsxs("a", {
								href: "https://github.com/0xakhii",
								target: "_blank",
								rel: "noreferrer",
								className: "hidden shrink-0 items-center gap-1 font-display text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary md:flex",
								children: ["All on GitHub ", /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5" })]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-10 sm:space-y-14 md:space-y-16",
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
							className: "mt-8 space-y-10 sm:space-y-14 border-l border-border/60 pl-5 sm:pl-7",
							children: experience.map((e) => /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ jsx("div", { className: `absolute -left-[26px] top-1.5 size-2 sm:-left-[33px] ${e.current ? "bg-primary" : "bg-muted-foreground/40"}` }),
									/* @__PURE__ */ jsx("p", {
										className: "font-display text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-primary",
										children: e.period
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-display mt-2 text-base sm:text-lg font-bold uppercase tracking-wide text-foreground",
										children: e.role
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1 text-xs sm:text-sm text-muted-foreground",
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
						className: "border-t border-primary/20 pt-10 sm:pt-14",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl",
								children: "LET'S BUILD."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 sm:mt-5 max-w-md text-sm font-light leading-relaxed text-muted-foreground",
								children: "If you need something built to last — a system, a pipeline, a product — write."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-8 sm:mt-10 md:mt-12 flex flex-col",
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
										href: "tel:+212****9115"
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
							children: "© 2027 Omar Jamal"
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
