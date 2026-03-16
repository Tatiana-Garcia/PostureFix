import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { BatteryIndicator } from "../../components/BatteryIndicator";
import { ModeSelector } from "../../components/ModeSelector";
import { PostureIndicator } from "../../components/PostureIndicator";
import { TimerPill } from "../../components/TimerPill";
import { saveSession } from "../../utils/sessionStorage";
import { webSocket } from "../../utils/webSocket";

export default function Index() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [rectoSeconds, setRectoSeconds] = React.useState(0);
  const [encorvadoSeconds, setEncorvadoSeconds] = React.useState(0);


  /*React.useEffect(() => {
  const ws = new WebSocket("ws://10.137.18.68:81");*/

  const {
    connect,
    disconnect,
    isConnected,
    angle,
    isBadPosture,
    batteryLevel
  } = webSocket();

  console.log({
  rectoSeconds,
  encorvadoSeconds,
  batteryLevel,
  angle,
  isBadPosture
});

  React.useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      if (isBadPosture) {
        setEncorvadoSeconds((s) => s + 1);
      } else {
        setRectoSeconds((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, isBadPosture]);

  const onToggleSession = async () => {
    if (!isRunning) {
      // start session fresh
      setElapsedSeconds(0);
      setRectoSeconds(0);
      setEncorvadoSeconds(0);
      setIsRunning(true);
      return;
    }

    // stop session and save data
    setIsRunning(false);
    if (rectoSeconds > 0 || encorvadoSeconds > 0) {
      await saveSession(rectoSeconds, encorvadoSeconds);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text variant="headlineLarge" style={styles.title}>
            PostureFix
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Monitorea tu postura en tiempo real
          </Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, isConnected && styles.statusConnected]}>
            <MaterialCommunityIcons
              name={isConnected ? "wifi" : "wifi-off"}
              size={14}
              color={isConnected ? "#2196F3" : "#999"}
            />
            <Text style={[styles.statusText, isConnected && styles.statusTextConnected]}>
              {isConnected ? "Conectado" : "Desconectado"}
            </Text>
          </View>
          <BatteryIndicator batteryLevel={batteryLevel} />
        </View>
      </View>

      {/* Stats Cards */}
      <Card style={styles.card} mode="elevated" elevation={2}>
        <Card.Content style={styles.cardContent}>
          <ModeSelector
            rectoSeconds={rectoSeconds}
            encorvadoSeconds={encorvadoSeconds}
          />
        </Card.Content>
      </Card>

      {/* Posture Indicator */}
      <Card style={styles.card} mode="elevated" elevation={2}>
        <Card.Content style={styles.cardContent}>
          <PostureIndicator angle={angle} isBadPosture={isBadPosture} />
        </Card.Content>
      </Card>

      {/* Timer Card */}
      <Card style={styles.card} mode="elevated" elevation={2}>
        <Card.Content style={styles.cardContent}>
          <TimerPill elapsedSeconds={elapsedSeconds} isRunning={isRunning} />
        </Card.Content>
      </Card>

      {/* Botón de conectar*/}
      <Button
        mode="outlined"
        onPress={connect}
        disabled={isConnected}
        icon="wifi"
      >
        Conectar dispositivo
      </Button>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.button}
          buttonColor="#2196F3"
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          onPress={onToggleSession}
          icon={isRunning ? "stop" : "play"}
          disabled={!isConnected}
        >
          {isRunning ? "Terminar sesión" : "Empezar sesión"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    padding: 12,
    paddingTop: 16,
  },
  header: {
    marginBottom: 12,
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    color: "#666",
    opacity: 0.8,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusConnected: {
    backgroundColor: "#e3f2fd",
  },
  statusText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  statusTextConnected: {
    color: "#2196F3",
  },
  card: {
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});