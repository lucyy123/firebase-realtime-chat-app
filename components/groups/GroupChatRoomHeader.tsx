import { GroupType } from "@/utils/types";
import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomMenuOption from "../shared/CustomMenuOption";
import { Menu, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { ActionSheetRef } from "react-native-actions-sheet";
import BottomSheet from "@/app/(app)/bottomSheet";
import { dummyData } from "@/utils/common";
type Props = {
  group: GroupType;
};

const GroupChatRoomHeader = ({ group }: Props) => {
  const router = useRouter();
  const actionSheetRef = useRef<ActionSheetRef>(null); 
  const [ fromLeaveGroup,setFromLeaveGroup] = useState(false);


  return (
    <>
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
                onPress={() => router.replace("/(tabs)/groups")}
                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  backgroundColor: "",
                  padding: 8,  
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Entypo name="chevron-left" size={hp(4)} color={"#737373"} onMagicTap={() => router.replace("/(tabs)/groups")}/>
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

                <FastImage
                  source={{
                    uri:
                      group?.image ||
                      "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FphoneNumber.jpg?alt=media&token=610c23e9-2dc6-4c55-8c96-e6f00da6a46d",
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.avatar}
                  fallback={true}
                  defaultSource={require("./.../../../../assets/images/userImage.jpg")}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {/* --------------------- Name--------------------------- */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={{
                    paddingRight: wp(5),
                    paddingBottom: hp(0.5),
                  }}
                  onPress={() => {
                    console.log("Navigating to group details");
                    router.push("/(groups)/groupDetails");
                  }}
                >
                  <Text
                    style={{
                      fontSize: hp(2.5),
                      color: "grey",
                      fontWeight: "700",
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {group?.name}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* -------------------------------Menu options------------ */}
            </View>
          ),

          headerRight: () => (
            <View style={styles.threeDot}>
              <Menu>
                <MenuTrigger
                  customStyles={{
                    triggerWrapper: {
                      // trigger wrapper styles
                    },
                  }}
                >
                  <Entypo
                    name="dots-three-vertical"
                    size={hp(2.5)}
                    color="black"
                  />
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
                      // router.push("/(app)/bottomSheet");
                      setFromLeaveGroup(false);         // false→we want the ADD-MEMBER variant
                      actionSheetRef.current?.show(); 
                      // console.log("opening the bottom sheet")
                    }}
                    icon={
                      <AntDesign name="adduser" size={hp(2.5)} color="black" />
                    }
                    text="Add Member"
                    value={null}
                  />

                  <CustomMenuOption
                    handleAction={() => {                    
                        // its mean showing Leave group sheet
                        setFromLeaveGroup(true);          // true→we want the LEAVE-GROUP variant
                        actionSheetRef.current?.show();
                      
                    }}
                    icon={
                      // <Feather name="leave" color="black" />
                      <Ionicons
                        name="exit-outline"
                        size={hp(2.5)}
                        color="black"
                      />
                    }
                    text="Leave Group"
                    value={null}
                  />
                </MenuOptions>
              </Menu>
            </View>
          ),
        }}
      >
        {/* -------------------------------Modal for adding members------------ */}
      </Stack.Screen>
      <BottomSheet
        actionSheetRef={actionSheetRef}
        data={fromLeaveGroup ? [] : dummyData}
        gestureEnabled={!fromLeaveGroup}
        headerAlwaysVisible={!fromLeaveGroup}
        showFlatList={!fromLeaveGroup}
        leaveText={fromLeaveGroup ? "Leave" : undefined}
        leaveImage={fromLeaveGroup ? require("../../assets/images/loginLogobg.png") : undefined}
      />
    </>
  );
};

export default GroupChatRoomHeader;

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
