import apiClient from "./client";

export type ProgressEventType = "LESSON_OPENED" | "LESSON_COMPLETED" | "NOT_STARTED";

export async function logProgress(lessonId: string, eventType: "LESSON_OPENED" | "LESSON_COMPLETED") {
  await apiClient.post(`/lessons/${lessonId}/progress`, { eventType });
}

export async function getLessonStatus(lessonId: string): Promise<ProgressEventType> {
  const response = await apiClient.get<{ status: ProgressEventType }>(`/lessons/${lessonId}/progress`);
  return response.data.status;
}