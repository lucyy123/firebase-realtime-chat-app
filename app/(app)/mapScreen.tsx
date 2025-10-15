import { dummyUsers } from "@/utils/common";
import {
  AllUserListRedInitStateType,
  AuthUserType,
  UserReducerInitStateType
} from "@/utils/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import MapView, {
  Details,
  Marker,
  PROVIDER_GOOGLE,
  Region
} from "react-native-maps";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useSelector } from "react-redux";

export default function App() {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer
  );
  // Get all users list
  const { users } = useSelector(
    (state: { allUsersList: AllUserListRedInitStateType }) => state.allUsersList
  );
  // console.log('users:', users)

  const initialRegion = {
    latitude: 22.810354440218195,
    latitudeDelta: 29.072348242631627,
    longitude: 78.03674278780818,
    longitudeDelta: 16.356612481176853,
  };

 

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsMyLocationButton={true}
        showsUserLocation={true}
        onRegionChangeComplete={(region: Region, details: Details) => {
          console.log("details:", details);
          console.log("region:", region);
        }}
      >
          {/* ----------------------Dummy users implementations----------------- */}

        {/* {dummyUsers.map((ele) => (
            <Marker
              key={ele.id}
              coordinate={{
                latitude:
                  ele.location?.latitude,
                longitude:
                  ele.location?.longitude 
              }}
              title={ele?.name!}
            >
              <View style={{}}>
                <FastImage
                  source={{
                    uri:
                      ele?.image ||
                      "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2F20171207180759469000.jpg?alt=media&token=1a0f5256-cb20-4f5a-8fb6-a6dd927f1362",
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.avatar}
                  fallback={true}
                />
              </View>
            </Marker>
          ))} */}

          {/* ----------------------Actul User implementations----------------- */}
       {users &&
          users?.map((ele: AuthUserType) => (
            <Marker
              key={ele.uid}
              coordinate={{
                latitude:
                  ele.locationDetails?.location?.latitude || 22.810354440218195,
                longitude:
                  ele.locationDetails?.location?.longitude ||
                  78.036742787808185,
              }}
              title={ele?.name!}
              // onPress={() => handleGetuserDetails(ele)}
            >
              <View style={{}}>
                <FastImage
                  source={{
                    uri:
                      ele?.image ||
                      "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FphoneNumber.jpg?alt=media&token=610c23e9-2dc6-4c55-8c96-e6f00da6a46d",
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.avatar}
                  fallback={true}
                  defaultSource={require("../../assets/images/userImage.jpg")}
                />
              </View>
            </Marker>
          ))} 
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  avatar: {
    height: hp(5),
    width: hp(5),
    borderRadius: hp(3.25),
  },
});
