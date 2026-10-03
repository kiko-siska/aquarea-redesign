/**
 * V9 · the dive torch. A soft beam lights the dark water and the diver (CSS radial gradients read --tx/--ty/--r on
 * the stage); marine snow (a small 2D canvas) drifts and only glows inside the beam. The beam follows a fine pointer,
 * is aimed by dragging on touch, and otherwise wanders on a Lissajous path so the hero never looks dead.
 * Runs only while the stage is live and not paused / off-screen / hidden (main.ts sets those attributes), DPR ≤ 1.5.
 * Under reduced motion the stage is not live until the visitor presses play: one still frame, torch parked.
 */
export function initTorch(stage: HTMLElement) {
  const canvas = stage.querySelector<HTMLCanvasElement>('.v9-snow');
  const ctx = canvas?.getContext('2d') ?? null;
  const rect = () => canvas!.getBoundingClientRect();
  let W = 1, H = 1, pr = 1;
  const mobile = matchMedia('(max-width: 1023px)').matches;
  const N = mobile ? 55 : 110;
  const flakes = Array.from({ length: N }, (_, i) => ({ x: ((i * 0.618) % 1), y: ((i * 0.377) % 1), z: 0.3 + ((i * 0.231) % 0.7), p: i * 1.7 }));
  const torch = { x: 0.36, y: 0.48, tx: 0.36, ty: 0.48, mode: 'idle' as 'idle' | 'pointer' | 'touch', touchEnd: 0 };
  let raf = 0, last = 0, t = 0;

  const resize = () => {
    if (!canvas) return;
    pr = Math.min(window.devicePixelRatio || 1, 1.5);
    const r = rect();
    W = Math.max(1, Math.round(r.width * pr)); H = Math.max(1, Math.round(r.height * pr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  };
  const radiusPx = () => Math.min(460, Math.max(190, Math.min(rect().width, rect().height) * 0.55));
  const active = () => stage.hasAttribute('data-live') && !stage.hasAttribute('data-paused') && !stage.hasAttribute('data-offscreen') && !document.hidden;

  const paint = () => {
    const r = rect();
    stage.style.setProperty('--tx', `${(torch.x * r.width).toFixed(1)}px`);
    stage.style.setProperty('--ty', `${(torch.y * r.height).toFixed(1)}px`);
    stage.style.setProperty('--r', `${radiusPx().toFixed(0)}px`);
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const R = radiusPx() * pr, cx = torch.x * W, cy = torch.y * H;
    for (const f of flakes) {
      const x = ((f.x + Math.sin(t * 0.12 * f.z + f.p) * 0.02 + 1) % 1) * W;
      const y = ((f.y + t * 0.012 * f.z + 1) % 1) * H;
      const d = Math.hypot(x - cx, y - cy) / R;
      const a = 0.1 + 0.8 * Math.pow(Math.max(0, 1 - d), 1.6);
      ctx.fillStyle = `rgba(255,246,228,${(a * f.z).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, (0.8 + f.z * 1.8) * pr, 0, 6.283); ctx.fill();
    }
  };
  const frame = (now: number) => {
    raf = 0;
    if (!active()) { paint(); return; }
    const dt = Math.min((now - (last || now)) / 1000, 0.05); last = now; t += dt;
    if (torch.mode === 'touch' && performance.now() - torch.touchEnd > 2200) torch.mode = 'idle';
    if (torch.mode === 'idle') { torch.tx = 0.5 + 0.3 * Math.sin(t * 0.37); torch.ty = 0.46 + 0.22 * Math.sin(t * 0.53 + 1.3); }
    const k = 1 - Math.exp(-dt / (torch.mode === 'idle' ? 0.8 : 0.08));
    torch.x += (torch.tx - torch.x) * k; torch.y += (torch.ty - torch.y) * k;
    paint();
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { resize(); if (active()) { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } } else { cancelAnimationFrame(raf); raf = 0; paint(); } };

  const aim = (e: PointerEvent, mode: 'pointer' | 'touch') => {
    if (!active()) return;
    const r = rect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05) { if (mode === 'pointer') torch.mode = 'idle'; return; }
    torch.mode = mode; torch.tx = x; torch.ty = y;
    if (mode === 'touch') torch.touchEnd = performance.now();
  };
  stage.addEventListener('pointermove', (e) => aim(e, e.pointerType === 'touch' ? 'touch' : 'pointer'), { passive: true });
  stage.addEventListener('pointerdown', (e) => aim(e, e.pointerType === 'touch' ? 'touch' : 'pointer'), { passive: true });
  stage.addEventListener('pointerleave', () => { if (torch.mode === 'pointer') torch.mode = 'idle'; });
  new MutationObserver(kick).observe(stage, { attributes: true, attributeFilter: ['data-live', 'data-paused', 'data-offscreen'] });
  document.addEventListener('visibilitychange', kick);
  new ResizeObserver(kick).observe(stage);
  kick();
  (window as unknown as { __v9: object }).__v9 = { get running() { return raf !== 0; }, get torch() { return { ...torch }; } };
}
