import { sessions } from "@/utils/sessions";
import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView>
      {sessions.map((session) => (
        <Pressable
          key={session.id}
          style={{ borderWidth: 1, padding: 16, marginVertical: 6 }}
          onPress={() =>
            router.navigate({
              pathname: "/session/[sessionId]",
              params: { sessionId: session.id },
            })
          }
        >
          <Text>{session.title}</Text>
          <Text>{session.description}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}
