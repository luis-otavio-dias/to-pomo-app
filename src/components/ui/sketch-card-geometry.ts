import { SketchCardTokens, type SketchCardVariant } from '@/constants/sketch-card';

import { createFocusCardPath } from './focus-card-geometry';

type Point = { x: number; y: number };

const n = (value: number) => Number(value.toFixed(2));

function point(x: number, y: number): Point {
  return { x, y };
}

function lerp(from: Point, to: Point, t: number): Point {
  return point(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
}

/**
 * A hand-drawn edge made of half-waves.
 *
 * The edge is divided into an even number of equal segments, where the count
 * comes from the edge length and a fixed target segment length. Each segment is
 * the same shape, so growth adds or removes a pair of half-waves instead of
 * stretching one wave over the whole edge. The even count keeps the same phase
 * at both ends, so both joins with the fixed corners share the corner tangent.
 */
function wavyEdge(from: Point, to: Point, normal: Point, length: number, bulge: number): string {
  if (length <= 1) {
    return `L ${n(to.x)} ${n(to.y)}`;
  }

  // One short edge is a cubic S; otherwise use an even count so both end
  // tangents match the fixed corners.
  const rawSegments = Math.max(1, Math.round(length / SketchCardTokens.edgeSegmentLength));
  const segments = rawSegments === 1 ? 1 : rawSegments + (rawSegments % 2);

  if (segments === 1) {
    const first = lerp(from, to, 1 / 3);
    const second = lerp(from, to, 2 / 3);
    const firstControl = point(first.x - normal.x * bulge, first.y - normal.y * bulge);
    const secondControl = point(second.x + normal.x * bulge, second.y + normal.y * bulge);
    return `C ${n(firstControl.x)} ${n(firstControl.y)}, ${n(secondControl.x)} ${n(secondControl.y)}, ${n(to.x)} ${n(to.y)}`;
  }

  const commands: string[] = [];

  for (let index = 0; index < segments; index += 1) {
    const start = lerp(from, to, index / segments);
    const end = lerp(from, to, (index + 1) / segments);
    const middle = lerp(start, end, 0.5);
    const direction = index % 2 === 0 ? -1 : 1;
    const control = point(
      middle.x + normal.x * bulge * direction,
      middle.y + normal.y * bulge * direction,
    );

    commands.push(`Q ${n(control.x)} ${n(control.y)} ${n(end.x)} ${n(end.y)}`);
  }

  return commands.join(' ');
}

/**
 * Builds a closed outline in layout units.
 *
 * Default delegates to the original Figma Bézier profile.
 * Legacy compact/expanded expansion rule:
 * - the stroke, shadow offset and path inset are absolute and never scale;
 * - the four corners keep a fixed radius and fixed control points;
 * - top and bottom edges only depend on width;
 * - left and right edges are rebuilt from an even number of half-wave segments,
 *   so height changes add/remove wave pairs instead of stretching the existing
 *   ones.
 */
export function createSketchPath(width: number, height: number, variant: SketchCardVariant): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return '';
  }

  if (variant === 'default') return createFocusCardPath(width, height);

  const inset = SketchCardTokens.pathInset;
  const left = inset;
  const top = inset;
  const right = Math.max(left + 1, width - inset);
  const bottom = Math.max(top + 1, height - inset);
  const { amplitude, corner } = SketchCardTokens.variants[variant];
  const radius = Math.min(corner, (right - left) / 2, (bottom - top) / 2);
  const wobble = Math.min(amplitude, radius / 3);
  const bulge = wobble * 1.15;
  const horizontal = right - left - radius * 2;
  const vertical = bottom - top - radius * 2;

  const topStart = point(left + radius, top + wobble * 0.2);
  const topEnd = point(right - radius, top + wobble * 0.25);
  const rightStart = point(right - wobble * 0.15, top + radius);
  const rightEnd = point(right - wobble * 0.1, bottom - radius);
  const bottomRight = point(right - radius, bottom - wobble * 0.1);
  const bottomLeft = point(left + radius, bottom - wobble * 0.2);
  const leftStart = point(left + wobble * 0.1, bottom - radius);
  const leftEnd = point(left + wobble * 0.1, top + radius);

  return [
    `M ${n(topStart.x)} ${n(topStart.y)}`,
    wavyEdge(topStart, topEnd, point(0, -1), horizontal, bulge),
    `Q ${n(right + wobble * 0.35)} ${n(top - wobble * 0.15)} ${n(rightStart.x)} ${n(rightStart.y)}`,
    wavyEdge(rightStart, rightEnd, point(1, 0), vertical, bulge),
    `Q ${n(right + wobble * 0.15)} ${n(bottom + wobble * 0.3)} ${n(bottomRight.x)} ${n(bottomRight.y)}`,
    wavyEdge(bottomRight, bottomLeft, point(0, 1), horizontal, bulge),
    `Q ${n(left - wobble * 0.4)} ${n(bottom + wobble * 0.15)} ${n(leftStart.x)} ${n(leftStart.y)}`,
    wavyEdge(leftStart, leftEnd, point(-1, 0), vertical, bulge),
    `Q ${n(left - wobble * 0.2)} ${n(top - wobble * 0.25)} ${n(topStart.x)} ${n(topStart.y)} Z`,
  ].join(' ');
}
