import Lighthouse from "@/components/lighthouse";
import { useColorScheme } from "@/lib/useColorScheme";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import io, { Socket } from "socket.io-client";

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
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useColorScheme();

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const serverUpdateTimeRef = useRef<number>(0);
  const initialTimeRef = useRef<number>(0);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const connect = () => {
      socketRef.current = io(SOCKET_URL);
      socketRef.current.on("origin", (originData: Origin) => {
        setOrigin(originData);
        serverUpdateTimeRef.current = originData.serverTime - Date.now();
        initialTimeRef.current = new Date(originData.updated).getTime();
        setLoading(false);
      });

      timerRef.current = setInterval(() => {
        if (serverUpdateTimeRef.current) {
          const now = Date.now() + serverUpdateTimeRef.current;
          const elapsed = Math.max(0, (now - initialTimeRef.current) / 1000);
          setElapsedTime(Math.max(0, elapsed));
        }
      }, 1000);
    };

    const disconnect = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          disconnect();
          connect();
        } else {
          disconnect();
        }
      }
    );

    connect();

    return () => {
      subscription.remove();
      disconnect();
    };
  }, []);

  return (
    <View
      className="flex-1 gap-4 bg-background p-4"
      style={{ paddingTop: top, paddingBottom: bottom }}
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <View className="flex items-center justify-between p-4 bg-card rounded-lg">
            <Text className="text-foreground">
              {origin?.origin === "Teresina"
                ? "Verde em Teresina"
                : origin?.origin === "Timon"
                  ? "Verde em Timon"
                  : origin?.origin === "Stop"
                    ? "Ponte fechada"
                    : "Passagem de trem"}
            </Text>
            {origin?.lastFlow && (
              <Text className="text-foreground text-xs">
                {origin.lastFlow.origin}
              </Text>
            )}
            <Text className="text-foreground/50 text-xl font-bold">
              {formatTime(elapsedTime)}
            </Text>
          </View>
          <View className="flex-row gap-2 items-center justify-center">
            <Lighthouse
              city="Teresina"
              isOpen={origin?.origin === "Teresina"}
            />
            <Lighthouse city="Timon" isOpen={origin?.origin === "Timon"} />
          </View>
        </>
      )}
    </View>
  );
}
