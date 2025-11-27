import { sessions } from "@/utils/sessions";
import { Image } from "expo-image";
import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import Button from "./Button";

const blurhash = "LNF$b0%gNI9G_LRl-qRkIAIUxvoz";
const HEADER_HEIGHT = 400;

export default function ParallaxScrollView({ children }: PropsWithChildren) {
    const todaySession = sessions[Math.floor(Math.random() * sessions.length)];
    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
            >
                <Image
                    source={todaySession.image}
                    placeholder={blurhash}
                    style={{ width: "100%", height: HEADER_HEIGHT }}
                />
                <View style={styles.headerContainer}>

                    <View style={{ flex: 1 }} />

                    <View style={styles.headerContent}>
                        <Text style={styles.headerSubtitle}>Featured Session</Text>
                        <Text style={styles.headerTitle}>{todaySession.title}</Text>
                        <Text style={styles.headerDescription}>{todaySession.description}</Text>
                        <Button>
                            Start Session
                        </Button>
                        <View style={{ flex: 1 }} />
                    </View>


                </View>
                {children}
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "white",
        opacity: 0.5,
        fontWeight: "bold",
    },
    headerTitle: {
        fontSize: 48,
        fontWeight: "bold",
        color: "white",
    },
    headerDescription: {
        fontSize: 16,
        color: "white",
    },
    headerContainer: {
        position: "absolute",
        width: '100%',
        height: HEADER_HEIGHT,
        experimental_backgroundImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))"
    },
    headerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    }
});
