import { StyleSheet, Text, View } from "react-native";
import React, { ReactNode } from "react";
import { MenuOption } from "react-native-popup-menu";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type Props = {
  text: string;
  handleAction: (value:number | null) => void;
  value: number | null;
  icon: ReactNode;
};

const CustomMenuOption = ({ handleAction, icon, text, value }: Props) => {
  return (
    <MenuOption onSelect={()=>handleAction(value)}>
      <View style={styles.container}>
        <Text>{text} </Text>
        {icon}
      </View>
    </MenuOption>
  );
};

export default CustomMenuOption;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection:"row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingInline:hp(1.3),
    paddingVertical:hp(1)

  },
});
