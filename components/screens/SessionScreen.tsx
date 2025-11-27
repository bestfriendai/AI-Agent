import { sessions } from "@/utils/sessions";
import { useUser } from "@clerk/clerk-expo";
import { useConversation } from "@elevenlabs/react-native";
import * as Brightness from "expo-brightness";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import Button from "../Button";
import { Gradient } from "../gradient";

export default function SessionScreen() {
    const { user, isLoaded } = useUser();
    const { sessionId } = useLocalSearchParams();
    const router = useRouter();
    const session = sessions.find((s) => s.id === Number(sessionId)) ?? sessions[0];

    const [isStarting, setIsStarting] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    if (!isLoaded) return null;

    const conversation = useConversation({
        onConnect: (data: any) => {
            console.log('Connected to conversation', data);
            if (data?.conversationId) {
                setConversationId(data.conversationId);
            }
        },
        onDisconnect: () => console.log('Disconnected from conversation'),
        onMessage: (message) => console.log('Received message:', message),
        onError: (error) => console.error('Conversation error:', error),
        onModeChange: (mode) => console.log('Conversation mode changed:', mode),
        onStatusChange: (prop) => console.log('Conversation status changed:', prop.status),
        onCanSendFeedbackChange: (prop) =>
            console.log('Can send feedback changed:', prop.canSendFeedback),
        onUnhandledClientToolCall: (params) => console.log('Unhandled client tool call:', params),

        clientTools: {
            handleSetBrightness: async (params: unknown) => {
                const { brightnessValue } = params as { brightnessValue: number };
                console.log("🌞 setting brightness to ", { brightnessValue });
                const { status } = await Brightness.requestPermissionsAsync();
                if (status === "granted") {
                    await Brightness.setSystemBrightnessAsync(brightnessValue);
                    return brightnessValue;
                }
            }
        }
    });


    const startConversation = async () => {
        if (isStarting) return;
        if (conversation.status !== "disconnected") return;

        try {
            setIsStarting(true);
            await conversation.startSession({
                agentId: process.env.EXPO_PUBLIC_AGENT_ID,
                dynamicVariables: {
                    username: user?.firstName || "user",
                    session_title: session.title,
                    session_description: session.description
                }
            });
        } catch (e) {
            console.log("Error starting conversation: ", e);
        } finally {
            setIsStarting(false);
        }
    }

    const endConversation = async () => {
        if (conversation.status !== "connected") return;

        try {
            await conversation.endSession();
            if (conversationId) {
                router.push(`/summary?conversationId=${conversationId}`);
            }
        } catch (e) {
            console.log("Error ending conversation: ", e);
        }
    }

    return (
        <>
            <Gradient
                position="top"
                isSpeaking={
                    conversation.status === "connected" || conversation.status === "connecting"
                }
            />
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 16,
                }}>
                <Text style={{ fontSize: 32, fontWeight: "bold" }}>{session.title}</Text>
                <Text style={{ fontSize: 16, fontWeight: 500, opacity: 0.5 }}>{session.description}</Text>
                <Button
                    onPress={conversation.status === 'connected' ? endConversation : startConversation}
                    disabled={isStarting || conversation.status === 'connecting'}
                >
                    {conversation.status === 'connected' ? "End Conversation" : (isStarting || conversation.status === 'connecting' ? "Connecting..." : "Start Conversation")}
                </Button>
            </View>
        </>
    )
}