import SignOutButton from "@/components/clerk/SignOutButton";
import ParallaxScrollView, { blurhash } from "@/components/ParallaxScrollView";
import { appwriteConfig, database, Session } from "@/utils/appwrite";
import { colors } from "@/utils/colors";
import { sessions } from "@/utils/sessions";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

      <View style={{ gap: 16 }}>
        {sessionHistory.length > 0
          ? (
            sessionHistory.map((session) => (
              <SessionCard key={session.$id} session={session} />
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

      <Text style={styles.title}>Account</Text>
      <View
        style={{
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 16,
          backgroundColor: "white",
          gap: 8,
          marginBottom: 100,
        }}
      >
        <Image
          source={user?.imageUrl}
          style={{ width: 50, height: 50, borderRadius: 100 }}
        />
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={{ fontSize: 16 }}>
          {user?.emailAddresses[0].emailAddress}
        </Text>
        <SignOutButton />
      </View>

    </ParallaxScrollView>
  );
}

const SessionCard = ({ session }: { session: Session }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const randomEmoji = useMemo(() => {
    return ["🌱", "🏄", "⛅", "🌙", "🗻", "☁️", "🐚", "🌸", "✨", "🕊️"][
      Math.floor(Math.random() * 10)
    ];
  }, []);

  return (
    <View
      style={{
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        backgroundColor: "white",
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 24 }}>{randomEmoji}</Text>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {session.call_summary_title}
      </Text>

      {isExpanded ? (
        <>
          <Text style={{ fontSize: 16 }}>{session.transcript}</Text>
          <Pressable onPress={() => setIsExpanded(false)}>
            <Text style={{ fontSize: 16, color: colors.primary }}>
              Read less
            </Text>
          </Pressable>
        </>
      ) : (
        <Pressable onPress={() => setIsExpanded(true)}>
          <Text style={{ fontSize: 16, color: colors.primary }}>Read more</Text>
        </Pressable>
      )}
      <Text style={{ fontSize: 16 }}>
        {session.call_duration_secs} seconds, {session.tokens} tokens
      </Text>

      <Text style={{ fontSize: 14 }}>
        {new Date(session.$createdAt).toLocaleDateString("en-US", {
          weekday: "long",
        })}
      </Text>
    </View>
  );
};


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
