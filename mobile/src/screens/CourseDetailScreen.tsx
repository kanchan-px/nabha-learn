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
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getCourseById } from "../api/courses.api";
import type { Course } from "../api/courses.api";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type CourseDetailRouteProp = RouteProp<RootStackParamList, "CourseDetail">;
type CourseDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, "CourseDetail">;

export default function CourseDetailScreen() {
  const route = useRoute<CourseDetailRouteProp>();
  const navigation = useNavigation<CourseDetailNavigationProp>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchCourse() {
      try {
        const data = await getCourseById(courseId);
        if (!ignore) setCourse(data);
      } catch {
        if (!ignore) setError("Failed to load course");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchCourse();

    return () => {
      ignore = true;
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>{error || "Course not found"}</Text>
      </View>
    );
  }

  const allLessons = (course.modules ?? []).flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      {course.description ? <Text style={styles.description}>{course.description}</Text> : null}

      <FlatList
        data={course.modules ?? []}
        keyExtractor={(module) => module.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: module }) => (
          <View style={styles.moduleBlock}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            {module.lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonRow}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("LessonViewer", {
                    lesson: {
                      id: lesson.id,
                      title: lesson.title,
                      bodyText: lesson.bodyText,
                      videoUrl: lesson.videoUrl,
                      pdfUrl: lesson.pdfUrl,
                    },
                  })
                }
              >
                <View style={styles.lessonBullet} />
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No content added to this course yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 15,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  listContent: {
    padding: 20,
  },
  moduleBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  lessonBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0F766E",
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },
});
