import { ImageSourcePropType } from "react-native";

interface Session {
    id: number;
    title: string;
    description: string;
    image: ImageSourcePropType | undefined;
}

export const sessions: Session[] = [
    {
        id: 1,
        title: "Forest Path",
        description: "Mindful walking through nature",
        image: require("@/assets/sessions/forest-path.jpg")
    },
    {
        id: 2,
        title: "Mountain View",
        description: "Grounding mountain meditation practice",   
        image: require("@/assets/sessions/mountain-view.avif")
    },
    {
        id: 3,
        title: "Ocean Waves",
        description: "Relaxing ocean meditation practice",
        image: require("@/assets/sessions/ocean-waves.jpg")
    },
    {
        id: 4,
        title: "Sunrise Sky",
        description: "Morning mindfulness practice",
        image: require("@/assets/sessions/sunrise-sky.jpg")
    },
    {
        id: 5,
        title: "Zen Stones",
        description: "Focused balance practice",
        image: require("@/assets/sessions/zen-stones.jpg")
    }
]