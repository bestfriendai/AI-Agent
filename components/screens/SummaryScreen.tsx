import { ConversationResponse } from "@/utils/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
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
            `${process.env.EXPO_PUBLIC_BASE_URL}/api/conversations?conversation=${conversationId}`
        );

        const data: { conversation: ConversationResponse } =
            await response.json();

        setConversation(data.conversation);
    }

    return (
        <>
            <Gradient position="bottom" isSpeaking={false} />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{
                    paddingHorizontal: 16,
                }}
            >
                <Text>Summary {conversation?.agent_id}</Text>
            </ScrollView>
        </>
    );
}