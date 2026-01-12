import { cn } from "@/lib/utils";
import { Text, View } from "react-native";

type LighthouseProps = {
  city: string;
  isOpen?: boolean;
};

export default function Lighthouse({ city, isOpen }: LighthouseProps) {
  return (
    <View className="items-center justify-center gap-2">
      <Text className="text-sm text-foreground font-bold">{city}</Text>
      <View className="items-center justify-center p-4 gap-2 bg-zinc-800 rounded-md">
        <View
          className={cn(
            "size-10 rounded-full",
            isOpen
              ? "bg-green-500 shadow-lg shadow-green-500/50"
              : "bg-red-500 shadow-lg shadow-red-500/50"
          )}
        />
      </View>
    </View>
  );
}
