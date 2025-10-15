// SingleUserInGp.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import FastImage from "react-native-fast-image";
import { AuthUserType } from "@/utils/types";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { FontAwesome5 } from "@expo/vector-icons";

type Props = {
  user: AuthUserType;
  isSelected: boolean;
  onToggle: () => void;
};

const SingleUserInGp: React.FC<Props> = ({ user, isSelected, onToggle }) => {
  // 1) Pick container style based on isSelected
  const containerStyle: ViewStyle = isSelected
    ? styles.selectedContainer
    : styles.unselectedContainer;

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.itemContainer, containerStyle]}
      activeOpacity={0.7}
    >
        {user.uid !== "111144445555"? (

<>
<View style={styles.avatarContainer}>
        <FastImage
          source={{
            uri:
              user.image ||
              "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FPerson.png?alt=media",
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.avatar}
          fallback
          defaultSource={require("./../../assets/images/userImage.jpg")}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
          {isSelected && (
            <FontAwesome5 name="check-circle" size={24} color="green" />
          )}
        </View>
      </View>

</>

        ):(
  <View style={{ flex: 1 }}>
            <Text style={styles.noResult}>No results found</Text>
          </View>

        )}
   
    </TouchableOpacity>
  );
};

// Only re-render if `user.uid` or `isSelected` changes
export default React.memo(
  SingleUserInGp,
  (prev, next) =>
    prev.user.uid === next.user.uid && prev.isSelected === next.isSelected
);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    height: hp(9), // must match ITEM_HEIGHT in parent
  },
  selectedContainer: {
    backgroundColor: "#F0F0F0",
  },
  unselectedContainer: {
    backgroundColor: "#fff",
  },
  avatarContainer: { marginRight: wp(4) },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: hp(3.25),
  },
  contentContainer: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    flex: 1,
    fontSize: hp(1.9),
    fontWeight: "600",
    color: "#1A1A1A",
    marginRight: wp(2),
  },
  noResult: {
    fontSize: hp(2),
    color: "#888",
    textAlign: "center",
    alignSelf: "center",
  },
});
