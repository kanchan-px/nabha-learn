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
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getCourseById } from "../api/courses.api";
import type { Course } from "../api/courses.api";
import { downloadCourse, isCourseDownloaded } from "../db/download";
import { useIsOnline } from "../hooks/useIsOnline";
import { getOfflineCourseById } from "../db/offlineCourses";

type CourseDetailRouteProp = RouteProp<RootStackParamList, "CourseDetail">;
type CourseDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, "CourseDetail">;

export default function CourseDetailScreen() {
  const route = useRoute<CourseDetailRouteProp>();
  const navigation = useNavigation<CourseDetailNavigationProp>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const { isOnline, isReady } = useIsOnline();

  // 1. Fetch course (online or offline depending on connectivity)
  useEffect(() => {
    if (!courseId || !isReady) return;
    let ignore = false;

    async function fetchCourse() {
      setIsLoading(true);

      try {
        const data = isOnline
          ? await getCourseById(courseId)
          : await getOfflineCourseById(courseId);

        if (!ignore) setCourse(data);
      } catch (err) {
        console.error("COURSE DETAIL LOAD ERROR:", err);
        if (!ignore) setError("Failed to load course");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchCourse();

    return () => {
      ignore = true;
    };
  }, [courseId, refreshIndex, isOnline, isReady]);

  // 2. Check offline download status
  useEffect(() => {
    let ignore = false;

    async function checkDownloaded() {
      try {
        const downloaded = await isCourseDownloaded(courseId);
        if (!ignore) setIsDownloaded(downloaded);
      } catch {
        if (!ignore) setIsDownloaded(false);
      }
    }

    checkDownloaded();

    return () => {
      ignore = true;
    };
  }, [courseId]);

  function refresh() {
    setRefreshIndex((i) => i + 1);
  }

  async function handleDownload() {
    setDownloadError("");
    setIsDownloading(true);

    try {
      await downloadCourse(courseId);
      setIsDownloaded(true);
    } catch {
      setDownloadError("Download failed. Check your connection and try again.");
    } finally {
      setIsDownloading(false);
    }
  }

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      {course.description ? <Text style={styles.description}>{course.description}</Text> : null}

      {isOnline && isReady && (
        <View style={styles.downloadRow}>
          <TouchableOpacity
            style={[styles.downloadButton, isDownloaded && styles.downloadButtonDone]}
            onPress={handleDownload}
            disabled={isDownloading || isDownloaded}
          >
            {isDownloading ? (
              <ActivityIndicator color={isDownloaded ? "#059669" : "#FFFFFF"} />
            ) : (
              <Text
                style={[styles.downloadButtonText, isDownloaded && styles.downloadButtonTextDone]}
              >
                {isDownloaded ? "Downloaded for Offline ✓" : "Download for Offline"}
              </Text>
            )}
          </TouchableOpacity>

          {downloadError ? <Text style={styles.errorText}>{downloadError}</Text> : null}
        </View>
      )}

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
  downloadRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  downloadButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  downloadButtonDone: {
    backgroundColor: "#D1FAE5",
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  downloadButtonTextDone: {
    color: "#059669",
  },
});