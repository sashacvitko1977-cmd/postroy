/**
 * Hero atmosphere: floating light motes + soft cursor glow
 * On-brand for PoStroy — air, horizon, calm luxury
 */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const hero = document.getElementById("hero");
  if (!hero) return;

  const isMobile = () =>
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-fx";
  canvas.setAttribute("aria-hidden", "true");
  hero.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  let raf = 0;
  let mx = 0.5;
  let my = 0.4;
  let tmx = 0.5;
  let tmy = 0.4;
  let hasPointer = false;
  let t0 = performance.now();

  function count() {
    return isMobile() ? 42 : 72;
  }

  function spawn(p) {
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    p.z = 0.35 + Math.random() * 0.65; // depth
    p.vx = (Math.random() - 0.5) * 0.25 * p.z;
    p.vy = -0.08 - Math.random() * 0.22 * p.z; // drift up (air)
    p.r = (1.2 + Math.random() * 2.8) * p.z;
    p.a = 0.15 + Math.random() * 0.45;
    p.phase = Math.random() * Math.PI * 2;
    p.twinkle = 0.6 + Math.random() * 1.4;
    // frost / glacier / soft white
    const palette = [
      [184, 212, 227],
      [142, 180, 201],
      [255, 255, 255],
      [220, 234, 242],
    ];
    p.c = palette[(Math.random() * palette.length) | 0];
    return p;
  }

  function initParticles() {
    const n = count();
    particles = [];
    for (let i = 0; i < n; i++) particles.push(spawn({}));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 2);
    const rect = hero.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
    mx = w * 0.5;
    my = h * 0.4;
    tmx = mx;
    tmy = my;
  }

  function toLocal(cx, cy) {
    const rect = hero.getBoundingClientRect();
    return {
      x: cx - rect.left,
      y: cy - rect.top,
      inside:
        cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom,
    };
  }

  function onMove(e) {
    if (e.pointerType === "touch" && e.isPrimary === false) return;
    const p = toLocal(e.clientX, e.clientY);
    if (!p.inside) {
      hasPointer = false;
      return;
    }
    hasPointer = true;
    tmx = p.x;
    tmy = p.y;
  }

  function onDown(e) {
    if (e.pointerType === "touch" && e.isPrimary === false) return;
    const p = toLocal(e.clientX, e.clientY);
    if (!p.inside) return;
    hasPointer = true;
    tmx = p.x;
    tmy = p.y;
    mx = p.x;
    my = p.y;
    // Soft burst near touch
    for (let i = 0; i < 6; i++) {
      const q = particles[(Math.random() * particles.length) | 0];
      if (!q) continue;
      q.x = p.x + (Math.random() - 0.5) * 40;
      q.y = p.y + (Math.random() - 0.5) * 40;
      q.vx += (Math.random() - 0.5) * 1.2;
      q.vy += (Math.random() - 0.5) * 1.2;
      q.a = Math.min(0.9, q.a + 0.3);
    }
  }

  function draw(now) {
    const dt = Math.min(32, now - t0);
    t0 = now;
    const time = now * 0.001;

    mx += (tmx - mx) * 0.08;
    my += (tmy - my) * 0.08;

    // Idle drift of "focus" when no pointer
    if (!hasPointer) {
      tmx = w * (0.5 + Math.sin(time * 0.35) * 0.2);
      tmy = h * (0.38 + Math.cos(time * 0.28) * 0.1);
    }

    ctx.clearRect(0, 0, w, h);

    // Soft radial glow near cursor (air light)
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(w, h) * 0.35);
    g.addColorStop(0, "rgba(184,212,227,0.14)");
    g.addColorStop(0.45, "rgba(142,180,201,0.06)");
    g.addColorStop(1, "rgba(142,180,201,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Gentle attraction to cursor
      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const range = isMobile() ? 140 : 180;
      if (dist < range) {
        const f = (1 - dist / range) * 0.018 * p.z;
        p.vx += dx * f;
        p.vy += dy * f;
      }

      // Side sway (wind)
      p.vx += Math.sin(time * p.twinkle + p.phase) * 0.004;
      p.x += p.vx * (dt * 0.06);
      p.y += p.vy * (dt * 0.06);
      p.vx *= 0.98;
      p.vy *= 0.99;

      // Wrap / recycle
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      const tw = 0.55 + 0.45 * Math.sin(time * p.twinkle + p.phase);
      const alpha = p.a * tw;
      const [r, g0, b] = p.c;

      // Glow core
      const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      rg.addColorStop(0, `rgba(${r},${g0},${b},${alpha * 0.9})`);
      rg.addColorStop(0.4, `rgba(${r},${g0},${b},${alpha * 0.35})`);
      rg.addColorStop(1, `rgba(${r},${g0},${b},0)`);
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g0},${b},${alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerdown", onDown, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      const vis = entries[0]?.isIntersecting;
      if (vis && !raf) {
        t0 = performance.now();
        raf = requestAnimationFrame(draw);
      }
      if (!vis && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { threshold: 0.05 }
  );
  io.observe(hero);
  raf = requestAnimationFrame(draw);
})();
