import { useState } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface JournalSurfaceProps extends ViewProps {
  fill?: string;
}

/** Contorno de papel com curvas nos 4 cantos e nas 4 bordas, sem invadir o conteúdo em cards altos. */
export function JournalSurface({ children, fill = '#fffefb', style, onLayout, ...props }: JournalSurfaceProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const w = Math.max(0, size.width - 5);
  const h = Math.max(0, size.height - 6);
  const r = Math.min(14, w / 5, h / 5);
  const path = w > 0 && h > 0
    ? `M ${2 + r} 2
       C ${w * 0.35} 1.5 ${w * 0.65} 2.5 ${w - r} 2
       Q ${w - 2} 2 ${w - 2} ${2 + r}
       C ${w - 1.5} ${h * 0.35} ${w - 2.5} ${h * 0.65} ${w - 2} ${h - r}
       Q ${w - 2} ${h - 2} ${w - r} ${h - 2}
       C ${w * 0.65} ${h - 1.5} ${w * 0.35} ${h - 2.5} ${2 + r} ${h - 2}
       Q 2 ${h - 2} 2 ${h - r}
       C 1.5 ${h * 0.65} 2.5 ${h * 0.35} 2 ${2 + r}
       Q 2 2 ${2 + r} 2 Z`
    : '';

  return (
    <View {...props} style={[styles.container, style]} onLayout={(event) => {
      const { width, height } = event.nativeEvent.layout;
      setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height });
      onLayout?.(event);
    }}>
      {w > 0 && h > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
            <Path d={path} fill="#141414" stroke="#141414" strokeWidth={2} transform="translate(3 4)" />
            <Path d={path} fill={fill} />
          </Svg>
        </View>
      )}
      {children}
      {w > 0 && h > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
            <Path d={path} fill="none" stroke="#141414" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
          </Svg>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', paddingRight: 5, paddingBottom: 6 },
});

