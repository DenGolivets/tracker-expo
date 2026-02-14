import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AddScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add New Entry</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.neutral[800],
  },
});
