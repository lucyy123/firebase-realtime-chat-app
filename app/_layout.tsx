import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotification";
import * as Notifications from "expo-notifications";
import { Slot, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const [expoPushToken, setExpoPushToken] = useState<string | null>();
  const [notification, setNotification] =
    useState<Notifications.Notification | null>();
  const [error, setError] = useState<Error | null>();
  const router = useRouter();

  // briefly wait for layout to stabilize (e.g. for index.tsx redirect to fire)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  
  useEffect(() => {
    setReady(true);
    let isMounted = true;
    registerForPushNotificationsAsync().then(
      (token) => setExpoPushToken(token),
      (error) => setError(error)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // console.log(
        //   "🔔 Notification Response: ",
        //   JSON.stringify(response, null, 2),
        //   JSON.stringify(response.notification.request.content.data, null, 2)
        // );
        // const data = response.notification.request.content.data;
        // // Optional: Handle the notification response
        // console.log(
        //   "notification response",
        //   response.notification.request.content.data
        // );
        console.log("response:", response.notification.request.content.data);
        handleRedirect(response);
      });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) return;
      if (response.notification) {
        console.log("🔔 Last Notification Response:");
        handleRedirect(response);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      isMounted = false;
    };
  }, []);

  // Until ready, show a full-screen loader
  if (!ready) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleRedirect = (response: Notifications.NotificationResponse) => {
    const url = response.notification.request.content.data?.url;
    if (url) {
      router.push(url);
    }
  };

  return (
      <Provider store={store}>
        <KeyboardProvider>
          <MenuProvider>
            <Slot />
            <Toast />
          </MenuProvider>
        </KeyboardProvider>
      </Provider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
