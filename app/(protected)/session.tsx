import SessionScreen from "@/components/screens/SessionScreen";
import { ElevenLabsProvider } from "@elevenlabs/react-native";

export default function Session() {
    return (
        <ElevenLabsProvider>
            <SessionScreen />
        </ElevenLabsProvider>
    );
}
