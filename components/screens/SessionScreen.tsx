import { sessions } from "@/utils/sessions";
import { useUser } from "@clerk/clerk-expo";
import { useConversation } from "@elevenlabs/react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gradient } from "../gradient";

export default function SessionScreen() {
    const { user, isLoaded } = useUser();
    const { sessionId } = useLocalSearchParams();
    const session = sessions.find((s) => s.id === Number(sessionId)) ?? sessions[0];

    if (!isLoaded) return null;

    const conversation = useConversation({
        onConnect: () => console.log('Connected to conversation'),
        onDisconnect: () => console.log('Disconnected from conversation'),
        onMessage: (message) => console.log('Received message:', message),
        onError: (error) => console.error('Conversation error:', error),
        onModeChange: (mode) => console.log('Conversation mode changed:', mode),
        onStatusChange: (prop) => console.log('Conversation status changed:', prop.status),
        onCanSendFeedbackChange: (prop) =>
            console.log('Can send feedback changed:', prop.canSendFeedback),
        onUnhandledClientToolCall: (params) => console.log('Unhandled client tool call:', params),
    });

    const startConversation = async () => {
        try {
            await conversation.startSession({
                agentId: process.env.EXPO_PUBLIC_AGENT_ID,
                dynamicVariables: {
                    username: user?.firstName || "user",
                    session_title: session.title,
                    session_description: session.description
                }
            })
        } catch (e) {
            console.log("Error starting conversation: ", e);
        }
    }

    const endConversation = async () => {
        try {
            await conversation.endSession();
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
            <SafeAreaView>
                <Text>Session Screen {user?.firstName || "unavailable"}</Text>
                <Text style={{ fontSize: 32, fontWeight: "bold" }}>Session ID: {sessionId}</Text>
                <Button
                    title="Start Conversation"
                    onPress={startConversation}
                    color={"light-blue"}
                />
                <Button
                    title="End Conversation"
                    onPress={endConversation}
                    color={"red"}
                />
            </SafeAreaView>
        </>
    )
}