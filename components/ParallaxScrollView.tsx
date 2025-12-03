import { sessions } from "@/utils/sessions";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollOffset } from "react-native-reanimated";
import Button from "./Button";

export const blurhash = "LNF$b0%gNI9G_LRl-qRkIAIUxvoz";
const HEADER_HEIGHT = 400;

type ParallaxScrollViewProps = PropsWithChildren<{
    headerRight?: ReactNode;
}>;

export default function ParallaxScrollView({ children, headerRight }: ParallaxScrollViewProps) {
    const todaySession = useMemo(() => sessions[Math.floor(Math.random() * sessions.length)], []);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollOffset(scrollRef);

    const headerAnimatedStyle = useAnimatedStyle(() => {

        const translateY =
            scrollOffset.value <= 0
                ? interpolate(
                    scrollOffset.value,
                    [-HEADER_HEIGHT, 0],
                    [-HEADER_HEIGHT / 2, 0]
                )
                : 0;

        const scale =
            scrollOffset.value <= 0
                ? interpolate(
                    scrollOffset.value,
                    [-HEADER_HEIGHT, 0],
                    [2, 1]
                )
                : 1;

        return {
            transform: [
                {
                    translateY,
                },
                {
                    scale,
                }
            ],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                scrollEventThrottle={16}
            >
                <Animated.View style={[
                    {
                        height: HEADER_HEIGHT,
                        overflow: "hidden",
                    },
                    headerAnimatedStyle,
                ]}
                >
                    <Image
                        source={todaySession.image}
                        placeholder={blurhash}
                        style={{ width: "100%", height: HEADER_HEIGHT }}
                    />
                </Animated.View>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                    style={styles.headerContainer}
                >
                    {headerRight && (
                        <View style={styles.headerRightContainer}>
                            {headerRight}
                        </View>
                    )}

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


                </LinearGradient>
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
    },
    headerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    headerRightContainer: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    }
});
