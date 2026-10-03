/**
 * Water light: a calm caustics layer drawn over a real photo, inside its frame only (never under text).
 * The <img> is the poster and the LCP element; this canvas mounts after `load` + idle and fades in on top.
 * - Raw WebGL2 (no three.js), one fullscreen triangle, the photo as a texture, light added only where the
 *   photo is water-coloured. Pointer / touch drops a gentle ripple.
 * - DPR ≤ 1.5. The loop stops when the frame is off-screen or the tab is hidden.
 * - Reduced motion: one still frame, no loop, no ripples (it still looks finished frozen).
 * - No WebGL2, a shader error or a lost context: the canvas is removed and the photo stays.
 */
import { prefersReducedMotion } from './reduced';

const VERT = `#version 300 es
in vec2 p; out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas px
uniform vec2 uCover;    // uv scale for object-fit: cover
uniform float uTime;
uniform vec4 uRip[4];   // x, y (0..1, y down), start time, amplitude
in vec2 vUv; out vec4 o;

// caustic web (after "water turbulence" by joltz0r, CC0-style shader folklore)
float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.2831 * 1.6, 6.2831) - 250.0;
  vec2 i = p; float c = 1.0; float k = 0.005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / k), p.y / (cos(i.y + tt) / k)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);                 // y down, like the page
  float asp = uRes.x / uRes.y;
  vec2 disp = vec2(0.0); float ring = 0.0;
  for (int n = 0; n < 4; n++) {
    vec4 r = uRip[n];
    float age = uTime - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 2.6) continue;
    vec2 d = (uv - r.xy) * vec2(asp, 1.0);
    float dist = length(d);
    float x = dist - age * 0.22;
    float w = sin(x * 60.0) * exp(-x * x * 300.0) * exp(-age * 1.6) * r.w;
    disp += normalize(d + 1e-5) * w * 0.006;
    ring += w;
  }
  vec2 tuv = (uv + disp - 0.5) * uCover + 0.5;
  vec3 photo = texture(uTex, tuv).rgb;
  float water = smoothstep(0.02, 0.22, photo.b - photo.r) * smoothstep(0.15, 0.45, photo.g + photo.b * 0.5);
  float light = caustic(uv * vec2(asp, 1.0) * 0.9 + disp * 4.0, uTime * 0.35) * 0.55
              + caustic(uv * vec2(asp, 1.0) * 1.7 + 3.1, uTime * 0.28) * 0.25;
  vec3 col = photo + vec3(0.82, 1.0, 0.97) * light * water * 0.32 + vec3(1.0) * ring * water * 0.05;
  o = vec4(min(col, vec3(1.0)), 1.0);
}`;

const ICON_PAUSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>';
const ICON_PLAY = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

export function waterLight(frame: HTMLElement, img: HTMLImageElement, labels = { pause: 'Zastaviť pohyb vody', play: 'Spustiť pohyb vody' }) {
  const reduce = prefersReducedMotion();
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .8s ease;pointer-events:none';
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const compile = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u('uRes'), uCover = u('uCover'), uTime = u('uTime'), uRip = u('uRip');

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); } catch { return null; }

  const ripples = new Float32Array(16);
  let slot = 0, start = performance.now(), raf = 0, visible = true, alive = true, frames = 0;
  const now = () => (performance.now() - start) / 1000;

  const resize = () => {
    const pr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(frame.clientWidth * pr)), h = Math.max(1, Math.round(frame.clientHeight * pr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ca = w / h, ia = img.naturalWidth / img.naturalHeight;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    gl.uniform2f(uCover, ca > ia ? 1 : ca / ia, ca > ia ? ia / ca : 1);
  };
  const draw = (t: number) => {
    gl.uniform1f(uTime, t);
    gl.uniform4fv(uRip, ripples);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frames++;
    if (frames === 1) requestAnimationFrame(() => { canvas.style.opacity = '1'; });
  };
  let paused = false, pausedAt = 0;
  const loop = () => { raf = 0; if (!alive || !visible || paused || document.hidden) return; draw(now()); raf = requestAnimationFrame(loop); };
  const kick = () => { if (!reduce && !raf && alive && visible && !paused && !document.hidden) raf = requestAnimationFrame(loop); };

  frame.append(canvas);
  resize();
  // a visible pause control for the moving water (WCAG 2.2.2); not needed when motion is reduced
  let toggle: HTMLButtonElement | null = null;
  if (!reduce) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'm-water-toggle';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', labels.pause);
    toggle.innerHTML = ICON_PAUSE;
    toggle.addEventListener('click', () => {
      paused = !paused;
      if (paused) { pausedAt = now(); cancelAnimationFrame(raf); raf = 0; }
      else { start = performance.now() - pausedAt * 1000; kick(); }
      toggle!.setAttribute('aria-pressed', String(paused));
      toggle!.setAttribute('aria-label', paused ? labels.play : labels.pause);
      toggle!.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
    });
    frame.append(toggle);
  }
  if (reduce) { draw(3.2); } else { kick(); }

  const ro = new ResizeObserver(() => { resize(); if (reduce) draw(3.2); });
  ro.observe(frame);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
  io.observe(frame);
  const onVis = () => kick();
  document.addEventListener('visibilitychange', onVis);

  let last = 0;
  const drop = (e: PointerEvent, amp: number) => {
    if (reduce || paused || (e.target as HTMLElement).closest('button')) return;
    const r = frame.getBoundingClientRect();
    ripples.set([(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, now(), amp], (slot++ % 4) * 4);
  };
  const onMove = (e: PointerEvent) => { const t = performance.now(); if (t - last > 140) { last = t; drop(e, 0.35); } };
  const onDown = (e: PointerEvent) => drop(e, 1);
  frame.addEventListener('pointermove', onMove, { passive: true });
  frame.addEventListener('pointerdown', onDown, { passive: true });

  const destroy = () => {
    alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    frame.removeEventListener('pointermove', onMove); frame.removeEventListener('pointerdown', onDown);
    canvas.remove(); toggle?.remove();
  };
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); destroy(); });
  return { destroy, get frames() { return frames; }, get running() { return raf !== 0; }, get paused() { return paused; } };
}
