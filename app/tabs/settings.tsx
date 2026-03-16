import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, ProgressBar, Text } from "react-native-paper";
import { useWebSocket } from "../../hooks/useWebSocket";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  CalibrationData,
  clearCalibration,
  loadCalibration,
  saveCalibration
} from "../../utils/calibrationStorage";

const CALIBRATION_DURATION = 3000; // 3 seconds
const SAMPLE_INTERVAL = 100; // Sample every 100ms


export default function Settings() {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [collectedAngles, setCollectedAngles] = useState<number[]>([]);
  const calibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scale = useSharedValue(1);
  const successOpacity = useSharedValue(0);
  const { connect, send, isConnected, angle } = useWebSocket();


  useEffect(() => {
    loadCalibration().then(setCalibrationData);
  }, []);

  useEffect(() => {
  connect();
}, []);

  const handleCalibrate = async () => {
    

    setIsCalibrating(true);
    setCalibrationProgress(0);
    setCollectedAngles([]);

    // Start progress bar animation
    const progressSteps = CALIBRATION_DURATION / 50; // Update every 50ms
    let progress = 0;
    
    progressIntervalRef.current = setInterval(() => {
      progress += 50;
      const newProgress = Math.min(progress / CALIBRATION_DURATION, 1);
      setCalibrationProgress(newProgress);
      
      if (newProgress >= 1) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, 50);

    // Wait for calibration duration
    setTimeout(async () => {
      // Calculate average angle from collected readings
      if (collectedAngles.length === 0) {
        setIsCalibrating(false);
        setCalibrationProgress(0);
        Alert.alert("Error", "No se recibieron datos durante la calibración.");
        return;
      }

      const averageAngle = collectedAngles.reduce((sum, angle) => sum + angle, 0) / collectedAngles.length;
      const roundedAngle = Math.round(averageAngle * 10) / 10; // Round to 1 decimal

      // Send calibration command to ESP32
      try {
        send({
  command: "calibrate",
});

        // Store calibration locally
        const newCalibration: CalibrationData = {
          baselineAngle: roundedAngle,
          thresholdAngle: 15,
          calibratedAt: new Date().toISOString(),
        };

        await saveCalibration(newCalibration);
        setCalibrationData(newCalibration);

        // Animate success
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

        Alert.alert(
          "Calibración exitosa",
          `Ángulo de referencia establecido: ${roundedAngle.toFixed(1)}°\n\nBasado en ${collectedAngles.length} lecturas.`
        );
      } catch (error) {
        Alert.alert("Error", "No se pudo completar la calibración");
        console.error("Calibration error:", error);
      } finally {
        setIsCalibrating(false);
        setCalibrationProgress(0);
        setCollectedAngles([]);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, CALIBRATION_DURATION);
  };

  const handleResetCalibration = async () => {
    Alert.alert(
      "Restablecer calibración",
      "¿Estás seguro de que quieres restablecer la calibración?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restablecer",
          style: "destructive",
          onPress: async () => {
            await clearCalibration();
            setCalibrationData(null);
            send({ command: "reset_calibration" });
          },
        },
      ]
    );
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

  const remainingTime = Math.ceil((1 - calibrationProgress) * (CALIBRATION_DURATION / 1000));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Configuración
        </Text>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Calibración del dispositivo
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Siéntate en una postura correcta y presiona "Calibrar". El proceso tomará {CALIBRATION_DURATION / 1000} segundos para obtener una lectura precisa.
            </Text>

            {angle !== null && (
              <View style={styles.angleDisplay}>
                <MaterialCommunityIcons name="angle-acute" size={24} color="#2196F3" />
                <Text variant="titleLarge" style={styles.angleText}>
                  {angle.toFixed(1)}°
                </Text>
                {isCalibrating && (
                  <Text variant="bodySmall" style={styles.calibratingText}>
                    Midiendo...
                  </Text>
                )}
              </View>
            )}

            {isCalibrating && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={calibrationProgress} 
                  color="#2196F3"
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.progressText}>
                  {remainingTime > 0 ? `${remainingTime}s restantes` : "Finalizando..."}
                </Text>
                {collectedAngles.length > 0 && (
                  <Text variant="bodySmall" style={styles.samplesText}>
                    {collectedAngles.length} lecturas recopiladas
                  </Text>
                )}
              </View>
            )}

            {calibrationData && !isCalibrating && (
              <View style={styles.calibrationInfo}>
                <Text variant="bodySmall" style={styles.infoText}>
                  Última calibración: {calibrationData.baselineAngle.toFixed(1)}°
                </Text>
                <Text variant="bodySmall" style={styles.infoText}>
                  Calibrado el: {new Date(calibrationData.calibratedAt).toLocaleDateString('es-ES')}
                </Text>
              </View>
            )}
            
            <Animated.View style={animatedButtonStyle}>
              <Button
                mode="contained"
                onPress={handleCalibrate}
                disabled={isCalibrating || !isConnected}
                buttonColor="#2196F3"
                style={styles.button}
                labelStyle={styles.buttonLabel}
                loading={isCalibrating}
              >
                {isCalibrating ? "Calibrando..." : "Calibrar"}
              </Button>
            </Animated.View>

            {calibrationData && !isCalibrating && (
              <Button
                mode="outlined"
                onPress={handleResetCalibration}
                style={styles.resetButton}
              >
                Restablecer calibración
              </Button>
            )}
            
            {calibrationData && !isCalibrating && (
              <Animated.View style={[styles.successContainer, animatedTextStyle]}>
                <Text style={styles.successText}>
                  ✓ Dispositivo calibrado correctamente
                </Text>
              </Animated.View>
            )}
          </Card.Content>
        </Card>
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
  card: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  description: {
    marginBottom: 16,
    color: "#666",
  },
  angleDisplay: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    marginBottom: 16,
  },
  angleText: {
    fontWeight: "700",
    color: "#2196F3",
  },
  calibratingText: {
    color: "#2196F3",
    fontSize: 12,
    fontStyle: "italic",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 4,
  },
  samplesText: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
  },
  calibrationInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  infoText: {
    color: "#666",
    marginBottom: 4,
  },
  button: {
    borderRadius: 30,
    marginBottom: 8,
  },
  buttonLabel: {
    paddingVertical: 4,
  },
  resetButton: {
    borderRadius: 30,
    marginTop: 8,
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