import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/useAuth";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CourseDetailScreen from "../screens/CourseDetailScreen";
import LessonViewerScreen from "../screens/LessonViewerScreen";
import QuizScreen from "../screens/QuizScreen";

export type LessonParam = {
  id: string;
  title: string;
  bodyText: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
};

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CourseDetail: { courseId: string; courseTitle: string };
  LessonViewer: { lesson: LessonParam };
  QuizScreen: { lessonId: string; lessonTitle: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={({ route }) => ({ title: route.params.courseTitle })}
            />
            <Stack.Screen
              name="LessonViewer"
              component={LessonViewerScreen}
              options={({ route }) => ({ title: route.params.lesson.title })}
            />
            <Stack.Screen
              name="QuizScreen"
              component={QuizScreen}
              options={({ route }) => ({ title: `Quiz: ${route.params.lessonTitle}` })}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
