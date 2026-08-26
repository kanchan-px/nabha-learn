import apiClient from "./client";
import type { Module, Lesson } from "./courses.api";

export interface CreateModulePayload {
  title: string;
}

export interface CreateLessonPayload {
  title: string;
  bodyText?: string;
  videoUrl?: string;
  pdfUrl?: string;
}

export async function createModule(
  courseId: string,
  payload: CreateModulePayload
): Promise<Module> {
  const response = await apiClient.post<{ module: Module }>(
    `/courses/${courseId}/modules`,
    payload
  );
  return response.data.module;
}

export async function createLesson(
  moduleId: string,
  payload: CreateLessonPayload
): Promise<Lesson> {
  const response = await apiClient.post<{ lesson: Lesson }>(
    `/modules/${moduleId}/lessons`,
    payload
  );
  return response.data.lesson;
}
