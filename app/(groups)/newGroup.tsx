import SelectedGpMemberAvatar from "@/components/groups/selectedMembersAvatar";
import UsersList from "@/components/groups/UsersList";
import { setUsersList } from "@/redux/reducers/allUsersListSlice";
import { updateSelectedMemberCount } from "@/redux/reducers/groupSearchQuery";
import { AddMember } from "@/redux/reducers/groupSelectedMemberSlice";
import {
  AllUserListRedInitStateType,
  AuthUserType,
  GroupSearchQueryRedInitState,
} from "@/utils/types";
import { Feather } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { getDatabase, onValue, ref } from "@react-native-firebase/database";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { FloatingAction } from "react-native-floating-action";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";

const NewGroup = () => {
  const [selectedMembers, setSelectedMembers] = useState<AuthUserType[]>([]);
  const [searchedUsersExeptMe, setSearchedUsersExeptMe] = useState<
    AuthUserType[]
  >([]);

  const [users, setUsers] = useState<AuthUserType[]>([]);
  console.log("reducers users:", users);
  const { searchedQuery } = useSelector(
    (state: { groupSearchQuery: GroupSearchQueryRedInitState }) =>
      state.groupSearchQuery
  );
  const dispatch = useDispatch();

  const router = useRouter();

  const currentUserId = getAuth().currentUser?.uid;
  //-----------------Fetch the all users from redux stater-----------------------

  useEffect(() => {
    if (!currentUserId) return;

    const db = getDatabase();
    const usersRef = ref(db, "users");

    // Subscribe
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val() || {};
      const usersList = Object.keys(usersData)
        .filter((uid) => uid !== currentUserId)
        .map((uid) => ({
          uid,
          ...usersData[uid],
          lastMessageTime: 0,
        }));

      setUsers(usersList);
    });

    // Cleanup
    return unsubscribe;
  }, [currentUserId, dispatch]);

  useEffect(() => {
    const filteredUsers = users?.filter((user) =>
      user?.name?.toLowerCase().includes(searchedQuery?.toLowerCase()!)
    );
    setSearchedUsersExeptMe(filteredUsers!);
  }, [searchedQuery]);

  const handleToggleMember = (user: AuthUserType) => {
    console.log('user in handle toggle member:', user)
    if (user) {

      // save the selectedMember in redux to avoid the image url broken issue
      dispatch(AddMember(user))
      setSelectedMembers((prev) => {
        const isIn = prev.some((m) => m.uid === user.uid);
        return isIn
          ? prev.filter((m) => m.uid !== user.uid) // remove
          : [...prev, user]; // add
      });
    }
  };

  const NoMatchWithSearchResult = [
    {
      bio: "",
      email: "monis.handysolver@gmail.com",
      image:
        "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2Fmonis%20khan%2B944bcca2-2852-4711-a5c0-31a698d72eec.jpeg?alt=media&token=5e13b06f-db46-4b3d-8453-6ca4d3ad82e9",
      lastMessageTime: 0,
      mergedAt: 1743849804083,
      name: "No results found",
      phoneNumber: "+919876543210",
      providers: ["password", "phone"],
      role: "0",
      uid: "111144445555",
    },
  ];

  // ----------------------update the selected members quantity on redux -------------------------

  useEffect(() => {
    dispatch(updateSelectedMemberCount(selectedMembers.length || 0));
  }, [selectedMembers.length]);

  const actions = [];

  const handleRedirect = () => {
    if (selectedMembers.length <= 0) {
      Toast.show({
        type: "error",
        text1: "No members selected",
        text2: "Please select at least one member to create a group.",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
        bottomOffset: 50,
      });
      return;
    }

    router.push({
      pathname: "/(groups)/createGroup",
      params: { selectedMembers: JSON.stringify(selectedMembers) },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ------------------------------------Selected members horizontal list--------------------------------- */}
      <View style={{}}>
        <FlatList
          data={selectedMembers || []}
          horizontal={true}
          keyExtractor={(selectedMembers) => `${selectedMembers?.uid}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            gap: wp(2),
            paddingVertical: selectedMembers.length > 0 ? hp(1.5) : hp(0),
            paddingHorizontal: selectedMembers.length > 0 ? hp(1.6) : hp(0),
          }}
          renderItem={({ item, index }) => (
            <SelectedGpMemberAvatar
              user={item}
              handleToggleMember={handleToggleMember}
            />
          )}
        />
      </View>

      {/* ---------------------------------------------List of all members--------------------------------------- */}

      <View
        style={{
          backgroundColor: "#f4f4f4",
          flex: 1,
          borderTopWidth: 1,
          borderColor: "#737373",
        }}
      >
        <Text
          style={{
            fontSize: hp(1.6),
            color: "#737373",
            paddingHorizontal: hp(2.5),
            paddingVertical: hp(1),
          }}
        >
          All Contacts
        </Text>

        <UsersList
          users={
            searchedQuery
              ? searchedUsersExeptMe.length <= 0
                ? NoMatchWithSearchResult
                : searchedUsersExeptMe
              : users || []
          }
          handleToggleMember={handleToggleMember}
          selectedMembers={selectedMembers}
        />
      </View>

      <FloatingAction
        color="#737373"
        showBackground={false}
        floatingIcon={
          <Feather name="arrow-right" color={"#fff"} size={hp(3.2)} />
        }
        onPressMain={handleRedirect}
      />
    </View>
  );
};

export default NewGroup;

const styles = StyleSheet.create({});
