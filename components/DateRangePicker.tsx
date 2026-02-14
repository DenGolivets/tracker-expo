import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DateRangePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH / 7;

export default function DateRangePicker({
  selectedDate,
  onDateSelect,
}: DateRangePickerProps) {
  const [dates, setDates] = useState<Date[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const generateDates = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0-6
      const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() - daysToMonday);

      const newDates = [];
      // Generate 1 week back and current week
      // Start from 1 week ago Monday
      const startDate = new Date(currentMonday);
      startDate.setDate(currentMonday.getDate() - 7);

      // Total 2 weeks = 14 days
      for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        newDates.push(date);
      }
      return newDates;
    };

    const generatedDates = generateDates();
    setDates(generatedDates);

    // Scroll to current week (index 7 starts the current week)
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: 7,
        animated: false,
      });
    }, 100);
  }, []);

  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const renderItem = ({ item }: { item: Date; index: number }) => {
    const isSelected = isSameDay(item, selectedDate);

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => onDateSelect(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.pillContainer,
            isSelected && styles.pillContainerSelected,
          ]}
        >
          <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
            {item.toLocaleDateString("uk-UA", { weekday: "short" })}
          </Text>
          <View
            style={[styles.dateCircle, isSelected && styles.dateCircleSelected]}
          >
            <Text
              style={[
                styles.dateNumber,
                isSelected && styles.dateNumberSelected,
              ]}
            >
              {item.getDate()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => item.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  pillContainer: {
    width: 48, // Fixed width for the visual pill
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  pillContainerSelected: {
    backgroundColor: "#298f50",
    borderColor: "#298f50",
    borderWidth: 0,
    elevation: 4,
    shadowColor: "#298f50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dayName: {
    fontSize: 12,
    color: Colors.neutral[400],
    fontWeight: "500",
  },
  dayNameSelected: {
    color: Colors.neutral[0],
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral[0],
  },
  dateCircleSelected: {
    backgroundColor: Colors.neutral[0],
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.neutral[900],
  },
  dateNumberSelected: {
    color: Colors.neutral[900],
  },
});
