import { ElevenLabsProvider } from "@elevenlabs/react-native";
import { Slot } from "expo-router";

export default function SessionLayout() {
    return (
        <ElevenLabsProvider>
            <Slot />
        </ElevenLabsProvider>
    )
}
