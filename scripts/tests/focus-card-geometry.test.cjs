const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(readFileSync('src/components/ui/focus-card-geometry.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsObject });
const { createFocusCardPath } = exportsObject;

function curves(path) {
  const values = path.match(/-?\d+(?:\.\d+)?/g).map(Number);
  let start = values.splice(0, 2);
  const result = [];
  while (values.length) {
    const next = values.splice(0, 6);
    const curve = [start, next.slice(0, 2), next.slice(2, 4), next.slice(4, 6)];
    result.push(curve);
    start = curve[3];
  }
  return result;
}
function at(c, t) {
  return [0, 1].map((axis) => (1-t)**3*c[0][axis] + 3*(1-t)**2*t*c[1][axis] +
    3*(1-t)*t*t*c[2][axis] + t**3*c[3][axis]);
}
function close(actual, expected) {
  actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < 0.0001, `${actual} != ${expected}`));
}

test('350 × 321 reproduces the exported Figma Bézier, not an approximation', () => {
  const original = curves(readFileSync('assets/sketch-card/paper.svg', 'utf8').match(/ d="([^"]+)"/)[1]);
  const rendered = curves(createFocusCardPath(350, 321));
  original.forEach((curve, edge) => {
    for (let step = 0; step <= 100; step++) {
      const t = step / 100;
      const segment = t < 0.15 ? 0 : t < 0.85 ? 1 : 2;
      const local = segment === 0 ? t / 0.15 : segment === 1 ? (t - 0.15) / 0.7 : (t - 0.85) / 0.15;
      close(at(rendered[edge * 3 + segment], local), at(curve, t).map((v) => v - 1));
    }
  });
});

test('resizing translates corner curves without changing their shape or join tangents', () => {
  const base = curves(createFocusCardPath(350, 321));
  for (const [width, height] of [[350, 353], [350, 513], [280, 321], [480, 600]]) {
    const grown = curves(createFocusCardPath(width, height));
    const offsets = [[0, 0], [width - 350, 0], [width - 350, height - 321], [0, height - 321]];
    for (let edge = 0; edge < 4; edge++) {
      for (const part of [0, 2]) {
        const offset = offsets[(edge + (part === 2 ? 1 : 0)) % 4];
        grown[edge * 3 + part].forEach((p, i) => close(p, base[edge * 3 + part][i].map((v, axis) => v + offset[axis])));
      }
      for (const [from, to] of [[0, 1], [2, 3]]) {
        close(grown[edge * 3 + 1][to].map((v, axis) => v - grown[edge * 3 + 1][from][axis]),
          base[edge * 3 + 1][to].map((v, axis) => v - base[edge * 3 + 1][from][axis]));
      }
    }
  }
});

test('invalid measurements do not emit an SVG path', () => {
  for (const size of [[0, 321], [350, -1], [NaN, 321], [350, Infinity]]) assert.equal(createFocusCardPath(...size), '');
});
