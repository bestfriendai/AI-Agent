import { appwriteConfig, database } from "@/utils/appwrite";
import { ConversationResponse } from "@/utils/types";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../Button";
import { Gradient } from "../gradient";

export default function SummaryScreen() {
    const { conversationId } = useLocalSearchParams();
    const router = useRouter()
    const { user } = useUser();
    const [conversation, setConversation] = useState<ConversationResponse>()
    const [isSaving, setIsSaving] = useState(false)

    console.log("Conversation ID: ", conversationId);

    useEffect(() => {
        getSummary();
    }, [])

    async function getSummary() {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/conversations?conversationId=${conversationId}`
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Failed to fetch summary:", text);
                return;
            }

            const data: { conversation: ConversationResponse } =
                await response.json();

            setConversation(data.conversation);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    }

    async function saveAndContinue() {
        try {
            setIsSaving(true)
            await database.createDocument(
                appwriteConfig.db,
                appwriteConfig.tables.session,
                ID.unique(),
                {
                    user_id: user?.id,
                    status: conversation?.status,
                    conv_id: conversationId,
                    tokens: Number(conversation?.metadata?.cost),
                    call_duration_secs: Number(
                        conversation?.metadata?.call_duration_secs
                    ),
                    transcript: conversation?.transcript.map(t => t.message).join("\n"),
                    call_summary_title: conversation?.analysis?.call_summary_title,
                }
            )

            router.dismissAll()
        } catch (error) {
            console.error("Error saving summary:", error);
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <Gradient position="bottom" isSpeaking={false} />
            <SafeAreaView
                style={{ paddingHorizontal: 16 }}
            >
                {conversation?.status !== "done" && (
                    <View style={{ gap: 16, paddingBottom: 16 }}>
                        <Text style={styles.title}>We are processing your call...</Text>
                        <Text style={styles.subtitle}>This may take a few minutes.</Text>
                        <Text style={styles.subtitle}>
                            Current status: {conversation?.status}
                        </Text>
                        <Button onPress={getSummary}>Refresh</Button>
                    </View>
                )}

                {conversation?.status === "done" && (
                    <View style={{ gap: 16, paddingBottom: 16 }}>

                        {/* Conversation ID */}
                        <Text style={styles.caption}>{conversationId}</Text>

                        {/* Summary Title */}
                        <Text style={styles.title}>
                            {conversation?.analysis?.call_summary_title}
                        </Text>

                        {/* Summary Body */}
                        <Text style={styles.subtitle}>
                            {conversation?.analysis?.transcript_summary.trim()}
                        </Text>

                        {/* Stats Section */}
                        <Text style={styles.title}>Stats</Text>

                        <Text style={styles.subtitle}>
                            {conversation?.metadata?.call_duration_secs} seconds
                        </Text>

                        <Text style={styles.subtitle}>
                            {conversation?.metadata?.cost} tokens
                        </Text>

                        <Text style={styles.subtitle}>
                            {new Date(
                                conversation?.metadata?.start_time_unix_secs * 1000
                            ).toLocaleString()}
                        </Text>

                        {/* Transcript */}
                        <Text style={styles.title}>Transcript</Text>

                        <Text style={styles.subtitle}>
                            {conversation?.transcript
                                .map(t => t.message)
                                .join("\n")}
                        </Text>

                        <View style={{ alignItems: "center" }}>
                            <Button onPress={saveAndContinue} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save and continue"}
                            </Button>
                        </View>

                    </View>
                )}

            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 16,
    },
    caption: {
        fontSize: 12,
        color: "gray",
    },
});
