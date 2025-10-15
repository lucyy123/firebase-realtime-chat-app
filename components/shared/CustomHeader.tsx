import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

type Props = {
  title: string;
};

const CustomHeader = ({ title }: Props) => {
  const router = useRouter();
  return (
    <>
      <StatusBar style="dark"></StatusBar>

      <View
        style={{
          marginTop: hp(5),
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          paddingInline: hp(2),
          paddingVertical: hp(2),
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: "", paddingVertical: 2 }}
          >
            <Entypo name="chevron-left" size={hp(3.5)} color={"#737373"} />
          </TouchableOpacity>
          <View style={{ marginLeft: hp(1) }}>
            <Text
              style={{
                fontSize: hp(2.4),
              }}
            >
              {title}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({});
