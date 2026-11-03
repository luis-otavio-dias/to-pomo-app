# SketchCard / Default — Figma assets

Source: https://www.figma.com/design/qinnQ7368IU0D82YWdvBaG/SketchCard-%E2%80%94-Default?node-id=2-93
Downloaded on 2026-10-21. All SVG exports are kept unchanged.

| Asset | Figma layer | Rendered size |
| --- | --- | --- |
| paper.svg | 2:54 / paper | 352 × 323, at -1/-1 around the 350 × 321 layout |
| shadow.svg | 2:53 / shadow | 352 × 323, at +2/+3 (paper offset +3/+4) |
| marker.svg | 2:57 | 8 × 8 |
| status.svg | 2:59 | 28 × 12 |
| divider.svg | 2:62, 2:78 | 306 × 1; crop/repeat for other widths |
| reset.svg | 2:69 | 20 × 20 |
| play.svg | 2:72 | 14 × 16 |
| bell.svg | 2:76 | 20 × 20 |
| sessions.svg | 2:80 | 72 × 12, initial 1/4 state |

`SketchCard.tsx` uses the original paper/shadow at reference size. The Figma component's resizing contract requires recalculating central curve segments at other sizes: `focus-card-geometry.ts` carries the exported profile in paper coordinates and preserves the corner segments. It does not scale the asset or its stroke. Geometry tests compare that path against this original SVG.
