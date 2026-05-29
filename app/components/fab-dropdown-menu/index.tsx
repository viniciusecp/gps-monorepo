import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { Colors } from "@/src/theme";

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
  const fabScale = React.useRef(new Animated.Value(1)).current;
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
    options.forEach((_, i) => {
      Animated.parallel([
        Animated.spring(optionAnims[i].translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(optionAnims[i].opacity, {
          toValue: 1,
          useNativeDriver: true,
          duration: 150,
          delay: i * 50,
        }),
      ]).start();
    });
  }, [options, optionAnims]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    options.forEach((_, i) => {
      Animated.parallel([
        Animated.timing(optionAnims[i].translateY, {
          toValue: 80,
          useNativeDriver: true,
          duration: 150,
        }),
        Animated.timing(optionAnims[i].opacity, {
          toValue: 0,
          useNativeDriver: true,
          duration: 150,
        }),
      ]).start();
    });
  }, [options, optionAnims]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {isOpen && (
        <TouchableOpacity style={styles.overlay} onPress={closeMenu} activeOpacity={1} />
      )}

      <View style={styles.optionsContainer}>
        {options.map((option, i) => (
          <Animated.View
            key={option.label}
            style={[
              styles.optionWrapper,
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
            >
              <MaterialIcons name={option.icon} size={20} color={Colors.text} />
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
          onPressIn={() =>
            Animated.timing(fabScale, {
              toValue: 0.96,
              useNativeDriver: true,
              duration: 80,
            }).start()
          }
          onPressOut={() =>
            Animated.timing(fabScale, {
              toValue: 1,
              useNativeDriver: true,
              duration: 100,
            }).start()
          }
          activeOpacity={1}
        >
          <MaterialIcons name="more-vert" size={24} color={Colors.text} />
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    alignItems: "center",
    gap: 12,
  },
  optionWrapper: {
    marginBottom: 4,
  },
  optionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default FABDropdownMenu;