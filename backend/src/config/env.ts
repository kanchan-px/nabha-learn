function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT || "4000",
  databaseUrl: getEnvVar("DATABASE_URL"),
  jwtSecret: getEnvVar("JWT_SECRET"),
};
