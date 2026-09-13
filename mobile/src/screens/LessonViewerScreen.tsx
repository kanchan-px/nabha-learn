import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { logProgress } from "../api/progress.api";

import { getLessonStatus } from "../api/progress.api";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getQuizForLesson } from "../api/quiz.api";
import { useIsOnline } from "../hooks/useIsOnline";
import { getOfflineQuizForLesson } from "../db/offlineCourses";
import { saveOfflineProgressEvent, getOfflineLessonStatus } from "../db/offlineProgress";
import axios from "axios";

type LessonViewerRouteProp = RouteProp<RootStackParamList, "LessonViewer">;
type LessonViewerNavigationProp = NativeStackNavigationProp<RootStackParamList, "LessonViewer">;

export default function LessonViewerScreen() {
  const route = useRoute<LessonViewerRouteProp>();
  const { lesson } = route.params;

  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [hasQuiz, setHasQuiz] = useState(false);
  const navigation = useNavigation<LessonViewerNavigationProp>();
  const { isOnline, isReady } = useIsOnline();

  const player = useVideoPlayer(lesson.videoUrl ?? "", (playerInstance) => {
    playerInstance.loop = false;
  });

  useEffect(() => {
    let ignore = false;

    async function checkStatus() {
      try {
        const status = await getLessonStatus(lesson.id);
        if (!ignore && status === "LESSON_COMPLETED") {
          setIsCompleted(true);
        }
      } catch {
        const offlineStatus = await getOfflineLessonStatus(lesson.id);
        if (!ignore && offlineStatus === "LESSON_COMPLETED") {
          setIsCompleted(true);
        }
      }
    }

    async function logOpened() {
      try {
        await logProgress(lesson.id, "LESSON_OPENED");
      } catch {
        await saveOfflineProgressEvent(lesson.id, "LESSON_OPENED");
      }
    }

    checkStatus();
    logOpened();

    return () => {
      ignore = true;
    };
  }, [lesson.id]);

  useEffect(() => {
    if (!isReady) return;
    let ignore = false;

    async function checkQuiz() {
      console.log("CHECKING QUIZ — isOnline:", isOnline, "lessonId:", lesson.id);
      try {
        const quiz = isOnline
          ? await getQuizForLesson(lesson.id)
          : await getOfflineQuizForLesson(lesson.id);
        console.log("QUIZ RESULT:", JSON.stringify(quiz));
        if (!ignore) setHasQuiz(!!quiz);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          if (!ignore) {
            setHasQuiz(false);
          }
          return;
        }

        console.error("QUIZ CHECK ERROR:", err);
      }
    }

    checkQuiz();

    return () => {
      ignore = true;
    };
  }, [lesson.id, isOnline, isReady]);

  async function handleMarkComplete() {
    setIsCompleting(true);
    try {
      try {
        await logProgress(lesson.id, "LESSON_COMPLETED");
      } catch {
        await saveOfflineProgressEvent(lesson.id, "LESSON_COMPLETED");
      }
      setIsCompleted(true);
    } finally {
      setIsCompleting(false);
    }
  }

  function handleOpenPdf() {
    if (lesson.pdfUrl) {
      Linking.openURL(lesson.pdfUrl);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {lesson.videoUrl ? (
          <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
        ) : null}

        {lesson.bodyText ? <Text style={styles.bodyText}>{lesson.bodyText}</Text> : null}

        {lesson.pdfUrl ? (
          <TouchableOpacity style={styles.pdfButton} onPress={handleOpenPdf}>
            <Text style={styles.pdfButtonText}>Open PDF</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.completeButton, isCompleted && styles.completeButtonDone]}
          onPress={handleMarkComplete}
          disabled={isCompleting || isCompleted}
        >
          {isCompleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.completeButtonText}>
              {isCompleted ? "Completed ✓" : "Mark as Complete"}
            </Text>
          )}
        </TouchableOpacity>
        {hasQuiz && (
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() =>
              navigation.navigate("QuizScreen", {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
              })
            }
          >
            <Text style={styles.quizButtonText}>Take Quiz</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 20,
  },
  video: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: "#000",
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 20,
  },
  pdfButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  pdfButtonText: {
    color: "#0F766E",
    fontWeight: "600",
    fontSize: 15,
  },
  completeButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  completeButtonDone: {
    backgroundColor: "#059669",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  quizButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  quizButtonText: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "600",
  },
});
