import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase } from "./src/db/schema";
import { syncPendingData } from "./src/db/sync";
import { getMediaRecord } from "./src/db/offlineMedia";

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        await initDatabase();
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    }

    initializeDatabase();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingData().catch((error) => {
          console.error("Sync failed:", error);
        });
      }
    });

    return () => unsubscribe();
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