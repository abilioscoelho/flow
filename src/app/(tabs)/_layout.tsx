import { ThemeToggle } from "@/components/theme-toogle";
import { useColorScheme } from "@/lib/useColorScheme";
import Icon from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.grey3,
            borderTopWidth: 1,
            height: 60 + bottom,
            paddingTop: 8,
            paddingBottom: bottom,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.grey,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarIcon: ({ color, size, focused }) => (
              <Icon
                name="home"
                size={focused ? size : size - 2}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: "Horários",
            tabBarIcon: ({ color, size, focused }) => (
              <Icon
                name="clock"
                size={focused ? size : size - 2}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: "Sobre",
            tabBarIcon: ({ color, size, focused }) => (
              <Icon
                name="info"
                size={focused ? size : size - 2}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <ThemeToggle className="absolute bottom-24 right-2" />
    </>
  );
}
