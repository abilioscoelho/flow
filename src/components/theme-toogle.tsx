import Feather from "@expo/vector-icons/Feather";
import { useEffect, useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";

import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dark = colorScheme === "dark";

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: dark ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [dark, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity
      onPress={toggleColorScheme}
      activeOpacity={0.7}
      className={cn(
        className,
        "w-12 h-12 rounded-full items-center justify-center border shadow-lg",
        dark ? "bg-[#1a1a1a] border-[#262626]" : "bg-white border-gray-200"
      )}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Feather
          name={dark ? "sun" : "moon"}
          size={22}
          color={dark ? "#fbbf24" : "#6b7280"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
