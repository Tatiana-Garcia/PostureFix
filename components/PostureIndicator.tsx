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

  const iconName = isBadPosture ? "seat-recline-extra" : "seat-recline-normal";
  const iconColor = isBadPosture ? "#e57373" : "#81c784";
  const message = isBadPosture ? "¡Arregla tu postura!" : "¡Buen trabajo!";
  const circleStyle = isBadPosture ? styles.badCircle : styles.goodCircle;
  const messageStyle = isBadPosture ? styles.badWarning : styles.goodWarning;

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
          size={120}
          color={iconColor}
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
    marginVertical: 20,
  },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: "#c4c4c4",
    justifyContent: "center",
    alignItems: "center",
  },
  badCircle: {
    borderColor: "#e57373",
  },
  goodCircle: {
    borderColor: "#81c784",
  },
  badWarning: {
    color: "#e57373",
  },
  goodWarning: {
    color: "#81c784",
  },
  warning: {
    marginTop: 12,
  },
  angle: {
    fontWeight: "bold",
  },
});