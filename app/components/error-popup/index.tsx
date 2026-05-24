import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, getSpacing, getTypography } from "../../src/theme";
import { useErrorPopup } from "../../src/context/ErrorPopupContext";

function ErrorPopup() {
  const { errorPopup, hideError } = useErrorPopup();
  const scale = useRef(new Animated.Value(0)).current;
  const { visible, title, message } = errorPopup;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
        damping: 15,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(0);
    }
  }, [visible, scale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hideError}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            { transform: [{ scale }] },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={hideError}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default React.memo(ErrorPopup);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: getSpacing("px6"),
    marginHorizontal: getSpacing("px5"),
    width: "80%",
    alignItems: "center",
  },
  title: {
    color: Colors.text,
    fontSize: getTypography("h3"),
    fontWeight: "bold",
    marginBottom: getSpacing("px3"),
  },
  message: {
    color: Colors.textSecondary,
    fontSize: getTypography("body"),
    textAlign: "center",
    marginBottom: getSpacing("px6"),
    lineHeight: getTypography("body") * 1.5,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: getSpacing("px2"),
    paddingHorizontal: getSpacing("px8"),
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.text,
    fontSize: getTypography("button"),
    fontWeight: "bold",
  },
});