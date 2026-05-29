import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Spacing } from "@/src/theme";

interface DropdownOption {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}

interface FABDropdownMenuProps {
  options: DropdownOption[];
}

function FABDropdownMenu({ options }: FABDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const fabScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => listener.remove();
  }, []);

  const optionAnims = useMemo(
    () =>
      options.map(() => ({
        translateY: new Animated.Value(80),
        opacity: new Animated.Value(0),
      })),
    [options],
  );

  const openMenu = useCallback(() => {
    setIsOpen(true);

    if (reduceMotion) {
      overlayOpacity.setValue(1);
      iconRotation.setValue(1);
      options.forEach((_, i) => {
        optionAnims[i].translateY.setValue(0);
        optionAnims[i].opacity.setValue(1);
      });
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        useNativeDriver: true,
        duration: 150,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(iconRotation, {
        toValue: 1,
        useNativeDriver: true,
        duration: 150,
        easing: Easing.out(Easing.exp),
      }),
      ...options.map((_, i) =>
        Animated.parallel([
          Animated.timing(optionAnims[i].translateY, {
            toValue: 0,
            useNativeDriver: true,
            duration: 200,
            easing: Easing.out(Easing.exp),
          }),
          Animated.timing(optionAnims[i].opacity, {
            toValue: 1,
            useNativeDriver: true,
            duration: 150,
            delay: i * 50,
          }),
        ]),
      ),
    ]).start();
  }, [options, optionAnims, overlayOpacity, reduceMotion, iconRotation]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);

    if (reduceMotion) {
      overlayOpacity.setValue(0);
      iconRotation.setValue(0);
      options.forEach((_, i) => {
        optionAnims[i].translateY.setValue(80);
        optionAnims[i].opacity.setValue(0);
      });
      return;
    }

    Animated.parallel([
      Animated.timing(iconRotation, {
        toValue: 0,
        useNativeDriver: true,
        duration: 150,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        useNativeDriver: true,
        duration: 120,
        easing: Easing.out(Easing.exp),
      }),
      ...options.map((_, i) => {
        const reverseIndex = options.length - 1 - i;
        return Animated.parallel([
          Animated.timing(optionAnims[i].translateY, {
            toValue: 80,
            useNativeDriver: true,
            duration: 150,
            delay: reverseIndex * 30,
          }),
          Animated.timing(optionAnims[i].opacity, {
            toValue: 0,
            useNativeDriver: true,
            duration: 120,
            delay: reverseIndex * 30,
          }),
        ]);
      }),
    ]).start();
  }, [options, optionAnims, overlayOpacity, reduceMotion, iconRotation]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={closeMenu}
          activeOpacity={1}
          accessibilityLabel="Fechar menu"
        />
      </Animated.View>

      <View style={styles.optionsContainer}>
        {options.map((option, i) => (
          <Animated.View
            key={option.label}
            style={[
              {
                transform: [{ translateY: optionAnims[i].translateY }],
                opacity: optionAnims[i].opacity,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                closeMenu();
                option.onPress();
              }}
              activeOpacity={0.7}
              accessibilityLabel={option.label}
              accessibilityRole="button"
            >
              <MaterialIcons name={option.icon} size={20} color={Colors.text} />
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[styles.fab, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => (isOpen ? closeMenu() : openMenu())}
          onPressIn={() => {
            if (reduceMotion) return;
            Animated.timing(fabScale, {
              toValue: 0.96,
              useNativeDriver: true,
              duration: 80,
              easing: Easing.out(Easing.exp),
            }).start();
          }}
          onPressOut={() => {
            if (reduceMotion) return;
            Animated.timing(fabScale, {
              toValue: 1,
              useNativeDriver: true,
              duration: 100,
              easing: Easing.out(Easing.exp),
            }).start();
          }}
          activeOpacity={1}
          accessibilityLabel={isOpen ? "Fechar menu" : "Abrir menu"}
          accessibilityRole="button"
        >
          <Animated.View
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              transform: [
                {
                  rotate: iconRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <MaterialIcons name={isOpen ? "close" : "more-vert"} size={24} color={Colors.text} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  optionsContainer: {
    position: "absolute",
    bottom: Spacing.px5 + Spacing.px11 + Spacing.px1,
    right: Spacing.px5,
    alignItems: "flex-end",
    gap: Spacing.px3,
    maxHeight: 300,
    overflow: "hidden",
  },
  optionButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: Spacing.px5,
    right: Spacing.px5,
  },
  fabButton: {
    width: Spacing.px11,
    height: Spacing.px11,
    borderRadius: 28,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});

export default FABDropdownMenu;