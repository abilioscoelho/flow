import Lighthouse from "@/components/lighthouse";
import { useColorScheme } from "@/lib/useColorScheme";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Dimensions,
  Image,
  Text,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
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

const width = Dimensions.get("window").width;

const ref = useRef<ICarouselInstance>(null);
const progress = useSharedValue<number>(0);

const onPressPagination = (index: number) => {
  ref.current?.scrollTo({
    count: index - progress.value,
    animated: true,
  });
};

const SOCKET_URL = "https://api.abiliocoelho.dev";

const data = [
  {
    url: "https://bond.app.br/bond/anuncie.png",
    descricao: "Anuncie aqui",
  },

  {
    url: "https://bond.app.br/bond/anuncie.png",
    descricao: "Anuncie aqui",
  },
  {
    url: "https://bond.app.br/bond/anuncie.png",
    descricao: "Anuncie aqui",
  },
];
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
      className="flex-1 gap-2 bg-background p-4 justify-between"
      style={{ paddingTop: top, paddingBottom: bottom }}
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <View>
            <Text className="text-foreground text-lg font-bold text-center">
              Ponte João Luís Ferreira
            </Text>
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

              <Text className="text-foreground/50 text-xl font-bold">
                {formatTime(elapsedTime)}
              </Text>
              {origin?.lastFlow && (
                <View className="border-t border-foreground/50 py-2 w-full mt-2">
                  <View>
                    <Text className="text-foreground text-base font-bold text-center">
                      Último fluxo aberto
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-foreground text-sm">Direção</Text>
                        <Text className="text-foreground/50 text-sm font-bold">
                          {origin.lastFlow.origin === "Teresina"
                            ? "Teresina → Timon"
                            : "Timon → Teresina"}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-foreground text-sm">Duração</Text>
                        <Text className="text-foreground/50 text-sm font-bold">
                          {formatTime(origin.lastFlow.duration)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
            <View className="flex-row gap-2 items-center justify-center">
              <Lighthouse
                city="Teresina"
                isOpen={origin?.origin === "Teresina"}
              />
              <Lighthouse city="Timon" isOpen={origin?.origin === "Timon"} />
            </View>
          </View>
          <View className="w-full">
            <Carousel
              ref={ref}
              autoPlay={true}
              loop={true}
              width={width * 0.95}
              height={(width * 0.95) / 2}
              data={data}
              onProgressChange={progress}
              renderItem={({ item }) => (
                <View className="border-radius-8 flex-1 overflow-hidden rounded-lg">
                  <Image
                    source={{ uri: item.url }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
              )}
            />

            <Pagination.Basic
              progress={progress}
              data={data}
              dotStyle={{
                backgroundColor: colors.foreground,
                borderRadius: 10,
              }}
              activeDotStyle={{
                backgroundColor: colors.primary,
                borderRadius: 10,
              }}
              containerStyle={{ gap: 5, marginTop: 10 }}
              onPress={onPressPagination}
            />
          </View>
        </>
      )}
    </View>
  );
}
