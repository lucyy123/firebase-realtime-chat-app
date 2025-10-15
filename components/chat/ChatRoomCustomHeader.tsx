import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AuthUserType } from "@/utils/types";
import FastImage from "react-native-fast-image";
import { StatusBar } from "expo-status-bar";
import { getDatabase, onValue, ref } from "@react-native-firebase/database";

type Props = {
  receverUser: AuthUserType | undefined;
};

const ChatRoomCustomHeader = ({ receverUser }: Props) => {
  const router = useRouter();
  const db = getDatabase()
  const [recieverUserDetails,setRecieverUserDetails] = useState<AuthUserType>()
  
  console.log('receverUser in chat room header:', receverUser)
  useEffect(()=>{
    console.log('receverUser?.uid:', receverUser?.uid)
    const userRef = ref(db, `users/${receverUser?.uid}`);
    onValue(userRef, (snapshot) => {
      setRecieverUserDetails(snapshot.val());
      console.log("snapshot.val() in chat room header:", snapshot.val());
    });
  },[receverUser])
  const handleBack = () => {
    console.log("back presssed new again");
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/(tabs)/homeChat');
    }
  };
  
  console.log('recieverUserDetails:', recieverUserDetails)
  return (

    <>
    <StatusBar style="dark"/>
    <Stack.Screen
      options={{
        title: "",
        headerShadowVisible: false,
        headerLeft: () => (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 5,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              // style={{ backgroundColor: "", paddingVertical: 2 }}
              //  android_ripple={{ color: '#ccc', borderless: true }}
              // hitSlop={10}                   // <- expands tap area by 10px on all sides
              style={{
                padding: 8,                   // <- gives a guaranteed tappable area
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Entypo name="chevron-left" size={hp(4)} color={"#737373"} onMagicTap={handleBack} />
            </TouchableOpacity>

            {/* -------------------------------User Image + User Name------------ */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: hp(1),
              }}
            >
              {/* --------------------- Image */}
              {/* <Image
                source={require("../assets/images/userImage.jpg")}
                style={{
                  height: hp(4.5),
                  width: hp(4.5),
                  borderRadius: 100,
                }}
              /> */}

              <FastImage
                source={{
                  uri:
                    recieverUserDetails?.image ||
                    "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FphoneNumber.jpg?alt=media&token=610c23e9-2dc6-4c55-8c96-e6f00da6a46d",
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.avatar}
                fallback={true}
                defaultSource={require("./../../assets/images/userImage.jpg")}
              />
              {/* --------------------- Name */}
              <Text
                style={{
                  fontSize: hp(2.5),
                  color: "grey",
                  fontWeight: "700",
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {recieverUserDetails?.name}
              </Text>
            </View>
          </View>
        ),
      }}
    >
      
    </Stack.Screen>
    </>
  );
};

export default ChatRoomCustomHeader;
const styles = StyleSheet.create({
  avatar: {
    height: hp(5),
    width: hp(5),
    borderRadius: hp(3.25),
  },
});
