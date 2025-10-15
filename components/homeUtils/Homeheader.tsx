import {
  AntDesign,
  Entypo,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { router } from "expo-router";
import { Menu, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";
import { AuthUserType, UserReducerInitStateType } from "@/utils/types";
import { getDatabase, onValue, ref } from "@react-native-firebase/database";
import { userExist, userNotExist } from "@/redux/reducers/userSlice";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import CustomMenuOption from "../shared/CustomMenuOption";

const Homeheader = () => {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer
  );
  console.log("user reducer :", user);
  const auth = getAuth();
  const db = getDatabase();
  const dispatch = useDispatch();

  // --------------- Handle to logout the user
  const hanldeLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.replace("/");
      dispatch(userNotExist())
    } catch (error) {
      console.log("error:", error);
    }
  };
  useEffect(() => {
    let unsubscribeProfile: () => void;
    const userRef = ref(db, `users/${auth?.currentUser?.uid}`);
    unsubscribeProfile = onValue(userRef, (snapshot) => {
      const exists = snapshot.exists();
      const complete =
        exists &&
        snapshot.val().phoneNumber &&
        snapshot.val().email &&
        snapshot.val().name;

      console.log("snapshot.val():", snapshot.val());
      // storing the user Details in redux state

      const userDetails: AuthUserType = {
        email: snapshot.val().email,
        phoneNumber: snapshot.val().phoneNumber,
        name: snapshot.val().name,
        uid: snapshot.val().uid,
        image: snapshot.val().image,
        createdAt: snapshot.val().createdAt,
        role: snapshot.val().role,
        locationDetails: snapshot.val().locationDetails,
        bio: snapshot.val().bio,
        providers: snapshot.val().providers,
        expoTokens: snapshot.val().expoTokens,
      };
      dispatch(userExist(userDetails));
      console.log('userDetails:', userDetails)
    });

    return () => {
      unsubscribeProfile();
    };
  }, [auth.currentUser?.uid, dispatch]);

  return (
    <LinearGradient
      colors={["#dcdcdc", "#f4f4f4"]}
      start={{ x: 0.1, y: 0.2 }}
      end={{ x: 0.1, y: 0.2 }}
    >
      <View
        style={{
          marginTop: hp(5),
          backgroundColor: "#dcdcdc",
          display: "flex",
          justifyContent: "space-between",
          // alignItems:"center",
          flexDirection: "row",
          paddingInline: hp(3),
          paddingTop: hp(1.2),
          paddingBottom: hp(1.2),
        }}
        >
        {/* -------------------------------User profile photo------------------------------ */}
        <View>
          <FastImage
            source={{
              uri:
                user?.image ||
                "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FphoneNumber.jpg?alt=media&token=610c23e9-2dc6-4c55-8c96-e6f00da6a46d",
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.avatar}
            fallback={true}
            defaultSource={require("../../assets/images/userImage.jpg")}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        {/* --------------------------------- Menu options----------------------- */}


        <View style={styles.threeDot}>
          <Menu>
            <MenuTrigger
              customStyles={{
                triggerWrapper: {
                  // trigger wrapper styles
                },
              }}
            >
              <Entypo name="dots-three-vertical" size={hp(2.5)} color="black" />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  borderRadius: 10,
                  borderCurve: "continuous",
                  marginTop: 48,
                  marginLeft: 0,
                  backgroundColor: "#f5f5f5",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.2,
                  width: 160,
                },
              }}
            >
              <CustomMenuOption
                handleAction={() => {
                  router.push("/(groups)/newGroup");
                }}
                icon={
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={hp(2.5)}
                    color="black"
                  />
                }
                text="New Group"
                value={null}
              />

              <CustomMenuOption
                handleAction={() => {
                  router.navigate("/mapScreen");
                }}
                icon={<Feather name="map" size={hp(2.5)} color="black" />}
                text="Map"
                value={null}
              />
              <CustomMenuOption
                handleAction={() => {router.push("/(app)/userProfile")}}
                icon={<Feather name="user" size={hp(2.5)} color="black" />}
                text="Profile"
                value={null}
              />

              <CustomMenuOption
                handleAction={hanldeLogout}
                icon={<AntDesign name="logout" size={hp(2.5)} color="black" />}
                text="Sign out"
                value={null}
              />
            </MenuOptions>
          </Menu>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Homeheader;

const styles = StyleSheet.create({
  avatar: {
    height: hp(5.4),
    width: hp(5.4),
    borderRadius: hp(3.25),
  },
  threeDot: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
