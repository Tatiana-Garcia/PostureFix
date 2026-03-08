import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface Props {
  angle: number;
  isBadPosture?: boolean;
}

export const PostureIndicator: React.FC<Props> = ({
  angle,
  isBadPosture = true,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isBadPosture) {
      scale.value = withRepeat(
        withTiming(1.05, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [isBadPosture]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Keep sitting posture icons for both states, but still lean based on angle
  const iconName = isBadPosture ? "seat-recline-extra" : "seat-recline-normal";
  const iconColor = isBadPosture ? "#e57373" : "#81c784";
  const message = isBadPosture ? "¡Arregla tu postura!" : "¡Buen trabajo!";
  const circleStyle = isBadPosture ? styles.badCircle : styles.goodCircle;
  const messageStyle = isBadPosture ? styles.badWarning : styles.goodWarning;

  // Limit how much the icon leans so it doesn't rotate too extremely
  const clampedAngle = Math.max(-15, Math.min(angle, 45));

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.circle,
          circleStyle,
          animatedStyle,
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={100}
          color={iconColor}
          style={{ transform: [{ rotate: `${clampedAngle}deg` }] }}
        />
      </Animated.View>

      <Text variant="titleMedium" style={[styles.warning, messageStyle]}>
        {message}
      </Text>

      <Text variant="headlineSmall" style={styles.angle}>
        {angle.toFixed(1)}°
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  badCircle: {
    borderColor: "#e57373",
    backgroundColor: "#ffebee",
  },
  goodCircle: {
    borderColor: "#81c784",
    backgroundColor: "#e8f5e9",
  },
  badWarning: {
    color: "#e57373",
  },
  goodWarning: {
    color: "#81c784",
  },
  warning: {
    marginTop: 8,
  },
  angle: {
    fontWeight: "bold",
    fontSize: 18,
  },
});