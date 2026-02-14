import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../constants/Colors";

type Props = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  segments?: number;
  gapAngle?: number;
  value?: number;
  label?: string;
};

export function SegmentedHalfCircleProgress30({
  progress,
  size = 60,
  strokeWidth = 28,
  segments = 15,
  gapAngle = 25,
  value,
  label,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const totalAngle = 180;
  const totalGap = gapAngle * (segments - 1);

  const segmentAngle = (totalAngle - totalGap) / segments;
  const activeSegments = Math.round(clamped * segments);

  const polarToCartesian = (angle: number) => {
    const rad = (Math.PI / 180) * angle;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 0 0 ${end.x} ${end.y}
    `;
  };

  return (
    <View
      style={{
        width: size,
        height: size / 2,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Svg width={size} height={size / 2}>
        {Array.from({ length: segments }).map((_, i) => {
          const angleStart = 180 + (segmentAngle + gapAngle) * i;
          const angleEnd = angleStart + segmentAngle;

          const isActive = i < activeSegments;

          return (
            <Path
              key={i}
              d={createArc(angleStart, angleEnd)}
              fill="none"
              stroke={isActive ? Colors.primary[500] : Colors.primary[50]}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
            />
          );
        })}
      </Svg>
      <View style={styles.textOverlay}>
        <Text style={styles.mainText}>🔥</Text>
        <Text style={styles.mainText}>{value}</Text>
        <Text style={styles.subText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textOverlay: {
    position: "absolute",
    bottom: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  mainText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  subText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
