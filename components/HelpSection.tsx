import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

export const HelpSection: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        ¿Tu postura no está alineada?
      </Text>
      <TouchableOpacity onPress={() => router.push("/tabs/settings")}>
        <Text style={styles.link}>
          Calibra el dispositivo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 8,
  },
  text: {
    fontSize: 12,
  },
  link: {
    color: "#2196F3",
    fontWeight: "bold",
    marginTop: 4,
  },
});