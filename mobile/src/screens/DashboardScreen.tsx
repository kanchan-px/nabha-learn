import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../context/useAuth";
import { getCourses } from "../api/courses.api";
import type { Course } from "../api/courses.api";

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

export default function DashboardScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();
  const navigation = useNavigation<DashboardNavigationProp>();

  useEffect(() => {
    let ignore = false;

    async function fetchCourses() {
      try {
        const data = await getCourses();
        if (!ignore) setCourses(data);
      } catch {
        if (!ignore) setError("Failed to load courses");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchCourses();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.subGreeting}>Continue your learning</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      )}

      {!isLoading && error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && courses.length === 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No courses available yet.</Text>
        </View>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.courseCard}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("CourseDetail", {
                  courseId: item.id,
                  courseTitle: item.title,
                })
              }
            >
              <Text style={styles.courseTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.courseDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              {item.gradeLevel ? (
                <Text style={styles.courseGrade}>Grade {item.gradeLevel}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subGreeting: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 13,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 15,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
  },
  listContent: {
    padding: 20,
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  courseDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  courseGrade: {
    fontSize: 12,
    color: "#0F766E",
    fontWeight: "600",
    marginTop: 10,
  },
});