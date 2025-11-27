import { ConversationResponse } from "@/utils/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gradient } from "../gradient";

export default function SummaryScreen() {
    const { conversationId } = useLocalSearchParams();
    const [conversation, setConversation] = useState<ConversationResponse>()

    console.log("Conversation ID: ", conversationId);

    useEffect(() => {
        getSummary();
    }, [])

    async function getSummary() {
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
    }

    return (
        <>
            <Gradient position="bottom" isSpeaking={false} />
            <SafeAreaView style={{ paddingHorizontal: 16 }}>
                <Text>Summary: {conversation?.agent_id ?? "not found"}</Text>
            </SafeAreaView>
        </>
    );
}