import apiClient from "./client";

export interface School {
  id: string;
  name: string;
  udiseCode: string | null;
  district: string;
  state: string;
  createdAt: string;
}

export interface CreateSchoolPayload {
  name: string;
  district: string;
  udiseCode?: string;
  state?: string;
}

export async function getSchools(): Promise<School[]> {
  const response = await apiClient.get<{ schools: School[] }>("/schools");
  return response.data.schools;
}

export async function createSchool(payload: CreateSchoolPayload): Promise<School> {
  const response = await apiClient.post<{ school: School }>("/schools", payload);
  return response.data.school;
}
