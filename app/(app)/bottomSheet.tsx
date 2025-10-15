import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { RefObject, useRef } from "react";
import ActionSheet, {
  ActionSheetRef,
  FlatList,
} from "react-native-actions-sheet";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { DataItem } from "@/utils/types";
import { Feather } from "@expo/vector-icons";

type Props = {
  actionSheetRef: RefObject<ActionSheetRef>;
  data?: DataItem[];
  gestureEnabled: boolean;
  headerAlwaysVisible: boolean;
  showFlatList: boolean;
  leaveImage?: string;
  leaveText?: string;
  loading?: boolean;
};

const BottomSheet = ({
  actionSheetRef,
  data,
  gestureEnabled,
  headerAlwaysVisible,
  leaveImage,
  showFlatList,
  leaveText,
  loading,
}: Props) => {
  // const actionSheetRef = useRef<ActionSheetRef>(null);

  //-------------------- Render Itme for the bottom sheet------------------
  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={styles.item}>
      <Text>{item.name}</Text>
    </View>
  );
  return (
    <View>
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled={true} // allow dragging
        snapPoints={[hp(40)]} // draggable snap at half screen
        initialSnapIndex={0} // start at the first snap point
        indicatorStyle={styles.indicator} // styling for drag-handle
        headerAlwaysVisible={true}
      >
        {showFlatList ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerText}>Select the member</Text>
            </View>
            <FlatList
              data={data || []}
              keyExtractor={(item) => `${item.id}`}
              renderItem={renderItem}
            />
          </>
        ) : (
          <View>
            <Text style={styles.headerText}>
              Are you sure you want to {leaveText}
            </Text>

            {/* -----------Leave Image------------ */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Image
                source={require("../../assets/images/loginLogobg.png")}
                style={{
                  width: hp(20),
                  aspectRatio: 1,
                  objectFit: "contain",
                }}
                resizeMode="contain"
              />
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                // onPress={handleSignUp}
                // disabled = {!phoneNumberValid}
                style={{
                  // height: hp(7),
                  paddingVertical: hp(1.5),
                  backgroundColor: "#ffff",
                  borderRadius: 10,
                  marginTop: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  paddingHorizontal: hp(1.5),
                }}
              >
                <Text
                  style={{
                    fontSize: hp(1.8),
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {"Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={handleSignUp}
                // disabled = {!phoneNumberValid}
                style={{
                  // height: hp(7),
                  paddingVertical: hp(1.5),
                  backgroundColor: "red",
                  borderRadius: 10,
                  marginTop: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  paddingHorizontal: hp(1.5),
                }}
              >
                {loading ? (
                  <Feather name="loader" size={24} color="white" />
                ) : (
                  <Text
                    style={{
                      fontSize: hp(1.8),
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    {leaveText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ActionSheet>
    </View>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    height: hp(50),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: { alignItems: "center", marginBottom: 8 },
  headerText: { fontSize: 18, fontWeight: "bold" },
  item: { padding: 12, borderBottomWidth: 1, borderColor: "#ccc" },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 8,
  },
});
