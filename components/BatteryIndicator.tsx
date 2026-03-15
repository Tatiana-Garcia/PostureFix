import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface Props {
  batteryLevel: number | null;
}

export const BatteryIndicator: React.FC<Props> = ({ batteryLevel }) => {
  if (batteryLevel === null) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons 
          name="battery-unknown" 
          size={16} 
          color="#999" 
        />
        <Text style={[styles.text, { color: "#999" }]}>
          --
        </Text>
      </View>
    );
  }

  const getBatteryIcon = (level: number): string => {
    if (level > 75) return "battery";
    if (level > 50) return "battery-70";
    if (level > 25) return "battery-50";
    if (level > 10) return "battery-30";
    return "battery-alert";
  };

  const getBatteryColor = (level: number): string => {
    if (level > 50) return "#4caf50"; // Green
    if (level > 20) return "#ff9800"; // Orange
    return "#f44336"; // Red
  };

  const iconName = getBatteryIcon(batteryLevel);
  const iconColor = getBatteryColor(batteryLevel);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name={iconName} 
        size={16} 
        color={iconColor} 
      />
      <Text style={[styles.text, { color: iconColor }]}>
        {batteryLevel}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});