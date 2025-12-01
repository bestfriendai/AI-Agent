import { sessions } from "@/utils/sessions";
import { useUser } from "@clerk/clerk-expo";
// Use the hook wrapper to support both Native (via .native.ts) and Web (via .tsx mock)
import { useConversation } from "@/hooks/useConversation";
import * as Brightness from "expo-brightness";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Button from "../Button";
import { Gradient } from "../gradient";

export default function SessionScreen() {
    const { user, isLoaded } = useUser();
    const { sessionId } = useLocalSearchParams();
    const router = useRouter();

    // State for the session, defaulting to params or first session
    const [currentSession, setCurrentSession] = useState(
        sessions.find((s) => s.id === Number(sessionId)) ?? sessions[0]
    );

    useEffect(() => {
        const manageSessionPersistence = async () => {
            if (sessionId) {
                // If sessionId is present in params, use it and persist it
                const s = sessions.find((s) => s.id === Number(sessionId));
                if (s) {
                    setCurrentSession(s);
                    await SecureStore.setItemAsync("last_session_id", String(s.id));
                }
            } else {
                // If no sessionId in params (e.g. after reload), try to restore
                try {
                    const savedId = await SecureStore.getItemAsync("last_session_id");
                    if (savedId) {
                        const s = sessions.find((s) => s.id === Number(savedId));
                        if (s) setCurrentSession(s);
                    }
                } catch (e) {
                    console.warn("Failed to restore session ID", e);
                }
            }
        };
        manageSessionPersistence();
    }, [sessionId]);

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
        onMessage: (message: any) => console.log('Received message:', message),
        onError: (error: any) => console.error('Conversation error:', error),
        onModeChange: (mode: any) => console.log('Conversation mode changed:', mode),
        onStatusChange: (prop: any) => console.log('Conversation status changed:', prop.status),
        onCanSendFeedbackChange: (prop: any) =>
            console.log('Can send feedback changed:', prop.canSendFeedback),
        onUnhandledClientToolCall: (params: any) => console.log('Unhandled client tool call:', params),

        clientTools: {
            handleSetBrightness: async (params: unknown) => {
                try {
                    const { brightnessValue } = params as { brightnessValue: number };
                    console.log("🌞 setting brightness to ", { brightnessValue });
                    const { status } = await Brightness.requestPermissionsAsync();
                    if (status === "granted") {
                        await Brightness.setSystemBrightnessAsync(brightnessValue);
                        return brightnessValue;
                    }
                } catch (e) {
                    console.error("Error setting brightness:", e);
                    return -1;
                }
            }
        }
    });

    const startConversation = async () => {
        if (isStarting) return;
        if (conversation.status !== "disconnected") return;

        try {
            setIsStarting(true);
            const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
            if (!agentId) {
                console.error("Missing EXPO_PUBLIC_AGENT_ID");
                return;
            }

            console.log("Starting session with:", {
                agentId,
                username: user?.firstName,
                title: currentSession.title,
                description: currentSession.description
            });

            await conversation.startSession({
                agentId,
                dynamicVariables: {
                    username: user?.firstName || "user",
                    session_title: String(currentSession.title),
                    session_description: String(currentSession.description)
                }
            });
        } catch (e) {
            console.error("Error starting conversation: ", e);
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
                <Text style={{ fontSize: 32, fontWeight: "bold" }}>{currentSession.title}</Text>
                <Text style={{ fontSize: 16, fontWeight: 500, opacity: 0.5 }}>{currentSession.description}</Text>
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