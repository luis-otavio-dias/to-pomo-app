import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet, Dimensions, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { DesignSystem } from '@/constants/design-system';

const MOBILE_BREAKPOINT = 768;

export default function AppTabs() {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const { width } = Dimensions.get('window');
      setIsMobile(width < MOBILE_BREAKPOINT);
    };

    updateDimensions();
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs>
        <TabSlot style={{ height: '100%' }} />
        
        {/* Always render TabList to register routes, hide visually on mobile */}
        <TabList asChild>
          <CustomTabList isMobile={isMobile}>
            <TabTrigger name="home" href="/" asChild>
              <TabButton>Home</TabButton>
            </TabTrigger>
            <TabTrigger name="todo" href="/todo" asChild>
              <TabButton>Tarefas</TabButton>
            </TabTrigger>
            <TabTrigger name="explore" href="/explore" asChild>
              <TabButton>Explore</TabButton>
            </TabTrigger>
          </CustomTabList>
        </TabList>
      </Tabs>

      {isMobile && (
        <>
          <Pressable 
            style={styles.hamburgerButton}
            onPress={() => setMenuOpen(true)}
          >
            <ThemedText style={styles.hamburgerIcon}>☰</ThemedText>
          </Pressable>

          <Modal
            visible={menuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuOpen(false)}
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={() => setMenuOpen(false)}
            >
              <View style={styles.mobileMenu}>
                <View style={styles.menuHeader}>
                  <ThemedText type="smallBold" style={styles.menuTitle}>
                    Navegação
                  </ThemedText>
                  <Pressable onPress={() => setMenuOpen(false)}>
                    <ThemedText style={styles.closeIcon}>✕</ThemedText>
                  </Pressable>
                </View>

                <MobileMenuItem href="/">Home</MobileMenuItem>
                <MobileMenuItem href="/todo">Tarefas</MobileMenuItem>
                <MobileMenuItem href="/explore">Explore</MobileMenuItem>

                <View style={styles.menuDivider} />

                <ExternalLink href="https://docs.expo.dev" asChild>
                  <Pressable style={styles.mobileExternalLink}>
                    <ThemedText type="link">Documentação</ThemedText>
                    <SymbolView
                      tintColor="#007AFF"
                      name={{ ios: 'arrow.up.right.square', web: 'link' }}
                      size={14}
                    />
                  </Pressable>
                </ExternalLink>
              </View>
            </Pressable>
          </Modal>
        </>
      )}
    </View>
  );
}

function MobileMenuItem({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Pressable 
      style={styles.mobileMenuItem}
      onPress={() => router.push(href as any)}
    >
      <ThemedText>{children}</ThemedText>
    </Pressable>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList({ children, isMobile, ...props }: TabListProps & { isMobile: boolean }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={[styles.tabListContainer, isMobile && styles.hidden]}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Expo Starter
        </ThemedText>

        {children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  hidden: {
    display: 'none',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
  hamburgerButton: {
    position: 'absolute',
    bottom: 88,
    right: 16,
    zIndex: 200,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${DesignSystem.colors.paperCard}E6`,
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    fontSize: 22,
    color: DesignSystem.colors.ink,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  mobileMenu: {
    backgroundColor: '#212225',
    borderRadius: 16,
    padding: 12,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 4,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  mobileMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 8,
  },
  mobileExternalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
