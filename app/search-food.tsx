import { Colors } from "@/constants/Colors";
import { searchFoods } from "@/services/fatSecretService";
import {
  Add01Icon,
  ArrowLeft01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FoodItem {
  food_id: string;
  food_name: string;
  food_description: string;
  brand_name?: string;
}

export default function SearchFoodScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length >= 3) {
      setIsLoading(true);
      try {
        const data = await searchFoods(text);
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults([]);
    }
  }, []);

  const parseDescription = (desc: string) => {
    // Typical desc: "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
    // We want "Per 100g" and "52kcal"
    const parts = desc.split(" - ");
    const serving = parts[0] || "";
    const caloriesMatch = desc.match(/Calories:\s*(\d+kcal)/i);
    const calories = caloriesMatch ? caloriesMatch[1] : "";

    // Better localized display
    const localizedServing = serving.replace("Per ", "Порція: ");
    const localizedCalories = calories.replace("kcal", " ккал");

    return { serving: localizedServing, calories: localizedCalories };
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => {
    const { serving, calories } = parseDescription(item.food_description);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/log-food-details",
            params: { foodId: item.food_id },
          })
        }
      >
        <View style={styles.cardInfo}>
          <Text style={styles.foodName} numberOfLines={1}>
            {item.food_name}
          </Text>
          <View style={styles.foodDetails}>
            <Text style={styles.servingText}>{serving}</Text>
            <Text style={styles.caloriesText}>{calories}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.6}
          onPress={() =>
            router.push({
              pathname: "/log-food-details",
              params: { foodId: item.food_id },
            })
          }
        >
          <HugeiconsIcon
            icon={Add01Icon}
            size={24}
            color={Colors.primary[500]}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Пошук продуктів</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <HugeiconsIcon
            icon={Search01Icon}
            size={20}
            color={Colors.text.muted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Введіть назву продукту..."
            value={query}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.text.muted}
            autoFocus
          />
          {isLoading && <ActivityIndicator color={Colors.primary[500]} />}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.food_id}
        renderItem={renderFoodItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading && query.length >= 3 ? (
            <Text style={styles.emptyText}>Нічого не знайдено</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[0],
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  foodDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  servingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary[500],
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: Colors.text.muted,
  },
});
