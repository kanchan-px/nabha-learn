import apiClient from "./client";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptResult {
  score: number;
  totalMarks: number;
}

export async function getQuizForLesson(lessonId: string): Promise<Quiz | null> {
  try {
    const response = await apiClient.get<{ quiz: Quiz }>(`/lessons/${lessonId}/quiz`);
    return response.data.quiz;
  } catch {
    return null;
  }
}

export async function submitQuizAttempt(
  lessonId: string,
  answers: Array<{ questionId: string; selectedOptionId: string }>
): Promise<QuizAttemptResult> {
  const response = await apiClient.post<{ attempt: QuizAttemptResult }>(
    `/lessons/${lessonId}/quiz/submit`,
    { answers }
  );
  return response.data.attempt;
}