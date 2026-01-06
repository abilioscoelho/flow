import React from "react";
import { Text, View } from "react-native";

export default function About() {
  return (
    <View className="flex-1 justify-center bg-background">
      <View className="flex-row items-center justify-between p-4 bg-card">
        <Text className="text-primary">Sobre</Text>
      </View>
    </View>
  );
}
