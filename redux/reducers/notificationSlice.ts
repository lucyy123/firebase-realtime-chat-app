// notificationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Notifications from "expo-notifications";

interface NotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const initialState: NotificationState = {
  expoPushToken: null,
  notification: null,
  error: null,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setExpoPushToken: (state, action: PayloadAction<string | null>) => {
      state.expoPushToken = action.payload;
    },
    setNotification: (state, action: PayloadAction<Notifications.Notification | null>) => {
      state.notification = action.payload;
    },
    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setExpoPushToken, setNotification, setError } = notificationSlice.actions;
