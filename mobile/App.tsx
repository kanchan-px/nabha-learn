import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase } from "./src/db/schema";
import { syncPendingData } from "./src/db/sync";

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function initializeDatabase() {
      await initDatabase();
      setIsDbReady(true);
    }

    initializeDatabase();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingData().catch(() => {});
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