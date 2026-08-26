import apiClient from "./client";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  gradeLevel: string | null;
  language: string;
  isPublished: boolean;
  createdAt: string;
}

export async function getCourses(): Promise<Course[]> {
  const response = await apiClient.get<{ courses: Course[] }>("/courses");
  return response.data.courses;
}
