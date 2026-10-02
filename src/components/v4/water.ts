/**
 * V4 · Čierna voda: black water + dive torch, one fullscreen fragment shader and a
 * marine-snow Points layer (three.js). Real aquarea.sk photos are sampled through the
 * refracting surface and only come to life inside the beam.
 *
 * The render loop is driven from outside (gsap.ticker), so the page can pause it when the
 * tab is hidden or the water is scrolled away. Loaded only by /variants/4/ (dynamic import).
 */
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Camera, LinearFilter, Mesh, NoColorSpace,
  PlaneGeometry, Points, Scene, ShaderMaterial, Texture, TextureLoader, Vector2, Vector4, WebGLRenderer,
} from 'three';

export type WaterPhoto = { id: string; url: string; w: number; h: number };

const RIPPLES = 8;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uView;
uniform float uPr;
uniform vec2 uTorch;
uniform float uTorchOn;
uniform float uRadius;
uniform float uScroll;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uAspA;
uniform float uAspB;
uniform float uMix;
uniform float uGainA;
uniform float uGainB;
uniform vec4 uRipples[${RIPPLES}];
varying vec2 vUv;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.02 + vec2(17.0, 9.2); a *= 0.5; }
  return v;
}
float fbm4(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(11.0, 5.7); a *= 0.5; }
  return v;
}

// expanding rings from taps/clicks (ring buffer: x, y in CSS px, start time, amplitude)
float ripples(vec2 px, float unit) {
  float h = 0.0;
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 3.6) continue;
    float d = length(px - r.xy) / unit;
    float x = d - age * 0.3;
    h += sin(x * 72.0) * exp(-x * x * 240.0) * exp(-age * 1.1) * r.w;
  }
  return h;
}

float surface(vec2 p, vec2 q, vec2 px, float unit) {
  float t = uTime;
  return fbm4(p * 2.1 + 1.7 * q + vec2(t * 0.025, -t * 0.018)) + ripples(px, unit) * 0.085;
}

vec2 coverUv(vec2 uv, float texAsp, float scrAsp) {
  vec2 s = scrAsp > texAsp ? vec2(1.0, texAsp / scrAsp) : vec2(scrAsp / texAsp, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uView.y * uPr - gl_FragCoord.y) / uPr;   // CSS px, top-left origin
  float unit = min(uView.x, uView.y);
  float t = uTime;
  vec2 p = px / unit + vec2(0.0, uScroll * 0.35);

  // domain-warped surface + normal from finite differences
  vec2 q = vec2(fbm3(p * 1.3 + vec2(0.0, t * 0.04)), fbm3(p * 1.3 + vec2(5.2, 1.3) - t * 0.035));
  float e = 1.5 / unit;
  float h  = surface(p, q, px, unit);
  float hx = surface(p + vec2(e, 0.0), q, px + vec2(1.5, 0.0), unit);
  float hy = surface(p + vec2(0.0, e), q, px + vec2(0.0, 1.5), unit);
  vec2 slope = vec2(h - hx, h - hy) / e;
  vec3 n = normalize(vec3(slope * 0.16, 1.0));

  // the torch cone
  float d = length(px - uTorch) / uRadius;
  float beam = 1.0 - smoothstep(0.0, 1.0, d);
  beam *= beam;
  float core = 1.0 - smoothstep(0.0, 0.42, d);
  float on = uTorchOn;
  float light = on * (beam * 0.95 + core * 0.22);

  // real photo under the surface, refracted
  float scrAsp = uView.x / uView.y;
  vec2 refr = slope * vec2(0.010, -0.010) * (0.45 + beam);
  vec3 a = texture2D(uTexA, coverUv(vUv + refr, uAspA, scrAsp)).rgb * uGainA;
  vec3 b = texture2D(uTexB, coverUv(vUv + refr * 1.2, uAspB, scrAsp)).rgb * uGainB;
  vec3 photo = mix(a, b, uMix);
  float lum = dot(photo, vec3(0.299, 0.587, 0.114));
  vec3 warm = photo * vec3(1.07, 1.0, 0.86) + vec3(0.015, 0.01, 0.0);
  vec3 cold = mix(vec3(lum), photo, 0.3) * vec3(0.5, 0.64, 0.84);
  vec3 lit = mix(cold, warm, smoothstep(0.12, 0.85, beam));

  // caustic web along height contours, only where light falls
  float caustic = pow(1.0 - abs(sin(h * 21.0 + t * 0.45)), 9.0);

  // specular: the torch's own reflection + sparse cold glints from the night sky
  vec3 L = normalize(vec3((uTorch - px) / uRadius * 0.9, 1.0));   // same y-down space as n
  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 90.0);
  float glint = pow(max(dot(n, normalize(vec3(-0.25, 0.42, 1.0) + vec3(0.0, 0.0, 1.0))), 0.0), 520.0);

  vec3 ink = vec3(0.020, 0.027, 0.043);
  vec3 col = ink + vec3(0.006, 0.010, 0.018) * (h * 2.0 - 0.6);
  col += lit * light;
  col += vec3(1.0, 0.93, 0.8) * caustic * light * 0.09;
  col += vec3(1.0, 0.95, 0.86) * spec * on * (0.18 + beam * 0.5);
  col += vec3(0.55, 0.66, 0.82) * glint * 0.2 * (1.0 - beam * on);
  col += vec3(0.9, 0.82, 0.68) * exp(-d * d * 1.3) * 0.06 * on;   // scatter in the water

  vec2 vv = vUv - 0.5;
  col *= 1.0 - 0.55 * dot(vv, vv);
  col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.022;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;

