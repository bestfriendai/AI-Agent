import ParallaxScrollView, { blurhash } from "@/components/ParallaxScrollView";
import { appwriteConfig, database, Session } from "@/utils/appwrite";
import { colors } from "@/utils/colors";
import { sessions } from "@/utils/sessions";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";

export default function Index() {
  const router = useRouter();
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const { user } = useUser();

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    if (!user) {
      alert("No user found")
      return;
    }
    try {
      const { documents } = await database.listDocuments(appwriteConfig.db,
        appwriteConfig.tables.session,
        [Query.equal("user_id", user.id)]
      )
      setSessionHistory(documents as unknown as Session[])
      console.log(JSON.stringify(documents, null, 2));
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <ParallaxScrollView>
      <Text style={styles.title}>Explore Sessions</Text>
      <ScrollView
        contentContainerStyle={{
          paddingLeft: 16,
          gap: 16,
        }}
        horizontal
        contentInsetAdjustmentBehavior="automatic"
        showsHorizontalScrollIndicator={false}
      >
        {sessions.map((session) => (
          <Pressable
            key={session.id}
            style={styles.sessionContainer}
            onPress={() =>
              router.navigate({
                pathname: "/session/[sessionId]",
                params: { sessionId: session.id },
              })
            }
          >
            <Image
              source={session.image}
              style={styles.sessionImage}
              contentFit="cover"
              transition={1000}
              placeholder={{ blurhash }}
            />
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                experimental_backgroundImage:
                  "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))",
                borderRadius: 16,
              }}
            >
              <Text style={styles.sessionTitle}>{session.title}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View
        style={{
          flexGrow: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: 16,
        }}
      >
        <Text style={styles.title}>Recents</Text>

        <Pressable onPress={fetchSession}>
          <Ionicons
            name="refresh-circle-sharp"
            size={32}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <View>
        {sessionHistory.length > 0
          ? (
            sessionHistory.map((session) => (
              <Text key={session.$id}>{session.call_summary_title}</Text>
            ))
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                No sessions found
              </Text>
            </View>
          )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
  },
  sessionContainer: {
    position: "relative",
  },
  sessionImage: {
    width: 250,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
  },
  sessionTitle: {
    position: "absolute",
    width: "100%",
    bottom: 16,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});
