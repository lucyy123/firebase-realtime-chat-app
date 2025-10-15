// app/index.tsx
import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import { getAuth } from "@react-native-firebase/auth";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNotifications } from "@/hooks/useNotification";
import { useDispatch } from "react-redux";
import { getDatabase, onValue, ref } from "@react-native-firebase/database";
import { AuthUserType } from "@/utils/types";
import { userExist } from "@/redux/reducers/userSlice";

export default function IndexPage() {
  useNotifications();
  const [nextPath, setNextPath] = useState<string | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const dispatch = useDispatch();
  const db = getDatabase();

  useEffect(() => {
    let target = "/login"; // default

    if (user) {
      const providers = user.providerData || [];
      const isPhone = providers.some((p) => p.providerId === "phone");
      const isEmailOrGoogle = providers.some(
        (p) => p.providerId === "password" || p.providerId === "google.com"
      );

      if (!isPhone) {
        target = "/mobileLink";
      } else if (isPhone && isEmailOrGoogle) {
        target = "/homeChat";
      }
    }

    // Defer setting nextPath until after this effect
    setNextPath(target);
  }, []);


  // Still deciding? show spinner
  if (nextPath === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Once decided, immediately redirect
  return <Redirect href={`${nextPath}`} />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
