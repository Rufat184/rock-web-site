import { useEffect, useRef } from "react";

/* Particle bass: ~2,700 instanced quads form a 5-string bass silhouette.
   Port of the deepseek.com/harness hero effect: fly-in assembly, idle
   float, radial mouse scatter, mouse-follow light, scroll dispersion.
   Raw WebGL (2 preferred, 1 fallback), zero dependencies. */

const FOV = (50 * Math.PI) / 180;
const CAM_Z = 18;
const RES = 110;
const K = 13 / RES;
const MOUSE = { radius: 4.9, strength: 0.8, decay: 0.85, distort: 0.5 };
const LIGHT = { x: 3.2, y: 4.4, z: 3, range: 14, shadeMin: 0.42, shadeMax: 2.9, followX: 1.05 };
const SHIFT_X = 0.35; // subtle rightward nudge of the assembled silhouette
const TILT_Z = (-25 * Math.PI) / 180; // extra clockwise tilt: neck more vertical
const COLOR = [0.79, 0.66, 0.88]; // matches --accent #c9a8e0

function drawBass(ctx: CanvasRenderingContext2D, S: number) {
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = "#fff";
  ctx.save();
  // These coordinates trace the supplied bass reference directly: body at the
  // lower-left, headstock at the upper-right, and the sharp horn on the right./co
  ctx.scale(S / 1500, S / 1500);

  ctx.beginPath();
  // Body, starting at the upper shoulder beside the neck.
  ctx.moveTo(560, 965);
  ctx.bezierCurveTo(495, 958, 480, 915, 505, 850);
  ctx.bezierCurveTo(540, 760, 605, 655, 625, 625);
  ctx.bezierCurveTo(638, 605, 620, 592, 597, 611);
  ctx.bezierCurveTo(510, 680, 442, 850, 350, 910);
  ctx.bezierCurveTo(260, 958, 105, 970, 53, 1065);
  ctx.bezierCurveTo(2, 1158, 44, 1328, 156, 1411);
  ctx.bezierCurveTo(260, 1489, 407, 1497, 483, 1404);
  ctx.bezierCurveTo(540, 1336, 510, 1256, 582, 1200);
  ctx.bezierCurveTo(625, 1166, 689, 1175, 736, 1131);
  ctx.bezierCurveTo(778, 1091, 747, 1069, 690, 1080);
  ctx.bezierCurveTo(634, 1091, 599, 1067, 575, 1015);
  ctx.lineTo(560, 965);
  ctx.closePath();
  ctx.fill();

  // Long fretboard, tapering slightly toward the headstock.ç
  ctx.beginPath();
  ctx.moveTo(493, 937);
  ctx.lineTo(575, 1015);
  ctx.lineTo(1362, 243);
  ctx.lineTo(1292, 171);
  ctx.closePath();
  ctx.fill();

  // Headstock: a rounded, tapered plate that continues the neck axis
  // (the neck runs 45° up-right; the outline follows it, with a smooth
  // crown instead of a spike). Nut corners sit just outside the fretboard
  // end so no gap shows after particle sampling.
  ctx.beginPath();
  ctx.moveTo(1365, 246); // low corner at the nut
  ctx.bezierCurveTo(1400, 232, 1436, 195, 1432, 157); // low side, slight outward bulge
  ctx.arc(1406, 130, 38, 0.8, 3.95, true); // rounded crown
  ctx.bezierCurveTo(1352, 105, 1318, 130, 1289, 168); // high side back to the nut
  ctx.closePath();
  ctx.fill();

  // Five broad, connected tuning machines stay legible after particle sampling.
  // Three posts on the high side, two on the low, each crossing the plate edge.
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 28;
  ctx.lineCap = "round";
  for (const [x1, y1, x2, y2] of [
    [1340, 170, 1312, 141], [1361, 149, 1333, 120], [1383, 128, 1355, 99],
    [1375, 185, 1403, 214], [1400, 161, 1428, 189],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

type PData = {
  targets: Float32Array; scattered: Float32Array; opacities: Float32Array;
  edges: Float32Array; rands: Float32Array; count: number;
};

function sampleBass(): PData | null {
  const draw = document.createElement("canvas");
  draw.width = draw.height = 240;
  const dc = draw.getContext("2d", { willReadFrequently: true });
  if (!dc) return null;
  drawBass(dc, 240);
  const grid = document.createElement("canvas");
  grid.width = grid.height = RES;
  const gc = grid.getContext("2d", { willReadFrequently: true });
  if (!gc) return null;
  gc.drawImage(draw, 0, 0, RES, RES);
  const px = gc.getImageData(0, 0, RES, RES).data;
  const lum = new Float32Array(RES * RES);
  for (let i = 0; i < RES * RES; i++) {
    const t = 4 * i;
    lum[i] = (0.299 * px[t] + 0.587 * px[t + 1] + 0.114 * px[t + 2]) / 255;
  }
  const isolated = (x: number, y: number) => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= RES || ny >= RES) continue;
      if (lum[ny * RES + nx] > 0.2) return false;
    }
    return true;
  };
  const tg: number[] = [], op: number[] = [], ed: number[] = [];
  const d = RES / 2;
  for (let y = 0; y < RES; y++) for (let x = 0; x < RES; x++) {
    const a = lum[y * RES + x];
    if (a <= 0.2 || isolated(x, y)) continue;
    tg.push((x - d) * K + SHIFT_X, (d - y) * K, 0);
    op.push(0.42 + 0.58 * a);
    let e = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= RES || ny >= RES || lum[ny * RES + nx] <= 0.2) e++;
    }
    ed.push(e / 8);
  }
  const count = tg.length / 3;
  const sc = new Float32Array(count * 3);
  const rn = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = 6 * (0.45 + 0.55 * Math.random());
    sc[i * 3] = Math.sin(ph) * Math.cos(th) * r;
    sc[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r;
    sc[i * 3 + 2] = Math.cos(ph) * r * 0.5;
    rn[i] = Math.random();
  }
  return {
    targets: new Float32Array(tg), scattered: sc, opacities: new Float32Array(op),
    edges: new Float32Array(ed), rands: rn, count,
  };
}

