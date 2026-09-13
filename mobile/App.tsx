import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase, getDb } from "./src/db/schema";

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function initializeDatabase() {
      await initDatabase();
      setIsDbReady(true);

      const db = await getDb();
      const allQuizzes = await db.getAllAsync("SELECT * FROM downloaded_quizzes");

      const allOptions = await db.getAllAsync("SELECT * FROM downloaded_options");
    }

    initializeDatabase();
  }, []);

  if (!isDbReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
