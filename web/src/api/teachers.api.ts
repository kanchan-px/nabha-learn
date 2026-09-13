import apiClient from "./client";

export interface Teacher {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
  schoolId: string | null;
  school: { name: string } | null;
  createdAt: string;
}

export interface CreateTeacherPayload {
  name: string;
  password: string;
  schoolId: string;
  email?: string;
}

export interface CreateTeacherResponse {
  teacher: Teacher;
  generatedPassword: string;
}

export async function getTeachers(): Promise<Teacher[]> {
  const response = await apiClient.get<{ teachers: Teacher[] }>("/teachers");
  return response.data.teachers;
}

export async function createTeacher(payload: CreateTeacherPayload): Promise<CreateTeacherResponse> {
  const response = await apiClient.post<CreateTeacherResponse>("/teachers", payload);
  return response.data;
}

export async function setTeacherActive(teacherId: string, isActive: boolean): Promise<Teacher> {
  const response = await apiClient.patch<{ teacher: Teacher }>(`/teachers/${teacherId}`, {
    isActive,
  });
  return response.data.teacher;
}