const VERT = `
attribute vec2 aCorner;
attribute vec3 aTarget;
attribute vec3 aScattered;
attribute float aOpacity;
attribute float aEdge;
attribute float aIndex;
attribute float aRand;
uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;
uniform float uAssembly;
uniform float uSize;
uniform float uLoose;
uniform float uScatter;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseDistort;
uniform vec3 uLightPos;
uniform float uLightRange;
uniform float uShadeMin;
uniform float uShadeMax;
uniform vec3 uGroupPos;
uniform vec3 uGroupRot;
uniform float uGroupScale;
varying float vOpacity;
varying vec2 vCorner;
varying vec3 vWorldPos;
varying float vLight;
varying float vAssembly;
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotZ(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}
void main(){
  vOpacity=aOpacity; vCorner=aCorner;
  float assembly=smoothstep(0.0,1.0,uAssembly);
  vAssembly=assembly;
  vec3 center=mix(aScattered,aTarget,assembly);
  float loose=uLoose*mix(0.25,1.0,aEdge)*assembly;
  if(loose>0.001){
    vec3 jitter=vec3(
      fract(sin(aIndex*12.9898)*43758.5453)-0.5,
      fract(sin(aIndex*78.2330)*12543.1230)-0.5,
      fract(sin(aIndex*39.4250)*26711.7700)-0.5);
    center+=jitter*0.05*loose;
    center.x+=sin(uTime*0.50+aIndex*0.53)*0.06*loose;
    center.y+=cos(uTime*0.42+aIndex*0.71)*0.06*loose;
    center.z+=sin(uTime*0.36+aIndex*0.91)*0.08*loose;
    float end=smoothstep(1.5,4.0,distance(aTarget.xy,vec2(2.6,4.2)))*uLoose*assembly;
    center.y+=sin(uTime*1.1+aTarget.x*0.7)*0.09*end;
    center.z+=cos(uTime*0.9-aTarget.x*0.55)*0.06*end;
  }
  if(uScatter>0.001){
    float disperse=uScatter*mix(0.5,1.0,aEdge);
    center+=(aScattered-aTarget)*disperse;
    center.z+=sin(uTime*0.6+aIndex*0.3)*disperse*0.6;
  }
  if(assembly>0.95){
    float es=(assembly-0.95)*20.0;
    float dist=length(aTarget.xy);
    center.z+=sin(dist*3.0-uTime*1.5)*0.06*es*smoothstep(0.0,3.0,dist);
  }
  if(assembly>0.8){
    float me=(assembly-0.8)*5.0;
    vec2 toMouse=center.xy-uMouse;
    float md=length(toMouse);
    if(md<uMouseRadius&&md>0.001){
      float t=1.0-md/uMouseRadius;
      float force=t*t*t*me*uMouseStrength;
      vec2 rd=toMouse/md;
      float na=sin(aIndex*0.37+uTime*0.5)*uMouseDistort;
      float ca=cos(na),sa=sin(na);
      center.xy+=vec2(rd.x*ca-rd.y*sa,rd.x*sa+rd.y*ca)*force*2.0;
      center.z+=sin(aIndex*1.7+uTime)*force*0.8;
    }
  }
  float size=uSize*(0.55+0.9*aRand);
  vec3 pos=center+vec3(aCorner*size,0.0);
  mat3 g=rotZ(uGroupRot.z)*rotY(uGroupRot.y)*rotX(uGroupRot.x);
  vec3 world=g*(pos*uGroupScale)+uGroupPos;
  vWorldPos=world;
  float lit=clamp(1.0-distance(world,uLightPos)/uLightRange,0.0,1.0);
  vLight=mix(uShadeMin,uShadeMax,lit*lit);
  gl_Position=uProj*uView*vec4(world,1.0);
}`;

