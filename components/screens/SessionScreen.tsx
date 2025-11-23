import { useUser } from "@clerk/clerk-expo";
import { useConversation } from "@elevenlabs/react-native";
import { Button, Text, View } from "react-native";
import SignOutButton from "../clerk/SignOutButton";

export default function SessionScreen() {
    const { user } = useUser()
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
                    session_title: "test",
                    session_description: "test"
                }
            })
        } catch (e) {
            console.log(e);
        }
    }

    const endConversation = async () => {
        try {
            await conversation.endSession();
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <View>
            <Text>Session Screen {user?.firstName || "unavaliable"}</Text>
            <Button title="Start Conversation" onPress={startConversation} />
            <Button title="End Conversation" onPress={endConversation} color={"red"} />
            <SignOutButton />
        </View>
    )
}