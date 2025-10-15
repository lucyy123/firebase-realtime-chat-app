import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useDispatch } from "react-redux";
import {
  fetchAndUpdateUserCurrentLocation,
  userCurrentAddress,
} from "@/redux/reducers/locationSlice";

const useCurrentLocation = () => {
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ---------------------Handle to get user location--------------------------

  async function getCurrentLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log("User Location:", location);
      const { coords } = location;
      if (coords) {
        const { latitude, longitude } = coords;
        setLongitude(longitude);
        setLatitude(latitude);
        const UserActuallLocation = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        const { city, country, formattedAddress, postalCode, region } =
          UserActuallLocation[0];
        //----------------------Set user Current location
        dispatch(fetchAndUpdateUserCurrentLocation({ latitude, longitude }));
        //------------------------ Set user current position
        dispatch(
          userCurrentAddress({
            city: city || "",
            country: country || "",
            formattedAddress: formattedAddress || "",
            postalCode: postalCode || "",
            region: region || "",
          })
        );
        console.log("USER LOCATION ", UserActuallLocation);
      }
    } catch (error) {
      console.log("error:", error);
    }
  }

  return { latitude, longitude, errorMsg };
};

export default useCurrentLocation;

const styles = StyleSheet.create({});