const FRAG = `
precision highp float;
varying float vOpacity;
varying vec2 vCorner;
varying vec3 vWorldPos;
varying float vLight;
varying float vAssembly;
uniform float uTime;
uniform vec3 uColor;
void main(){
  float square=smoothstep(0.55,0.35,length(vCorner));
  if(square<0.02) discard;
  float glow=smoothstep(10.0,0.0,length(vWorldPos.xy))*0.45*vAssembly;
  float alpha=vOpacity*(mix(0.62,0.92,vAssembly)+glow);
  alpha*=(sin(uTime*1.5+vWorldPos.x*5.0+vWorldPos.y*3.0)*0.1+0.9)*min(vLight,1.0);
  vec3 color=(uColor+glow*vec3(0.2,0.3,0.5))*vLight;
  color=mix(color,color*vec3(1.07,1.02,0.94),clamp(vLight-1.0,0.0,1.0));
  gl_FragColor=vec4(color,alpha*square);
}`;

function perspective(fovY: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function toGroupLocal(
  mx: number, my: number,
  p: { x: number; y: number; z: number },
  r: { x: number; y: number; z: number },
  s: number,
) {
  let x = mx - p.x, y = my - p.y, z = -p.z;
  let c = Math.cos(r.z), s2 = Math.sin(r.z);
  const x1 = c * x + s2 * y, y1 = -s2 * x + c * y;
  c = Math.cos(r.y); s2 = Math.sin(r.y);
  const z1 = s2 * x1 + c * z, x2 = c * x1 - s2 * z;
  c = Math.cos(r.x); s2 = Math.sin(r.x);
  const y2 = c * y1 + s2 * z1;
  return { x: x2 / s, y: y2 / s };
}

export function ParticleBass({ className, anchor }: { className?: string; anchor?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const anchorEl = anchor ? (document.querySelector(anchor) as HTMLElement | null) : null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const data = sampleBass();
    if (!data) return;

    const opts: WebGLContextAttributes = {
      alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: true,
    };
    const gl2 = canvas.getContext("webgl2", opts);
    const gl = (gl2 ?? canvas.getContext("webgl", opts)) as any;
    if (!gl) return;
    const isGL2 = !!gl2;
    const angle = isGL2 ? null : gl.getExtension("ANGLE_instanced_arrays");
    if (!isGL2 && !angle) return;
    const div = (loc: number, d: number) =>
      isGL2 ? gl.vertexAttribDivisor(loc, d) : angle.vertexAttribDivisorANGLE(loc, d);
    const drawInst = (n: number) =>
      isGL2 ? gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, n)
            : angle.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, n);

    const mk = (type: number, src: string) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw gl.getProgramInfoLog(prog);
    gl.useProgram(prog);

    const buf = (arr: number[] | Float32Array) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      return b;
    };
    const quad = buf([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5]);
    const bT = buf(data.targets), bS = buf(data.scattered), bO = buf(data.opacities);
    const bE = buf(data.edges), bR = buf(data.rands);
    const bI = buf(Array.from({ length: data.count }, (_, i) => i));

    const A: Record<string, number> = {};
    const attr = (name: string, b: any, n: number, inst = false) => {
      const loc = gl.getAttribLocation(prog, name);
      A[name] = loc;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
      div(loc, inst ? 1 : 0);
    };
    attr("aCorner", quad, 2);
    attr("aTarget", bT, 3, true);
    attr("aScattered", bS, 3, true);
    attr("aOpacity", bO, 1, true);
    attr("aEdge", bE, 1, true);
    attr("aIndex", bI, 1, true);
    attr("aRand", bR, 1, true);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      proj: U("uProj"), view: U("uView"), time: U("uTime"), assembly: U("uAssembly"),
      size: U("uSize"), loose: U("uLoose"), scatter: U("uScatter"), mouse: U("uMouse"),
      mRadius: U("uMouseRadius"), mStrength: U("uMouseStrength"), mDistort: U("uMouseDistort"),
      lightPos: U("uLightPos"), lightRange: U("uLightRange"), shadeMin: U("uShadeMin"),
      shadeMax: U("uShadeMax"), groupPos: U("uGroupPos"), groupRot: U("uGroupRot"),
      groupScale: U("uGroupScale"), color: U("uColor"),
    };
    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -CAM_Z, 1]);
    let proj = perspective(FOV, 1, 0.1, 100);
    let aspect = 1;
    let offsetX = 0;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        aspect = w / h;
        proj = perspective(FOV, aspect, 0.1, 100);
      }
      // Keep the silhouette centered over the hero grid's right column.
      if (anchorEl) {
        const ar = anchorEl.getBoundingClientRect();
        const cr = canvas.getBoundingClientRect();
        if (cr.width) {
          const vwWorld = 2 * CAM_Z * Math.tan(FOV / 2) * aspect;
          const fx = (ar.left + ar.width * 0.71 - cr.left) / cr.width;
          offsetX = (fx * 2 - 1) * (vwWorld / 2);
        }
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mouse = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let mouseActive = false, hasMoved = false, mouseStrength = 0, scrollP = 0;
    let elapsed = reduced ? 99 : 0, last = performance.now(), lastFrame = 0, raf = 0, visible = true;
    const g = { pos: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 }, scale: 1 };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      // NDC of the cursor within the canvas.
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      // Project the cursor onto the z=0 plane through the camera. The view is
      // a pure translation (camera at (0,0,CAM_Z) looking down -Z), so a world
      // point on that plane is (ndc * half-extent, y, 0). Using the live
      // viewport height (not the stale per-frame value) keeps the light and
      // scatter exactly under the cursor even between resizes.
      const cr = canvas.getBoundingClientRect();
      const h = 2 * CAM_Z * Math.tan(FOV / 2);
      mouse.x = nx * (h * (cr.width / cr.height)) * 0.5;
      mouse.y = ny * h * 0.5;
      mouseActive = true;
      hasMoved = true;
    };
    const onLeave = () => { mouseActive = false; };
    const onVis = () => { if (document.hidden) mouseActive = false; };
    const onScroll = () => { scrollP = Math.min(1, window.scrollY / window.innerHeight); };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; if (visible) { last = performance.now(); lastFrame = 0; } },
      { rootMargin: "100px" },
    );
    io.observe(canvas);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      if (now - lastFrame < 1000 / 30 - 0.5) return;
      lastFrame = now - ((now - lastFrame) % (1000 / 30));
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed += dt;
      const t = elapsed;

      let D = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 0.3) / 2.5)), 3);
      if (reduced) {
        g.rot.x = g.rot.y = 0;
        g.rot.z = TILT_Z;
        g.pos.y = 0;
      } else {
        g.rot.z = TILT_Z; // fixed -10° tilt
        g.rot.x = 0.05 * Math.sin(0.056 * t);
        g.rot.y = 0.1 * Math.sin(0.08 * t);
        g.pos.y = 0.15 * Math.sin(0.4 * t);
      }
      const vh = 2 * CAM_Z * Math.tan(FOV / 2);
      const vw = vh * aspect;
      g.pos.x = offsetX + 0.1 * vw; // 10% right
      g.pos.y -= 0.2 * vh;
      g.pos.y += 0.2 * vh; // 20% up
      g.pos.y += 2.5 * scrollP;
      g.scale = (0.75 + 0.25 * D) * 0.68 * (1 - 0.5 * scrollP);

      const targetS = reduced ? 0 : mouseActive && hasMoved ? MOUSE.strength : 0;
      mouseStrength += (targetS - mouseStrength) * (1 - Math.pow(0.05, dt));
      // mouse.x/y are already world coordinates on the z=0 plane (see onMove);
      // lerp them toward the cursor for a 1-frame settle so the light/scatter
      // sits right on the cursor instead of lagging behind it.
      if (hasMoved) {
        const k = 1 - Math.pow(0.0005, dt);
        smooth.x += (mouse.x - smooth.x) * k;
        smooth.y += (mouse.y - smooth.y) * k;
      }
      const local = toGroupLocal(smooth.x, smooth.y, g.pos, g.rot, g.scale);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const fade = Math.max(0, 1 - 1.5 * scrollP);
      gl.uniformMatrix4fv(u.proj, false, proj);
      gl.uniformMatrix4fv(u.view, false, view);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.assembly, D);
      gl.uniform1f(u.size, 0.085);
      gl.uniform1f(u.loose, reduced ? 0 : 0.15);
      gl.uniform1f(u.scatter, 1.6 * Math.min(1, 1.5 * scrollP));
      gl.uniform2f(u.mouse, local.x, local.y);
      gl.uniform1f(u.mRadius, MOUSE.radius);
      gl.uniform1f(u.mStrength, mouseStrength);
      gl.uniform1f(u.mDistort, MOUSE.distort);
      gl.uniform3f(u.lightPos, LIGHT.x + smooth.x * LIGHT.followX, LIGHT.y, LIGHT.z);
      gl.uniform1f(u.lightRange, LIGHT.range);
      gl.uniform1f(u.shadeMin, LIGHT.shadeMin);
      gl.uniform1f(u.shadeMax, LIGHT.shadeMax);
      gl.uniform3f(u.groupPos, g.pos.x, g.pos.y, g.pos.z);
      gl.uniform3f(u.groupRot, g.rot.x, g.rot.y, g.rot.z);
      gl.uniform1f(u.groupScale, g.scale);
      gl.uniform3f(u.color, COLOR[0] * D * fade, COLOR[1] * D * fade, COLOR[2] * D * fade);
      drawInst(data.count);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("scroll", onScroll);
      gl.deleteProgram(prog);
      [quad, bT, bS, bO, bE, bR, bI].forEach((b) => gl.deleteBuffer(b));
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
