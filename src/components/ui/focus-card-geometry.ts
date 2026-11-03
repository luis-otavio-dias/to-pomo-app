/**
 * Original Bézier profile from Figma 2:54 (paper.svg), in paper coordinates.
 * The export includes one unit around the 350 × 321 paper for its 2-unit stroke.
 * Keep the outer 15% of each curve rigid; only the central segment grows.
 */
type Point = readonly [number, number];
type Cubic = readonly [Point, Point, Point, Point];

const edges: readonly Cubic[] = [
  [[2.13634, 11.0823], [63.751, 2.00823], [221.323, 1], [336.472, 1]],
  [[336.472, 1], [346.573, 16.1235], [352.633, 162.317], [350.613, 305.486]],
  [[350.613, 305.486], [349.603, 317.585], [147.587, 323.634], [11.227, 321.618]],
  [[11.227, 321.618], [2.13634, 304.478], [-0.893895, 104.848], [2.13634, 11.0823]],
];

function mix(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function split([a, b, c, d]: Cubic, t: number): [Cubic, Cubic] {
  const ab = mix(a, b, t), bc = mix(b, c, t), cd = mix(c, d, t);
  const abc = mix(ab, bc, t), bcd = mix(bc, cd, t);
  const middle = mix(abc, bcd, t);
  return [[a, ab, abc, middle], [middle, bcd, cd, d]];
}

// De Casteljau preserves the exact curve, including tangents at every join.
const segments = edges.map((edge) => {
  const [start, remainder] = split(edge, 0.15);
  const [middle, end] = split(remainder, 0.7 / 0.85);
  return [start, middle, end] as const;
});

export function createFocusCardPath(width: number, height: number): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return '';
  const dx = width - 350, dy = height - 321;
  const anchors: readonly Point[] = [[0, 0], [dx, 0], [dx, dy], [0, dy]];
  const position = (p: Point, offset: Point) =>
    `${Number((p[0] - 1 + offset[0]).toFixed(5))} ${Number((p[1] - 1 + offset[1]).toFixed(5))}`;
  const commands = [`M ${position(edges[0][0], anchors[0])}`];

  segments.forEach(([start, middle, end], index) => {
    const from = anchors[index], to = anchors[(index + 1) % 4];
    commands.push(
      `C ${position(start[1], from)} ${position(start[2], from)} ${position(start[3], from)}`,
      `C ${position(middle[1], from)} ${position(middle[2], to)} ${position(middle[3], to)}`,
      `C ${position(end[1], to)} ${position(end[2], to)} ${position(end[3], to)}`,
    );
  });
  return `${commands.join(' ')} Z`;
}
