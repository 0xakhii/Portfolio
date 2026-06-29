import { useEffect, useRef, useState, useCallback } from "react";

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  phase: number;
};

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const landmarksRef = useRef<any>(null);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // These are updated by the effect; reads are safe outside React render
  const gestureState = useRef({ x: -9999, y: -9999, active: false });
  const pinchState = useRef({ active: false, prevY: 0 });

  const toggleGesture = useCallback(async () => {
    const next = !gestureState.current.active;
    gestureState.current.active = next;
    setGestureEnabled(next);

    if (next) {
      setCameraStatus("loading");
      setErrorMessage(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
        });
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
        setErrorMessage(
          err instanceof Error ? err.message : "Camera unavailable"
        );
      }
    } else {
      // stop camera
      const video = videoRef.current;
      const pipVideo = pipVideoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
        video.srcObject = null;
      }
      if (pipVideo?.srcObject) {
        pipVideo.srcObject = null;
      }
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
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let particles: P[] = [];
    let time = 0;
    let peaceCooldown = 0;
    let fistCooldown = 0;

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 100,
      influence: 0.9,
    };

    const GOLD = "212, 175, 55";

    // ---------------------------------------------------------------------------
    // MediaPipe Hands (Tasks Vision API)
    // ---------------------------------------------------------------------------
    let handLandmarker: any = null;
    let lastDetectTime = 0;
    const DETECT_COOLDOWN = 16; // ~1 frame at 60fps (ms)

    const loadMediaPipe = async () => {
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const { HandLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        console.log("[ParticleField] MediaPipe HandLandmarker ready");
      } catch (err) {
        console.error("[ParticleField] MediaPipe init failed:", err);
      }
    };

    // Kick off background load
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
          const indexTip = results.landmarks[0][8]; // index fingertip
          // Mirror x for natural mirror feel; y stays as-is
          gs.x = (1 - indexTip.x) * window.innerWidth;
          gs.y = indexTip.y * window.innerHeight;
          landmarksRef.current = results.landmarks[0];

          const lm = results.landmarks[0];

          // Pinch detection: thumb tip (4) + index tip (8)
          const thumb = lm[4];
          const indexF = lm[8];
          const pinchDist = Math.hypot(thumb.x - indexF.x, thumb.y - indexF.y);
          const isPinch = pinchDist < 0.07;
          if (isPinch) {
            if (!pinchState.current.active) {
              pinchState.current.active = true;
              pinchState.current.prevY = gs.y;
            } else {
              const deltaY = gs.y - pinchState.current.prevY;
              window.scrollBy({ top: deltaY * 1.5, behavior: "instant" });
              pinchState.current.prevY = gs.y;
            }
          } else {
            pinchState.current.active = false;
          }

          // Gesture helpers
          const indexExtended = lm[8].y < lm[6].y;
          const middleExtended = lm[12].y < lm[10].y;
          const ringCurled = lm[16].y > lm[14].y;
          const pinkyCurled = lm[20].y > lm[18].y;
          const thumbCurled = lm[4].y > lm[3].y;
          const allCurled =
            indexExtended === false &&
            middleExtended === false &&
            ringCurled &&
            pinkyCurled &&
            thumbCurled;
          const allExtended =
            indexExtended &&
            middleExtended &&
            !ringCurled &&
            !pinkyCurled;

          // Gesture priority: pinch > open hand > fist
          if (!isPinch) {
            // Fist → gather ALL particles to hand center
            if (allCurled && fistCooldown <= 0) {
              const cx = gs.x;
              const cy = gs.y;
              const gatherRadius = Math.max(w, h) * 0.45;
              for (let k = 0; k < particles.length; k++) {
                const p = particles[k];
                const dx = cx - p.x;
                const dy = cy - p.y;
                const dist = Math.hypot(dx, dy) || 1;
                const strength = Math.min(18, 6 + (dist / gatherRadius) * 12);
                p.vx = (dx / dist) * strength;
                p.vy = (dy / dist) * strength;
              }
              fistCooldown = 45;
            }

            // Open hand → burst ALL particles outward in full-screen directions
            if (allExtended && fistCooldown <= 0 && peaceCooldown <= 0) {
              const cx = gs.x;
              const cy = gs.y;
              for (let k = 0; k < particles.length; k++) {
                const p = particles[k];
                const angle = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.7;
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

    // ---------------------------------------------------------------------------
    // Particle system (logic unchanged, mouse now includes gesture fallback)
    // ---------------------------------------------------------------------------
    type ResizeState = { w: number; h: number; dpr: number };

    const resize = (): ResizeState => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(90, Math.max(40, Math.floor((w * h) / 16000)));
      particles = Array.from({ length: density }, () => spawn());
      return { w, h, dpr };
    };

    const spawn = (): P => {
      const x = Math.random() * (w || window.innerWidth);
      const y = Math.random() * (h || window.innerHeight);
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.5,
        a: Math.random() * 0.4 + 0.18,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const onMove = (e: MouseEvent) => {
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

      // soft radial vignette
      const grad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.2,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.85
      );
      grad.addColorStop(0, `rgba(${GOLD},0)`);
      grad.addColorStop(1, `rgba(${GOLD},0.07)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // resolve effective cursor position
      const gs = gestureState.current;
      if (gs.active) {
        tryDetectHand();
        mouse.x = gs.x;
        mouse.y = gs.y;
      }

      // cursor glow
      if (mouse.x > -999) {
        const mGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          140
        );
        mGrad.addColorStop(0, `rgba(${GOLD},0.12)`);
        mGrad.addColorStop(0.55, `rgba(${GOLD},0.04)`);
        mGrad.addColorStop(1, `rgba(${GOLD},0)`);
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw hand landmarks on PiP overlay
      if (gestureState.current.active && overlayRef.current && landmarksRef.current) {
        const overlay = overlayRef.current;
        const rect = overlay.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (overlay.width !== Math.floor(width) || overlay.height !== Math.floor(height)) {
          overlay.width = Math.floor(width);
          overlay.height = Math.floor(height);
        }
        const octx = overlay.getContext('2d');
        if (octx) {
          octx.clearRect(0, 0, overlay.width, overlay.height);
          const pts = landmarksRef.current;
          const connections = [
            [0,1],[1,2],[2,3],[3,4],
            [0,5],[5,6],[6,7],[7,8],
            [5,9],[9,10],[10,11],[11,12],
            [9,13],[13,14],[14,15],[15,16],
            [13,17],[17,18],[18,19],[19,20],
            [0,17]
          ];
          octx.strokeStyle = 'rgba(255, 245, 210, 0.7)';
          octx.lineWidth = 1.5;
          octx.lineCap = 'round';
          for (const [i, j] of connections) {
            const a = pts[i];
            const b = pts[j];
            if (!a || !b) continue;
            octx.beginPath();
            octx.moveTo(a.x * overlay.width, a.y * overlay.height);
            octx.lineTo(b.x * overlay.width, b.y * overlay.height);
            octx.stroke();
          }
          octx.fillStyle = 'rgba(212, 175, 55, 0.9)';
          for (const lm of pts) {
            octx.beginPath();
            octx.arc(lm.x * overlay.width, lm.y * overlay.height, 2, 0, Math.PI * 2);
            octx.fill();
          }
        }
      }

      const mx = mouse.x;
      const my = mouse.y;
      const mRadius = mouse.radius;
      const farRadius = mRadius * 2.8;
      let attractCooldown = 0;
      const nearCenter: number[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const driftX = Math.cos(time * 0.0008 + p.phase) * 0.9;
        const driftY = Math.sin(time * 0.0012 + p.phase) * 0.9;
        p.vx += (driftX - p.vx) * 0.05;
        p.vy += (driftY - p.vy) * 0.05;

        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < farRadius && dist > 0.0001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const relative = 1 - dist / farRadius;
          const falloff = relative * relative * mouse.influence;

          if (attractCooldown <= 0) {
            p.vx += nx * falloff * 0.08;
            p.vy += ny * falloff * 0.08;
          }

          const swirl = falloff * 0.05 * Math.sin(time * 0.001 + p.phase);
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

        p.vx *= 0.965;
        p.vy *= 0.965;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.25) {
          p.vx = (p.vx / speed) * 1.25;
          p.vy = (p.vy / speed) * 1.25;
        }

        p.x += p.vx;
        p.y += p.vy;

        const margin = 30;
        if (p.x < -margin) p.x = w + margin * 0.5;
        if (p.x > w + margin) p.x = -margin * 0.5;
        if (p.y < -margin) p.y = h + margin * 0.5;
        if (p.y > h + margin) p.y = -margin * 0.5;

        const pulse = Math.sin(time * 0.002 + p.phase) * 0.06;
        const alpha = Math.max(0, Math.min(1, p.a + pulse));

        const size = p.r * 3;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        grd.addColorStop(0, `rgba(255, 245, 210,${alpha})`);
        grd.addColorStop(0.2, `rgba(${GOLD},${alpha})`);
        grd.addColorStop(0.55, `rgba(${GOLD},${alpha * 0.5})`);
        grd.addColorStop(1, `rgba(${GOLD},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // connection lines (only near cursor for interactivity)
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
            const relative = 1 - d2 / connDistSq;
            ctx.strokeStyle = `rgba(${GOLD},${relative * 0.22})`;
            ctx.lineWidth = 0.5;
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
      // stop camera if gesture mode was active
      if (gestureState.current.active) {
        const video = videoRef.current;
        const pipVideo = pipVideoRef.current;
        if (video?.srcObject) {
          (video.srcObject as MediaStream)
            .getTracks()
            .forEach((t) => t.stop());
          video.srcObject = null;
        }
        if (pipVideo?.srcObject) {
          pipVideo.srcObject = null;
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------------------------
  // UI: PiP preview + toggle
  // -----------------------------------------------------------------------------
  return (
    <>
      <canvas
        ref={ref}
        aria-hidden="true"
        className="fixed inset-0 z-0 h-[100dvh] w-[100dvw] pointer-events-none"
      />

      {/* Hidden video for MediaPipe (used by the draw-loop detector) */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
        aria-hidden="true"
      />

      {/* PiP overlay — rendered when gesture mode is active or errored */}
      {(gestureEnabled || cameraStatus === "error") && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          {gestureEnabled && cameraStatus === "ready" && (
            <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
              <video
                ref={pipVideoRef}
                playsInline
                muted
                autoPlay
                className="h-36 w-48 -scale-x-100 object-cover"
                aria-label="Camera preview"
              />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 -scale-x-100 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {errorMessage && (
              <span className="rounded-md bg-red-500/80 px-2 py-1 text-xs text-white">
                {errorMessage}
              </span>
            )}
            <button
              type="button"
              onClick={toggleGesture}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
              aria-pressed={gestureEnabled}
            >
              {gestureEnabled ? "Disable Gestures" : "Enable Gestures"}
            </button>
          </div>
        </div>
      )}

      {/* Idle state: subtle prompt */}
      {!gestureEnabled && cameraStatus === "idle" && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            type="button"
            onClick={toggleGesture}
            className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/60 backdrop-blur-md transition hover:bg-white/10 hover:text-white/80"
          >
            Hand Control
          </button>
        </div>
      )}
    </>
  );
}