const SNOW_VERT = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uPr;
attribute float aSeed;
varying float vDepth;
void main() {
  float depth = position.z;
  float t = uTime;
  float y = position.y - t * (0.010 + 0.028 * depth) + uScroll * (0.12 + 0.55 * depth);
  y = mod(y + 1.1, 2.2) - 1.1;
  float x = position.x + sin(t * (0.21 + aSeed * 0.3) + aSeed * 6.283) * 0.035 * (0.4 + depth);
  x = mod(x + 1.1, 2.2) - 1.1;
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = (1.2 + depth * 3.6) * uPr;
  vDepth = depth;
}`;

const SNOW_FRAG = /* glsl */ `
uniform vec2 uTorch;
uniform vec2 uView;
uniform float uPr;
uniform float uRadius;
uniform float uTorchOn;
varying float vDepth;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.15, 0.5, r);
  vec2 px = vec2(gl_FragCoord.x, uView.y * uPr - gl_FragCoord.y) / uPr;
  float beam = 1.0 - smoothstep(0.0, 1.15, length(px - uTorch) / uRadius);
  float vis = 0.03 + beam * beam * uTorchOn * (0.45 + 0.55 * vDepth);
  gl_FragColor = vec4(vec3(1.0, 0.95, 0.86) * a * vis, 1.0);
}`;

/** three r186 needs WebGL2; check with a throwaway canvas so a failure stays silent. */
export function webgl2Available(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    const ok = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

export function createWater(canvas: HTMLCanvasElement, photos: WaterPhoto[], opts: { mobile: boolean; maxPr: number }) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.setClearColor(0x05070b, 1);
  const basePr = Math.min(window.devicePixelRatio || 1, opts.maxPr);
  let quality = 1;

  const blank = new Texture();
  const uniforms = {
    uTime: { value: 0 },
    uView: { value: new Vector2(1, 1) },
    uPr: { value: basePr },
    uTorch: { value: new Vector2(-9999, -9999) },
    uTorchOn: { value: 0 },
    uRadius: { value: 300 },
    uScroll: { value: 0 },
    uTexA: { value: blank as Texture },
    uTexB: { value: blank as Texture },
    uAspA: { value: 1.5 },
    uAspB: { value: 1.5 },
    uMix: { value: 0 },
    uGainA: { value: 0 },
    uGainB: { value: 0 },
    uRipples: { value: Array.from({ length: RIPPLES }, () => new Vector4(0, 0, -99, 0)) },
  };

  const scene = new Scene();
  const camera = new Camera();
  const quad = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false }));
  quad.frustumCulled = false;
  scene.add(quad);

  // marine snow: positions in clip space, depth in z, all motion in the vertex shader
  const count = opts.mobile ? 360 : 820;
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  let s = 1234567;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = rnd() * 2.2 - 1.1;
    pos[i * 3 + 1] = rnd() * 2.2 - 1.1;
    pos[i * 3 + 2] = Math.pow(rnd(), 1.6);
    seed[i] = rnd();
  }
  const snowGeo = new BufferGeometry();
  snowGeo.setAttribute('position', new BufferAttribute(pos, 3));
  snowGeo.setAttribute('aSeed', new BufferAttribute(seed, 1));
  const snow = new Points(snowGeo, new ShaderMaterial({
    vertexShader: SNOW_VERT, fragmentShader: SNOW_FRAG,
    uniforms: { uTime: uniforms.uTime, uScroll: uniforms.uScroll, uPr: uniforms.uPr, uTorch: uniforms.uTorch, uView: uniforms.uView, uRadius: uniforms.uRadius, uTorchOn: uniforms.uTorchOn },
    transparent: true, blending: AdditiveBlending, depthTest: false, depthWrite: false,
  }));
  snow.frustumCulled = false;
  scene.add(snow);

  // textures load on demand; the first one decides when the canvas fades in
  const loader = new TextureLoader();
  const textures = new Map<string, Promise<Texture>>();
  const load = (id: string) => {
    if (!textures.has(id)) {
      const p = photos.find((x) => x.id === id);
      if (!p) return Promise.reject(new Error(`unknown photo ${id}`));
      textures.set(id, loader.loadAsync(p.url).then((tex) => {
        tex.colorSpace = NoColorSpace; // sample sRGB as-is, output as-is
        tex.minFilter = LinearFilter;
        tex.generateMipmaps = false;
        tex.userData.asp = p.w / p.h;
        return tex;
      }));
    }
    return textures.get(id)!;
  };

  let current = '';
  let fade: { from: number; dur: number } | null = null;
  let time = 0;

  const api = {
    renderer,
    uniforms,
    frames: 0,
    /** hard cut while the light is off */
    async cut(id: string) {
      current = id;
      const tex = await load(id);
      if (current !== id) return;
      fade = null;
      uniforms.uTexA.value = tex; uniforms.uAspA.value = tex.userData.asp; uniforms.uGainA.value = 1;
      uniforms.uMix.value = 0; uniforms.uGainB.value = 0;
    },
    /** crossfade (zone hover) */
    async fade(id: string, dur = 0.45) {
      if (id === current) return;
      current = id;
      const tex = await load(id);
      if (current !== id) return;
      uniforms.uTexB.value = tex; uniforms.uAspB.value = tex.userData.asp; uniforms.uGainB.value = 1;
      uniforms.uMix.value = 0;
      fade = { from: time, dur };
    },
    preload(ids: string[]) {
      ids.reduce((chain, id) => chain.then(() => load(id).then(() => undefined, () => undefined)), Promise.resolve());
    },
    ripple(x: number, y: number, amp = 1) {
      const slot = uniforms.uRipples.value[api.rippleIndex++ % RIPPLES];
      slot.set(x, y, time, amp);
    },
    rippleIndex: 0,
    resize() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      const pr = basePr * quality;
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      uniforms.uView.value.set(w, h);
      uniforms.uPr.value = pr;
    },
    /** one frame; t in seconds */
    render(t: number, dt: number) {
      time = t;
      uniforms.uTime.value = t;
      if (fade) {
        const k = Math.min(1, (t - fade.from) / fade.dur);
        uniforms.uMix.value = k * k * (3 - 2 * k);
        if (k >= 1) {
          uniforms.uTexA.value = uniforms.uTexB.value; uniforms.uAspA.value = uniforms.uAspB.value; uniforms.uGainA.value = 1;
          uniforms.uMix.value = 0; uniforms.uGainB.value = 0; fade = null;
        }
      }
      renderer.render(scene, camera);
      api.frames++;
      adapt(dt);
    },
    dispose() {
      textures.forEach((p) => p.then((t) => t.dispose(), () => undefined));
      quad.geometry.dispose(); (quad.material as ShaderMaterial).dispose();
      snowGeo.dispose(); (snow.material as ShaderMaterial).dispose();
      renderer.dispose();
    },
  };

  // adaptive resolution: if frames stay slow, render fewer pixels (never above the DPR cap)
  let acc = 0, n = 0;
  function adapt(dt: number) {
    if (dt <= 0 || dt > 0.25) return;
    acc += dt; n++;
    if (n < 90) return;
    const avg = acc / n; acc = 0; n = 0;
    if (avg > 0.024 && quality > 0.56) { quality = Math.max(0.55, quality * 0.8); api.resize(); }
    else if (avg < 0.0135 && quality < 1) { quality = Math.min(1, quality * 1.15); api.resize(); }
  }

  api.resize();
  return api;
}
export type Water = ReturnType<typeof createWater>;
