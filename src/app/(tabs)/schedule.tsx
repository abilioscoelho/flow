import { useColorScheme } from "@/lib/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Schedule() {
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useColorScheme();
  return (
    <ScrollView
      className="flex-1 bg-background p-4"
      style={{
        paddingTop: top,
        paddingBottom: bottom,
      }}
      contentContainerClassName="gap-4"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-foreground text-2xl font-bold text-center">
        Horários de Funcionamento
      </Text>

      {/* Card 1: Fluxo Contínuo */}
      <View className="bg-card rounded-lg p-4 relative">
        <View className="absolute top-3 left-3 bg-primary rounded-full px-2.5 py-1 z-10">
          <Text className="text-white text-xs font-bold">Fluxo Contínuo</Text>
        </View>
        <View className="pt-8 gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time" size={22} color={colors.primary} />
            <Text className="text-foreground text-base font-semibold">
              20:00 - 08:30
            </Text>
          </View>
          <Text className="text-foreground text-base font-semibold">
            Timon → Teresina
          </Text>
          <Text className="text-foreground text-sm">
            Fluxo contínuo e exclusivo sentido Timon para Teresina.
          </Text>
        </View>
      </View>

      {/* Card 2: Fluxo Alternado */}
      <View className="bg-card rounded-lg p-4 relative">
        <View className="absolute top-3 left-3 bg-gray-500 rounded-full px-2.5 py-1 z-10">
          <Text className="text-white text-xs font-bold">Fluxo Alternado</Text>
        </View>
        <View className="pt-8 gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time" size={22} color={colors.primary} />
            <Text className="text-foreground text-base font-semibold">
              08:30 - 20:00
            </Text>
          </View>
          <View className="gap-2">
            <Text className="text-foreground text-base font-semibold">
              Timon → Teresina
            </Text>
            <View className="flex-row items-center justify-center py-1">
              <View className="flex-1 h-px bg-border" />
              <Ionicons name="refresh" size={22} color={colors.primary} />
              <View className="flex-1 h-px bg-border" />
            </View>
            <Text className="text-foreground text-base font-semibold">
              Timon ← Teresina
            </Text>
          </View>
          <Text className="text-foreground text-sm">
            Fluxo alternado entre as duas cidades. Revezamento de aproximadamente 5 minutos para cada sentido.
          </Text>
        </View>
      </View>
      <View className="bg-card rounded-lg p-4 flex-row items-center gap-2">
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text className="text-foreground text-sm flex-1">
          Os horários são aproximados e podem sofrer alterações.
        </Text>
      </View>
    </ScrollView>
  );
}
