import CustomHeader from "@/components/shared/CustomHeader";
import { UserReducerInitStateType } from "@/utils/types";
import { getAuth } from "@react-native-firebase/auth";
import { getDatabase } from "@react-native-firebase/database";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const _layout = () => {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer
  );

  const db = getDatabase();
  const auth = getAuth();
  const currentUserUID = auth.currentUser?.uid;


  return (
    <Stack>
      <Stack.Screen
        name="userProfile"
        options={{
          header:()=><CustomHeader title="User Details"/>
        }}
      />
      <Stack.Screen
        name="mapScreen"
        options={{
          header:()=><CustomHeader title="Map"/>
        }}
      />
   
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
