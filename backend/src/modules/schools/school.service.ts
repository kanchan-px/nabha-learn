import { PrismaClient } from "@prisma/client";
import { CreateSchoolInput } from "./school.validation";

const prisma = new PrismaClient();

export async function createSchool(data: CreateSchoolInput) {
  return prisma.school.create({
    data: {
      name: data.name,
      udiseCode: data.udiseCode,
      district: data.district,
      state: data.state,
    },
  });
}

export async function listSchools() {
  return prisma.school.findMany({
    orderBy: { name: "asc" },
  });
}
