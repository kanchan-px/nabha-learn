import { create } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiClient = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});


apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;