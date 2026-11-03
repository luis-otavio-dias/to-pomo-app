import { useId, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

import { SketchCardTokens, type SketchCardVariant } from '@/constants/sketch-card';

import { createSketchPath } from './sketch-card-geometry';

export type SketchCardProps = {
  children: ReactNode;
  variant?: SketchCardVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  fill?: string;
  /** Tint the same paper outline, clipped to this height. */
  headerTint?: { color: string; height: number };
};

/** A content-sized paper card; the SVG is visual only and never handles touches. */
export function SketchCard({ children, variant = 'default', style, contentStyle, testID, fill = SketchCardTokens.paper, headerTint }: SketchCardProps) {
  const clipId = useId().replace(/:/g, '');
  const [paperSize, setPaperSize] = useState({ width: 0, height: 0 });
  const path = useMemo(
    () => createSketchPath(paperSize.width, paperSize.height, variant),
    [paperSize.width, paperSize.height, variant],
  );
  const svgWidth = paperSize.width + SketchCardTokens.shadowSpace.right;
  const svgHeight = paperSize.height + SketchCardTokens.shadowSpace.bottom;

  const original = !headerTint && fill === SketchCardTokens.paper && variant === 'default' && paperSize.width === 350 && paperSize.height === 321;
  const originalProfile = variant === 'default';

  return (
    <View style={style} testID={testID}>
      <View style={styles.container}>
        {path ? (
          <View
            style={styles.artwork}
            pointerEvents="none"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {original ? (
              <>
                <Image source={require('@/assets/sketch-card/shadow.svg')} style={styles.originalShadow} />
                <Image source={require('@/assets/sketch-card/paper.svg')} style={styles.originalPaper} />
              </>
            ) : (
              <Svg width={svgWidth} height={svgHeight}
                style={originalProfile ? styles.profileOffset : undefined}
                viewBox={`${originalProfile ? '-1 -1' : '0 0'} ${svgWidth} ${svgHeight}`}>
                <Path
                  d={path}
                  fill={originalProfile ? '#000000' : SketchCardTokens.ink}
                  stroke={originalProfile ? '#000000' : undefined}
                  strokeWidth={originalProfile ? SketchCardTokens.strokeWidth : undefined}
                  transform={`translate(${SketchCardTokens.shadowOffset.x} ${SketchCardTokens.shadowOffset.y})`}
                />
                <Path
                  d={path}
                  fill={fill}
                  stroke={SketchCardTokens.ink}
                  strokeWidth={SketchCardTokens.strokeWidth}
                  strokeLinejoin="round"
                />
                {headerTint ? (
                  <>
                    <Defs><ClipPath id={clipId}><Rect x={0} y={0} width={paperSize.width} height={headerTint.height} /></ClipPath></Defs>
                    <Path d={path} fill={headerTint.color} stroke={SketchCardTokens.ink}
                      strokeWidth={SketchCardTokens.strokeWidth} strokeLinejoin="round" clipPath={`url(#${clipId})`} />
                  </>
                ) : null}
              </Svg>
            )}
          </View>
        ) : null}
        <View
          style={[styles.paper, contentStyle]}
          onLayout={({ nativeEvent: { layout } }) => {
            const { width, height } = layout;
            setPaperSize((previous) =>
              previous.width === width && previous.height === height ? previous : { width, height },
            );
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  originalPaper: { position: 'absolute', left: -1, top: -1, width: 352, height: 323 },
  originalShadow: { position: 'absolute', left: 2, top: 3, width: 352, height: 323 },
  profileOffset: { left: -1, top: -1 },
  container: {
    position: 'relative',
    paddingRight: SketchCardTokens.shadowSpace.right,
    paddingBottom: SketchCardTokens.shadowSpace.bottom,
  },
  artwork: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  paper: {
    padding: SketchCardTokens.contentPadding,
  },
});
