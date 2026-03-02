import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface Props {
  elapsedSeconds: number;
  isRunning?: boolean;
}

function formatStopwatch(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export const TimerPill: React.FC<Props> = ({ elapsedSeconds, isRunning }) => {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.time}>
        {formatStopwatch(elapsedSeconds)}
      </Text>
      <Text variant="bodySmall" style={styles.subtle}>
        {isRunning ? "Sesión en curso" : "Sesión detenida"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e6e1e8",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 2,
  },
  time: {
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  subtle: {
    opacity: 0.7,
  },
});