import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotification";

export const useNotifications = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    
  }, [dispatch]);
};
