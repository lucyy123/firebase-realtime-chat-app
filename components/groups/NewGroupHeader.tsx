import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useRouter } from "expo-router";
import { Entypo, Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { AllUserListRedInitStateType, GroupSearchQueryRedInitState } from "@/utils/types";
import { set } from "@react-native-firebase/database";
import { setGroupSearchQuery } from "@/redux/reducers/groupSearchQuery";
import { StatusBar } from "expo-status-bar";

const NewGroupHeader = () => {
  const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
  const { searchedQuery,selectedMember } = useSelector(
    (state: { groupSearchQuery: GroupSearchQueryRedInitState }) =>
      state.groupSearchQuery
  );
  const router = useRouter();
  const dispatch = useDispatch();
    const {users} = useSelector((state:{allUsersList:AllUserListRedInitStateType})=>state.allUsersList)
  
  //------------------reset the searchedQuery when the back button is pressed------------------
  useEffect(()=>{
    dispatch(setGroupSearchQuery(''))
  },[])
  return (
<>
<StatusBar style="dark"></StatusBar>

<View
      style={{
        marginTop: hp(5),
        backgroundColor: "#dcdcdc",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingInline: isSearchBarVisible ? hp(1) : hp(2),
        paddingTop: hp(1.2),
        paddingBottom: hp(1.2),
      }}
    >
      {/* -------------------Back button + text+gp members counter */}
      {isSearchBarVisible ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#f4f4f5",
            borderRadius: hp(3.5),
            display: "flex",
            flexDirection: "row",
            gap: 10,
            paddingInline: wp(5),
            height: hp(5.5),
            alignItems: "center",
          }}
        >
          <Entypo
            name="chevron-left"
            size={hp(3.5)}
            color={"#737373"}
            onPress={() =>{
               setIsSearchBarVisible(false)
               dispatch(setGroupSearchQuery(''))

            }}
          />
          <TextInput
            placeholder="Search Name"
            keyboardType="default"
            value={searchedQuery}
            onChangeText={(query) => {
              dispatch(setGroupSearchQuery(query));
            }}
            style={{
              fontSize: hp(2.2),
              flex: 1,
              marginRight: 5,
              color: "gray",
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : (
        <>
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
                New Group
              </Text>
              <Text
                style={{
                  fontSize: hp(1.7),
                }}
              >
               { selectedMember<=0?'Add Members': `${selectedMember} of ${users?.length} members`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsSearchBarVisible(true)}
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Feather name="search" size={24} color="#737373" />
          </TouchableOpacity>
        </>
      )}
    </View>
</>

 
  );
};

export default NewGroupHeader;

const styles = StyleSheet.create({});
