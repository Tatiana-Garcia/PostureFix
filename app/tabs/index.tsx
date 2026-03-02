import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { HelpSection } from "../../components/HelpSection";
import { ModeSelector } from "../../components/ModeSelector";
import { PostureIndicator } from "../../components/PostureIndicator";
import { TimerPill } from "../../components/TimerPill";

export default function Index() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [rectoSeconds, setRectoSeconds] = React.useState(0);
  const [encorvadoSeconds, setEncorvadoSeconds] = React.useState(0);

  const angle = 17;
  const isBadPosture = angle > 20;

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

  const onToggleSession = () => {
    if (!isRunning) {
      // start session fresh
      setElapsedSeconds(0);
      setRectoSeconds(0);
      setEncorvadoSeconds(0);
      setIsRunning(true);
      return;
    }

    // stop session
    setIsRunning(false);
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
});