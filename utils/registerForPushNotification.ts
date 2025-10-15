import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { child, get, getDatabase, ref } from "@react-native-firebase/database";
import { updateTheUserExpoPushTokenOnFirebase } from "./common";

function handleRegistrationError(errorMessage: string) {
  Toast.show({
    type: "error",
    text1: errorMessage,
    visibilityTime: 6000,
  });
  // alert(errorMessage);
  // throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
      console.log('projectId:', projectId)
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('pushTokenString:', pushTokenString)
      if(pushTokenString){
        updateTheUserExpoPushTokenOnFirebase(pushTokenString)
      }
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

/**
 * After sending a chat message, call this to fire pushes.
 */
export async function sendExpoPush(
  message: string,
  receiverExpoToken?: string,
  senderName?:string,
) {
  // 1️⃣ Fetch all saved tokens for the recipient
  try {
    // 2️⃣ Build notifications (Expo requires batches <=100)
    const messages = {
      to: receiverExpoToken,
      sound: "default",
      title: `${senderName} send you message`,
      body: message,
      // data: { someDate: "some data here - Testing" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  } catch (error) {
    console.log("ERROR:error during sending the push notification:", error);
  }
}
