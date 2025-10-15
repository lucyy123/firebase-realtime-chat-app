import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { AuthUserType } from "@/utils/types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Entypo, Feather } from "@expo/vector-icons";
import { fixFirebaseUrl } from "@/utils/common";

type Props = {
  user: AuthUserType;
  handleToggleMember: (user: AuthUserType) => void;
};

const SelectedGpMemberAvatar = ({ user, handleToggleMember }: Props) => {
  console.log('user:', user)
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        height: hp(7),
        width: hp(7),
        padding: hp(1),
        borderRadius: hp(3.5),
        position: "relative",
      }}
    >
      {user?.image ? (
        <Image
          source={{
            uri:
              user?.image ||
              "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FphoneNumber.jpg?alt=media&token=610c23e9-2dc6-4c55-8c96-e6f00da6a46d",
          }}
          style={{
            height: hp(7),
            width: hp(7),
            borderRadius: hp(3.5),
          }}
        />
      ) : (
        <Image
          source={require("../../assets/images/defaultImage.jpg")}
          style={{
            height: hp(7),
            width: hp(7),
            borderRadius: hp(3.5),
          }}
        />
      )}

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: "-3%",
          right: "-15%",
          backgroundColor: "#f4f4f4",
          // height: wp(5),
          // width: wp(5),
          borderColor: "#DDDDDD",
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: hp(3.5),
        }}
        onPress={() => {
          handleToggleMember(user);
        }}
      >
        <Entypo name="cross" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

export default SelectedGpMemberAvatar;

const styles = StyleSheet.create({});
