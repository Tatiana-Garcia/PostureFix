import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface Props {
  rectoSeconds: number;
  encorvadoSeconds: number;
}

function formatMinutes(seconds: number) {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  return `${mins} min`;
}

export const ModeSelector: React.FC<Props> = ({
  rectoSeconds,
  encorvadoSeconds,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.pill, styles.goodPill]}>
        <Text style={styles.minutes}>{formatMinutes(rectoSeconds)}</Text>
        <Text style={styles.label}>Recto</Text>
      </View>

      <View style={[styles.pill, styles.badPill]}>
        <Text style={styles.minutes}>{formatMinutes(encorvadoSeconds)}</Text>
        <Text style={styles.label}>Encorvado</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  pill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
  },
  goodPill: {
    borderColor: "#81c784",
    backgroundColor: "#e8f5e9",
  },
  badPill: {
    borderColor: "#e57373",
    backgroundColor: "#ffebee",
  },
  minutes: {
    fontSize: 16,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  label: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.85,
  },
});