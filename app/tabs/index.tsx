import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { HelpSection } from "../../components/HelpSection";
import { ModeSelector } from "../../components/ModeSelector";
import { PostureIndicator } from "../../components/PostureIndicator";
import { TimerPill } from "../../components/TimerPill";
import { saveSession } from "../../utils/sessionStorage";

export default function Index() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [rectoSeconds, setRectoSeconds] = React.useState(0);
  const [encorvadoSeconds, setEncorvadoSeconds] = React.useState(0);

  const [angle, setAngle] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const isBadPosture = angle > 20;

  React.useEffect(() => {
  const ws = new WebSocket("ws://10.179.4.102:81");

  ws.onopen = () => {
    setIsConnected(true); 
    console.log("Connected to ESP32 WebSocket");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (typeof data.angle === "number") setAngle(data.angle);
    } catch (err) {
      console.error("Failed to parse WebSocket message:", event.data);
    }
  };

  ws.onerror = (error) => {
    console.log("WebSocket error:", error);
  };

  ws.onclose = () => {
    setIsConnected(false);
    console.log("WebSocket closed");
  };

  return () => ws.close();
}, []);

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
      <View style={styles.section}>
        <ModeSelector
          rectoSeconds={rectoSeconds}
          encorvadoSeconds={encorvadoSeconds}
        />
      </View>
      <View style={styles.section}>
        <PostureIndicator angle={angle} isBadPosture={isBadPosture} />
      </View>
      <View style={styles.section}>
        <TimerPill elapsedSeconds={elapsedSeconds} isRunning={isRunning} />
      </View>
      <View style={styles.section}>
        <Button mode="contained" style={styles.button} onPress={onToggleSession}>
          {isRunning ? "Terminar sesión" : "Empezar sesión"}
        </Button>
      </View>
      <View style={styles.section}>
        <HelpSection />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f1f6",
  },
  section: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 30,
  },
   warning: {
    backgroundColor: "#ffe6e6",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  warningText: {
    color: "#cc0000",
    fontWeight: "bold",
    textAlign: "center",
  },
  container2: { flex: 1, padding: 20 },
  section2: { marginVertical: 10 },
  button2: { marginVertical: 10 },
});