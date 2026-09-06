import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getQuizForLesson, submitQuizAttempt } from "../api/quiz.api";
import type { Quiz, QuizAttemptResult } from "../api/quiz.api";

type QuizScreenRouteProp = RouteProp<RootStackParamList, "QuizScreen">;

export default function QuizScreen() {
  const route = useRoute<QuizScreenRouteProp>();
  const { lessonId } = route.params;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadQuiz() {
      const data = await getQuizForLesson(lessonId);
      if (!ignore) {
        setQuiz(data);
        setIsLoading(false);
      }
    }

    loadQuiz();

    return () => {
      ignore = true;
    };
  }, [lessonId]);

  function selectOption(questionId: string, optionId: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (!quiz) return;

    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id],
    }));

    if (answers.some((a) => !a.selectedOptionId)) {
      setError("Please answer every question before submitting.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const attemptResult = await submitQuizAttempt(lessonId, answers);
      setResult(attemptResult);
    } catch {
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetake() {
    setSelectedAnswers({});
    setResult(null);
  }

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>Quiz not found</Text>
      </View>
    );
  }

  if (result) {
    const passed = result.score / result.totalMarks >= 0.5;
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.centerContent}>
          <Text style={styles.resultEmoji}>{passed ? "🎉" : "📘"}</Text>
          <Text style={styles.resultScore}>
            {result.score} / {result.totalMarks}
          </Text>
          <Text style={styles.resultLabel}>
            {passed ? "Well done!" : "Keep practicing — you can try again."}
          </Text>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeButtonText}>Retake Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.quizTitle}>{quiz.title}</Text>

        {quiz.questions.map((question, index) => (
          <View key={question.id} style={styles.questionBlock}>
            <Text style={styles.questionText}>
              {index + 1}. {question.text}
            </Text>
            {question.options.map((option) => {
              const isSelected = selectedAnswers[question.id] === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => selectOption(question.id, option.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]} />
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Quiz</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  content: { padding: 20 },
  errorText: { color: "#DC2626", fontSize: 15, textAlign: "center", marginBottom: 12 },
  quizTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 16 },
  questionBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  questionText: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  optionRowSelected: {
    borderColor: "#0F766E",
    backgroundColor: "#F0FDFA",
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 10,
  },
  radioSelected: {
    borderColor: "#0F766E",
    backgroundColor: "#0F766E",
  },
  optionText: { fontSize: 15, color: "#374151", flex: 1 },
  submitButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  resultEmoji: { fontSize: 48, marginBottom: 12 },
  resultScore: { fontSize: 32, fontWeight: "700", color: "#111827" },
  resultLabel: { fontSize: 15, color: "#6B7280", marginTop: 8, marginBottom: 24 },
  retakeButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retakeButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});