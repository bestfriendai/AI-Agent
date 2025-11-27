import { ElevenLabsProvider } from "@/hooks/useConversation";
import { Slot } from "expo-router";

export default function SessionLayout() {
    return (
        <ElevenLabsProvider>
            <Slot />
        </ElevenLabsProvider>
    )
}
