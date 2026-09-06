import apiClient from "./client";

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

export interface CreateQuizPayload {
  title: string;
  questions: QuizQuestion[];
}

export async function createQuiz(lessonId: string, payload: CreateQuizPayload) {
  const response = await apiClient.post(`/lessons/${lessonId}/quiz`, payload);
  return response.data.quiz;
}

export async function checkQuizExists(lessonId: string): Promise<boolean> {
  try {
    await apiClient.get(`/lessons/${lessonId}/quiz`);
    return true;
  } catch {
    return false;
  }
}
