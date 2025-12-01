import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function ProfileIcon() {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.profileButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    profileButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
