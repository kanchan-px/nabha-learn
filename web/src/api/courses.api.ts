import apiClient from "./client";

export interface Lesson {
  id: string;
  title: string;
  order: number;
  bodyText: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  gradeLevel: string | null;
  language: string;
  isPublished: boolean;
  createdAt: string;
  modules?: Module[];
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  gradeLevel?: string;
}

export async function getCourses(): Promise<Course[]> {
  const response = await apiClient.get<{ courses: Course[] }>("/courses");
  return response.data.courses;
}

export async function getCourseById(courseId: string): Promise<Course> {
  const response = await apiClient.get<{ course: Course }>(`/courses/${courseId}`);
  return response.data.course;
}

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const response = await apiClient.post<{ course: Course }>("/courses", payload);
  return response.data.course;
}

export async function updateCourse(
  courseId: string,
  payload: Partial<CreateCoursePayload & { isPublished: boolean }>
): Promise<Course> {
  const response = await apiClient.patch<{ course: Course }>(`/courses/${courseId}`, payload);
  return response.data.course;
}
