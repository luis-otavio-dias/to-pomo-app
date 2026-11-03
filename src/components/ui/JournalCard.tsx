import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { JournalSurface } from './JournalSurface';

export interface JournalCardProps extends ViewProps {
  /** Remove o espaçamento interno para cabeçalhos que ocupam toda a largura. */
  flush?: boolean;
  /** Layout do conteúdo; `style` controla o contêiner externo. */
  contentStyle?: StyleProp<ViewStyle>;
}

/** Superfície de papel compartilhada pelos cards do bullet journal. */
export function JournalCard({ children, flush = false, style, contentStyle, ...props }: JournalCardProps) {
  return (
    <JournalSurface {...props} style={style}>
      <View style={[styles.content, !flush && styles.padded, contentStyle]}>
        {children}
      </View>
    </JournalSurface>
  );
}

const styles = StyleSheet.create({
  content: { margin: 3, borderRadius: 10, overflow: 'hidden' },
  padded: { padding: 13 },
});
