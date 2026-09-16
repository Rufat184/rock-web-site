// Diagnostic: rasterize the bass silhouette like sampleBass() does
// (binary fill, no AA) and print the sampled grid with the isolated() filter.
const RES = 110;

function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
    u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1],
  ];
}

const bodySegs = [
  ['B', [560,965], [495,958], [480,915], [505,850]],
  ['B', [505,850], [540,760], [605,655], [625,625]],
  ['B', [625,625], [638,605], [620,592], [597,611]],
  ['B', [597,611], [510,680], [442,850], [350,910]],
  ['B', [350,910], [260,958], [105,970], [53,1065]],
  ['B', [53,1065], [2,1158], [44,1328], [156,1411]],
  ['B', [156,1411], [260,1489], [407,1497], [483,1404]],
  ['B', [483,1404], [540,1336], [510,1256], [582,1200]],
  ['B', [582,1200], [625,1166], [689,1175], [736,1131]],
  ['B', [736,1131], [778,1091], [747,1069], [690,1080]],
  ['B', [690,1080], [634,1091], [599,1067], [575,1015]],
  ['L', [575,1015], [560,965]],
];

const neckSegs = [
  ['L', [493,937], [575,1015]],
  ['L', [575,1015], [1362,243]],
  ['L', [1362,243], [1292,171]],
  ['L', [1292,171], [493,937]],
];

const headSegs = [
  ['B', [1365,246], [1400,232], [1436,195], [1432,157]],
  ['ARC', [1406,130], 38, 0.8, 3.95 - 2*Math.PI], // anticlockwise 0.8 -> 3.95-2pi
  ['B', [1289,168], [1352,105], [1318,130], [1365,246]],
];

const machines = [
  [1340, 170, 1312, 141], [1361, 149, 1333, 120], [1383, 128, 1355, 99],
  [1375, 185, 1403, 214], [1400, 161, 1428, 189],
];

function polyFrom(segs, n = 240) {
  const pts = [];
  for (const s of segs) {
    if (s[0] === 'B') {
      const [, p0, p1, p2, p3] = s;
      for (let i = 0; i < n; i++) pts.push(bez(p0, p1, p2, p3, i / n));
    } else if (s[0] === 'ARC') {
      const [, c, r, a0, a1] = s;
      for (let i = 0; i < n; i++) {
        const a = a0 + (a1 - a0) * (i / n);
        pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
      }
    } else {
      const [, a, b] = s;
      for (let i = 0; i < n; i++) pts.push([a[0] + (b[0]-a[0]) * i/n, a[1] + (b[1]-a[1]) * i/n]);
    }
  }
  return pts;
}

function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inCapsule(x1, y1, x2, y2, x, y, r) {
  const dx = x2 - x1, dy = y2 - y1;
  const L2 = dx*dx + dy*dy;
  let t = ((x - x1) * dx + (y - y1) * dy) / L2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx - x, py = y1 + t * dy - y;
  return px*px + py*py <= r * r;
}

function rasterize(scale, withNeck) {
  const polys = [polyFrom(bodySegs)];
  if (withNeck) polys.push(polyFrom(neckSegs), polyFrom(headSegs));
  const grid = new Uint8Array(RES * RES);
  for (let py = 0; py < RES; py++) {
    for (let px = 0; px < RES; px++) {
      const wx = (px + 0.5) / scale, wy = (py + 0.5) / scale;
      let hit = polys.some((p) => inPoly(p, wx, wy));
      if (!hit && withNeck) hit = machines.some(([a,b,c,d]) => inCapsule(a,b,c,d, wx,wy, 14));
      if (!hit && !withNeck) hit = machines.some(([a,b,c,d]) => inCapsule(a,b,c,d, wx,wy, 14));
      if (hit) grid[py * RES + px] = 1;
    }
  }
  return grid;
}

function isolatedAt(g, x, y) {
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (!dx && !dy) continue;
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= RES || ny >= RES) continue;
    if (g[ny * RES + nx] > 0) return false;
  }
  return true;
}

function print(label, g) {
  console.log(`\n=== ${label} ===`);
  let count = 0;
  for (let y = 0; y < RES; y++) {
    let row = '';
    for (let x = 0; x < RES; x++) {
      const a = g[y * RES + x];
      const on = a > 0 && !isolatedAt(g, x, y);
      if (on) count++;
      row += on ? '#' : '.';
    }
    console.log(row);
  }
  console.log(`sampled particles: ${count}`);
}

// Current broken state: scale RES/2000, no neck/headstock
print('CURRENT (scale 110/2000, no neck)', rasterize(110 / 2000, false));
// Proposed fix: scale RES/1500, neck + headstock restored
print('FIXED (scale 110/1500, neck restored)', rasterize(110 / 1500, true));
