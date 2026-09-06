import apiClient from "./client";

export interface StudentInfo {
  id: string;
  name: string;
  username: string;
}

export interface LessonStatus {
  lessonId: string;
  status: "NOT_STARTED" | "LESSON_OPENED" | "LESSON_COMPLETED";
}

export interface StudentProgress {
  student: StudentInfo;
  lessonStatuses: LessonStatus[];
}

export interface CourseProgress {
  course: { id: string; title: string };
  lessonIds: string[];
  progressGrid: StudentProgress[];
}

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  const response = await apiClient.get<CourseProgress>(`/courses/${courseId}/progress`);
  return response.data;
}
