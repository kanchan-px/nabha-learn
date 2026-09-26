import apiClient from "./client";

export interface Student {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
  gradeLevel: string | null;
  createdAt: string;
}

export interface CreateStudentPayload {
  name: string;
  password: string;
}

export interface CreateStudentResponse {
  student: Student;
  generatedPassword: string;
}

export async function getStudents(): Promise<Student[]> {
  const response = await apiClient.get<{ students: Student[] }>("/students");
  return response.data.students;
}

export async function createStudent(payload: CreateStudentPayload): Promise<CreateStudentResponse> {
  const response = await apiClient.post<CreateStudentResponse>("/students", payload);
  return response.data;
}

export async function setStudentGrade(studentId: string, gradeLevel: string): Promise<Student> {
  const response = await apiClient.patch<{ student: Student }>(`/students/${studentId}`, {
    gradeLevel,
  });
  return response.data.student;
}

export async function setStudentActive(studentId: string, isActive: boolean): Promise<Student> {
  const response = await apiClient.patch<{ student: Student }>(`/students/${studentId}`, {
    isActive,
  });
  return response.data.student;
}
