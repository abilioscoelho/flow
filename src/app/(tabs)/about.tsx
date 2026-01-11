import { useColorScheme } from "@/lib/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function About() {
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useColorScheme();

  const technologies = [
    "C++",
    "React Native",
    "Socket.IO",
    "TypeScript",
    "AdonisJS",
    "Postgresql",
  ];

  return (
    <ScrollView
      className="flex-1 bg-background p-4"
      style={{
        paddingTop: top,
        paddingBottom: bottom,
      }}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-4 pb-20"
    >
      <Text className="text-foreground text-2xl font-bold text-center">
        Sobre o Sistema
      </Text>

      {/* Card: Sistema de Monitoramento */}
      <View className="bg-card rounded-lg p-4 gap-3">
        <Text className="text-foreground text-lg font-bold">
          Sistema de Monitoramento
        </Text>
        <Text className="text-foreground text-sm">
          Sistema em tempo real para monitoramento do fluxo de trânsito na Ponte
          João Luís Ferreira, conectando as cidades de Teresina (PI) e Timon
          (MA).
        </Text>
      </View>

      {/* Card: Desenvolvimento */}
      <View className="bg-card rounded-lg p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Ionicons name="code-slash" size={24} color={colors.primary} />
          <Text className="text-foreground text-lg font-bold">
            Desenvolvimento
          </Text>
        </View>
        <Text className="text-foreground text-base">Prof. Abílio S Coelho</Text>
      </View>

      {/* Card: Instituição */}
      <View className="bg-card rounded-lg p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Ionicons name="business" size={24} color={colors.primary} />
          <Text className="text-foreground text-lg font-bold">Instituição</Text>
        </View>
        <View className="gap-1">
          <Text className="text-foreground text-base" numberOfLines={2}>
            IFMA - Instituto Federal do Maranhão
          </Text>
          <Text className="text-muted-foreground text-sm">Campus Timon</Text>
        </View>
      </View>

      {/* Card: Tecnologias */}
      <View className="bg-card rounded-lg p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Ionicons name="code" size={24} color={colors.primary} />
          <Text className="text-foreground text-lg font-bold">Tecnologias</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <View
              key={index}
              className="bg-primary/20 rounded-full px-2.5 py-1.5"
            >
              <Text
                className="text-primary text-xs font-semibold"
                numberOfLines={1}
              >
                {tech}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Seção: Uma parceria */}
      <View className="gap-4">
        <Text className="text-foreground text-lg font-bold text-center">
          Uma parceria
        </Text>
        <View className="flex-row items-center justify-center gap-3 px-4">
          <View className="flex-1 aspect-square max-w-[140px] min-w-[100px] bg-card rounded-lg p-2">
            <Image
              source={require("@/assets/ifma.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <Ionicons name="close" size={20} color={colors.foreground} />
          <View className="flex-1 aspect-square max-w-[140px] min-w-[100px] bg-card rounded-lg p-2">
            <Image
              source={require("@/assets/timon.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Versão */}
      <Text className="text-foreground text-sm text-center">Versão 1.4.0</Text>
    </ScrollView>
  );
}
