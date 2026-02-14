import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ActionMenuModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
}

const ACTION_ITEMS = [
  {
    id: "log-exercise",
    label: "Записати вправу",
    icon: "dumbbell",
    color: Colors.semantic.info,
  },
  {
    id: "add-water",
    label: "Додати воду",
    icon: "water",
    color: Colors.primary[500],
  },
  {
    id: "food-db",
    label: "База страв",
    icon: "database",
    color: Colors.semantic.success,
  },
  {
    id: "scan-food",
    label: "Сканувати страву",
    icon: "qrcode-scan",
    color: Colors.text.muted,
    isPremium: true,
  },
];

export const ActionMenuModal: React.FC<ActionMenuModalProps> = ({
  isVisible,
  onClose,
  onAction,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <View style={styles.grid}>
                {ACTION_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridItem}
                    onPress={() => {
                      onAction(item.id);
                      onClose();
                    }}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={32}
                        color={item.color}
                      />
                      {item.isPremium && (
                        <View style={styles.premiumBadge}>
                          <MaterialCommunityIcons
                            name="crown"
                            size={12}
                            color="#FFD700"
                          />
                        </View>
                      )}
                    </View>
                    <View style={styles.labelContainer}>
                      <Text style={styles.label}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    paddingBottom: 100, // Position above FAB
    paddingHorizontal: 20,
  },
  menuContainer: {
    backgroundColor: Colors.transparent,
    borderRadius: 32,
    padding: 10,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.2,
    // shadowRadius: 12,
    // elevation: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  gridItem: {
    width: "47%", // Roughly 2 items per row with gap
    aspectRatio: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.neutral[0],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.text.primary,
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },
  labelContainer: {
    minHeight: 40,
    // justifyContent: "center",
    // alignItems: "center",
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
    lineHeight: 18,
  },
});
