export const DesignSystem = {
  colors: {
    paper: '#FAF5EA',
    paperCard: '#FFFDF9',
    ink: '#222020',
    inkMuted: '#5C5753',
    inkBlue: '#1C39BB',
    inkHighlight: '#FEF08A',
    inkCoral: '#E25539',
    bannerBg: '#FDF3D1',
  },
  fonts: {
    hand: 'PatrickHand',
    sketch: 'CaveatSemiBold',
    sketchBold: 'CaveatBold',
    sans: 'Inter',
    sansMedium: 'InterMedium',
    sansSemiBold: 'InterSemiBold',
    sansBold: 'InterBold',
  },
} as const;

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
