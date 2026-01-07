import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import io from "socket.io-client";

type LastFlow = {
  createdAt: string;
  duration: number;
  id: number;
  origin: string;
  semaphoreId: number;
  updatedAt: string;
};

type Origin = {
  lastFlow: LastFlow | null;
  origin: "Teresina" | "Timon" | "Stop" | "Trem";
  serverTime: number;
  updated: string;
};

const SOCKET_URL = "https://api.abiliocoelho.dev";
export default function Index() {
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on("origin", (originData: Origin) => {
      setOrigin(originData);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Cronômetro que atualiza a cada segundo
  useEffect(() => {
    if (!origin?.updated) {
      setElapsedTime(0);
      return;
    }

    // Calcula o tempo inicial baseado no serverTime e updated
    const initialTime = new Date(origin.updated).getTime();
    const serverOffset = origin.serverTime - Date.now();

    const updateTimer = () => {
      const now = Date.now() + serverOffset; // Ajusta com offset do servidor
      const elapsed = Math.max(0, (now - initialTime) / 1000);
      setElapsedTime(elapsed);
    };

    // Atualiza imediatamente
    updateTimer();

    // Atualiza a cada segundo
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [origin?.updated, origin?.serverTime]);

  return (
    <View className="flex-1 justify-center bg-background">
      <View className="flex items-center justify-between p-4 bg-card">
        <Text className="text-primary">
          {origin?.origin === "Teresina"
            ? "Teresina"
            : origin?.origin === "Timon"
              ? "Timon"
              : origin?.origin === "Stop"
                ? "Fechada"
                : "Trem"}
        </Text>
        {origin?.lastFlow && (
          <Text className="text-primary">{origin.lastFlow.origin}</Text>
        )}
        <Text className="text-primary">
          {origin?.updated ? formatTime(elapsedTime) : "N/A"}
        </Text>
      </View>
    </View>
  );
}
