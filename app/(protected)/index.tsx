import SignOutButton from "@/components/clerk/SignOutButton";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20 }}>Home Screen</Text>
        <SignOutButton />
      </View>
    </>
  );
}
