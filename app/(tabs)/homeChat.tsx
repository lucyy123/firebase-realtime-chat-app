import Chatlist from "@/components/chat/Chatlist";
import CustomeSearchBar from "@/components/shared/SearchBar";
import { setUsersList } from "@/redux/reducers/allUsersListSlice";
import {
  fetchAndUpdateUserCurrentLocation,
  userCurrentAddress,
} from "@/redux/reducers/locationSlice";
import { getConversationId } from "@/utils/common";
import {
  AuthUserType,
  UserLocationRedInitalStateType,
  UserReducerInitStateType,
} from "@/utils/types";
import { getAuth } from "@react-native-firebase/auth";
import {
  DataSnapshot,
  getDatabase,
  limitToLast,
  onValue,
  orderByChild,
  query,
  ref,
  update,
} from "@react-native-firebase/database";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";

type UserWithLastMessage = AuthUserType & { lastMessageTime: number };

const HomePage = () => {
  const [filteredUsers, setFilteredUsers] = useState<UserWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getDatabase();
  const currentUser = auth.currentUser;
  const currentUserId = auth.currentUser?.uid;
  const [searchedUsers, setSearchedUsers] = useState<UserWithLastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  const { address, location } = useSelector(
    (state: { userCurrentLocationReducer: UserLocationRedInitalStateType }) =>
      state.userCurrentLocationReducer
  );
  const LoggedUser = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer.user
  );

  // console.log("user in home chat:", LoggedUser);
  const dispatch = useDispatch();

  // Memoized user update function
  const updateUserLastMessage = useCallback(
    (userId: string, timestamp: number) => {
      setFilteredUsers((prev) => {
        if (!prev) return prev;
        const newUsers = prev.map((user) =>
          user.uid === userId ? { ...user, lastMessageTime: timestamp } : user
        );
        return [...newUsers].sort(
          (a, b) => b.lastMessageTime - a.lastMessageTime
        );
      });
    },
    []
  );

  // Initial data load
  useEffect(() => {
    if (!currentUserId) return;

    const userRef = ref(db, `users`);
    const unsubscribeUsers = onValue(userRef, async (snapshot) => {
      const usersData = snapshot.val() || {};
      const usersList: UserWithLastMessage[] = Object.keys(usersData)
        .filter((uid) => uid !== currentUserId)
        .map((uid) => ({
          uid: uid,
          ...usersData[uid],
          lastMessageTime: 0,
        }));

      // add users list in the reducers
      dispatch(setUsersList(usersList));

      // Batch fetch last messages
      const usersWithMessages = await Promise.all(
        usersList?.map(async (user) => {
          try {
            const conversationId = getConversationId(LoggedUser, user);
            const messagesRef = ref(db, `chats/${conversationId}/messages`);
            const lastMessageQuery = query(
              messagesRef,
              orderByChild("timeStamp"),
              limitToLast(1)
            );
            const messageSnapshot = await new Promise<DataSnapshot>((resolve) =>
              onValue(lastMessageQuery, resolve, { onlyOnce: true })
            );

            if (messageSnapshot.exists()) {
              const messages = messageSnapshot.val();
              const lastMessageKey = Object.keys(messages)[0];
              return {
                ...user,
                lastMessageTime: messages[lastMessageKey].timeStamp,
              };
            }
          } catch (error) {
            console.error("Error fetching message:", error);
          }

          return user;
        })
      );

      // Initial sort
      const sortedUsers = usersWithMessages?.sort(
        (a, b) => b.lastMessageTime - a.lastMessageTime
      );
      setFilteredUsers(sortedUsers);
      setLoading(false);
    });

    return () => unsubscribeUsers(); //cleanup
  }, [
    currentUserId,
    LoggedUser, // ← you MUST include this
    dispatch,
  ]);

  // Real-time listeners setup
  useEffect(() => {
    if (!currentUserId || filteredUsers?.length === 0) return;

    const unsubscribeFunctions: (() => void)[] = [];

    filteredUsers?.forEach((user) => {
      const conversationId = getConversationId(LoggedUser, user);
      const messagesRef = ref(db, `chats/${conversationId}/messages`);
      const lastMessageQuery = query(
        messagesRef,
        orderByChild("timeStamp"),
        limitToLast(1)
      );

      const unsubscribe = onValue(lastMessageQuery, (snapshot) => {
        if (snapshot.exists()) {
          const messages = snapshot.val();
          const lastMessageKey = Object.keys(messages)[0];
          const timestamp = messages[lastMessageKey].timeStamp;
          if (user?.uid) {
            updateUserLastMessage(user.uid, timestamp);
          }
        }
      });

      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions?.forEach((unsub) => unsub());
    };
  }, [currentUserId, filteredUsers.length, updateUserLastMessage]);

  //---------------------Filter - Search Functionality
  useEffect(() => {
    const searchedUsersList = filteredUsers?.filter((ele) =>
      ele?.name?.toLowerCase().includes(searchQuery?.toLowerCase()!)
    );

    setSearchedUsers(searchedUsersList);
  }, [searchQuery]);

  // ----------------- Get user current location after every 5 minuts
  useEffect(() => {
    const interval = setInterval(async () => {
      const userCurrentlocation = await Location.getCurrentPositionAsync({});
      const { coords } = userCurrentlocation;
      if (coords) {
        const { latitude, longitude } = coords;
        const UserActuallLocation = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        console.log("longitude:", longitude);
        console.log("latitude:", latitude);
        const { city, country, formattedAddress, postalCode, region } =
          UserActuallLocation[0];

        // Only update the user location when its co-ordinates gets changed
        if (
          latitude === location?.latitude &&
          longitude === location.longitude
        ) {
          Toast.show({
            type: "info",
            text1: "User's location not changed ",
            text2: "No need to upload on firebase",
          });
          return;
        } else {
          // Save the new user location on reducers as well upload location on database
          //----------------------Set user Current location
          dispatch(fetchAndUpdateUserCurrentLocation({ latitude, longitude }));
          //------------------------ Set user current position
          dispatch(
            userCurrentAddress({
              city: city || "",
              country: country || "",
              formattedAddress: formattedAddress || "",
              postalCode: postalCode || "",
              region: region || "",
            })
          );

          await update(ref(db, `users/${auth.currentUser?.uid}`), {
            locationDetails: {
              location: {
                latitude,
                longitude,
              },
              address: {
                city: city || "",
                country: country || "",
                formattedAddress: formattedAddress || "",
                postalCode: postalCode || "",
                region: region || "",
              },
            },
          });
          console.log("User location is updated on RTDB");
        }
      }
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

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

  // console.log("searchedUsers:", searchedUsers);
  // console.log("filteredUsers:", filteredUsers);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <CustomeSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      {loading ? (
        <View style={{ top: hp(10) }}>
          <ActivityIndicator size={"large"} />
        </View>
      ) : (
        <>
          <Chatlist
            users={
              searchQuery
                ? searchedUsers.length <= 0
                  ? NoMatchWithSearchResult
                  : searchedUsers
                : filteredUsers
            }
          />
        </>
      )}
    </View>
  );
};

export default HomePage;
