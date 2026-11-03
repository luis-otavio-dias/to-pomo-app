/** Valores visuais compartilhados por todas as variantes de SketchCard. */
export const SketchCardTokens = {
  paper: '#FFFDF9',
  ink: '#222020',
  highlight: '#FFF59D',
  muted: '#66615C',
  strokeWidth: 2,
  shadowOffset: { x: 3, y: 4 },
  contentPadding: 16,
  pathInset: 4,
  shadowSpace: { right: 8, bottom: 9 },
  /** Target length of one half-wave; growth adds waves instead of stretching them. */
  edgeSegmentLength: 80,
  variants: {
    compact: { amplitude: 1, corner: 9 },
    default: { amplitude: 2, corner: 12 },
    expanded: { amplitude: 3, corner: 15 },
  },
} as const;

export type SketchCardVariant = keyof typeof SketchCardTokens.variants;
