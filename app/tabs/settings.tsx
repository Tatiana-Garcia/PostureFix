import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function Settings() {
  const [isCalibrated, setIsCalibrated] = useState(false);
  const scale = useSharedValue(1);
  const successOpacity = useSharedValue(0);

  const handleCalibrate = () => {
    setIsCalibrated(true);
    scale.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    }, () => {
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    });
    successOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
    };
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Configuración
        </Text>
        
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Calibración del dispositivo
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Calibra tu dispositivo para obtener mediciones precisas de tu postura.
          </Text>
          
          <Animated.View style={animatedButtonStyle}>
            <Button
              mode="contained"
              onPress={handleCalibrate}
              disabled={isCalibrated}
              buttonColor={isCalibrated ? "#81c784" : "#2196F3"}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {isCalibrated ? "Calibrado" : "Calibrar"}
            </Button>
          </Animated.View>
          
          {isCalibrated && (
            <Animated.View style={[styles.successContainer, animatedTextStyle]}>
              <Text style={styles.successText}>✓ Dispositivo calibrado correctamente</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1f6",
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  description: {
    marginBottom: 20,
    color: "#666",
  },
  button: {
    borderRadius: 30,
  },
  buttonLabel: {
    paddingVertical: 4,
  },
  successContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    alignItems: "center",
  },
  successText: {
    color: "#2e7d32",
    fontWeight: "600",
  },
});

