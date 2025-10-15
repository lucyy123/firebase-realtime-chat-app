import { changeUserDetails } from "@/redux/reducers/userSlice";
import {uploadImageToFirebase} from "@/utils/common";
import { UserReducerInitStateType } from "@/utils/types";
import { Entypo, Feather } from "@expo/vector-icons";
import { getDatabase, ref, update } from "@react-native-firebase/database";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
const UserProfile = () => {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer
  );
  console.log("user:", user);
  const dispatch = useDispatch();
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>();
  const [loading, setLoading] = useState(false);
  const db = getDatabase();
  const [userOldName, setUserOldName] = useState<string>();
  const [userOldbio, setUserOldbio] = useState<string>();

  // const
  const [userName, setUserName] = useState<string>();
  const [userbio, setUserbio] = useState<string>();

  useEffect(() => {
    setUserName(user?.name!);
    setUserbio(user?.bio || "");
    setUserOldName(user?.name!);
    setUserOldbio(user?.bio || "");
  }, []);

  const handleUpdateUserDetails = async () => {
    // Checking for Values are changes or not

    // not image is selected
    if (!image) {
      if (userOldName === userName && userOldbio === userbio) {
        console.log("user name or bio is not changed");
        Toast.show({
          type: "info",
          text1: "Please make some changes ",
          text2: "for updating your details",
          visibilityTime: 6000,
        });
        return;
      }
    }

    setLoading(true);
    try {
      let uploadedImagURL;
      // upload image on firebase
      console.log("image:", image);
      if (image) {
        uploadedImagURL = await uploadImageToFirebase(image, imageName,'profile_pics');
        console.log("uploadedImagURL:", uploadedImagURL);
      }

      const resp = await update(ref(db, `users/${user?.uid}`), {
        name: userName,
        bio: userbio,
        image: image ? uploadedImagURL : user?.image,
      });
      console.log("resp:", resp);
      // ---------Upload  data on redux-------------------
      dispatch(changeUserDetails({ type: "name", value: userName! }));
      dispatch(changeUserDetails({ type: "bio", value: userbio! }));

      Toast.show({
        type: "success",
        text1: "Your details are update successfully",
        visibilityTime: 6000,
      });
      //------------- redirecting to the home page

      router.back();
    } catch (error) {
      console.log("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageName(`${user?.name}-${result?.assets[0].fileName as string}`);
    }
  };

  async function sendPushNotification(expoPushToken: string) {
    try {
      const message = {
        to: expoPushToken,
        sound: "default",
        title: "Original Title",
        body: "And here is the body!",
        data: { someData: "goes here" },
      };

      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      console.log("notification send successfull", res);
    } catch (error) {
      console.log("error:", error);
    }
  }

  const schedulePushNotification = async () => {
  await  Notifications.scheduleNotificationAsync({
      content: {
        title: "Redirecting to home chat",
        body: 'lets explore the home chat',
        data:{ data:"sending to home chat", url:"/(tabs)/homeChat"}
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    console.log("Notification scheduled successfully");
  };
  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={hp(10)}
        style={{ flex: 1, marginBottom: hp(1) }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <StatusBar style="dark" />
          <View
            style={{
              //   backgroundColor: "#f5f5f5",
              flex: 1,
              paddingTop: hp(3),
              paddingHorizontal: wp(8),
              gap: 15,
              paddingBottom: hp(10),
            }}
          >
            {/* ------------------ User Image + uploding image  */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                // backgroundColor:"red",
                // padding: hp(1),
              }}
            >
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  // backgroundColor:"blue",
                  padding: hp(1),
                  height: hp(19),
                  width: hp(19),
                  borderRadius: 100,
                  borderWidth: hp(0.8),
                  borderColor: "#e2e2e2",
                  position: "relative",
                }}
              >
                <Image
                  source={{ uri: image || user?.image }}
                  style={{
                    height: hp(16),
                    width: hp(16),
                    borderRadius: 100,
                  }}
                />
                {/* -------------------Icon for image change or update */}
                <TouchableOpacity

                  style={{
                    position: "absolute",
                    bottom: "2%",
                    right: "1%",
                    backgroundColor: "#fff",
                    height: wp(8),
                    width: wp(8),
                    alignItems: "center",
                    borderRadius: 100,
                    display: "flex",
                    justifyContent: "center",
                  }}
                  onPress={pickImage}
                >
                  <Feather name="camera" size={wp(5)} color="#B2BEB5" />
                </TouchableOpacity>
              </View>
            </View>

            {/* -------------------------- User Name and email---------------- */}

            <View style={{ gap: 20 }}>
              <View>
                <Text
                  style={{
                    fontSize: hp(3),
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {user?.name}
                </Text>
                <Text
                  style={{
                    fontSize: hp(2),
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#B2BEB5",
                  }}
                >
                  {user?.email}
                </Text>
              </View>
              {/* -------------------- User Name -------------------- */}

              <View>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    paddingInline: wp(5),
                    height: hp(7),
                    alignItems: "center",
                  }}
                >
                  <Feather name="user" size={24} color="gray" />
                  <TextInput
                    // placeholder="Enter name"
                    value={userName}
                    onChangeText={(newName) => {
                      console.log("newName:", newName);
                      setUserName(newName);
                    }}
                    style={{
                      fontSize: hp(2.2),
                      flex: 1,
                      marginRight: 5,
                      color: "gray",
                    }}
                  />
                </View>
              </View>

              {/* -------------------- Phone input-------------------- */}
              <View>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    paddingInline: wp(5),
                    height: hp(7),
                    alignItems: "center",
                  }}
                >
                  <Feather name="phone" size={24} color="gray" />
                  <TextInput
                    placeholder=""
                    keyboardType="phone-pad"
                    value={user?.phoneNumber || ""}
                    readOnly={true}
                    style={{
                      fontSize: hp(2.2),
                      flex: 1,
                      marginRight: 5,
                      color: "gray",
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text
                    style={{
                      fontSize: hp(2),
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "#B2BEB5",
                    }}
                  >
                    {"Read Only"}
                  </Text>
                </View>
              </View>
              {/* -------------------- User Bio-------------------- */}
              <View>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    paddingHorizontal: wp(5),
                    paddingVertical: hp(1), // added some vertical padding
                    alignItems: "flex-start", // aligns icon to top with text area
                  }}
                >
                  <Entypo
                    name="list"
                    size={24}
                    color="black"
                    style={{ marginTop: 1 }}
                  />
                  <TextInput
                    placeholder="Enter your bio (Optional)"
                    value={userbio}
                    onChangeText={(newBio) => setUserbio(newBio)}
                    style={{
                      fontSize: hp(2.2),
                      flex: 1,
                      color: "gray",
                      textAlignVertical: "top",
                      minHeight: hp(12), // height for text area
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>
              </View>
            </View>

            {/* --------------------------Save changes button */}

            <TouchableOpacity
              onPress={handleUpdateUserDetails}
              style={{
                height: hp(7),
                borderRadius: 10,
                marginTop: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fa7e29",
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#f5f5f5" />
              ) : (
                <Text
                  style={{
                    fontSize: hp(2.5),
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
});
