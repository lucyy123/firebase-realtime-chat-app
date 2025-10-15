import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { get, getDatabase, onValue, ref } from "@react-native-firebase/database";
import { getAuth } from "@react-native-firebase/auth";
import { GroupType } from "@/utils/types";

const useCurrentUserGroup = () => {
  const [userGroups, setUserGroups] = useState<GroupType[]| []>();
  const db = getDatabase();
  const currentUserUid = getAuth().currentUser?.uid
  const [loading,setLoading] = useState(false)

  //--------------------------------Fetch all user

  useEffect(() => {
    const db = getDatabase();
    const userGroupsRef = ref(db, `userGroups/${currentUserUid}`);
  
    const groupUnsubscribers: (() => void)[] = [];
  
    const unsubscribeUserGroups = onValue(userGroupsRef, (userGroupsSnap) => {
      const groupIds = Object.keys(userGroupsSnap.val() || {});
  
      if (groupIds.length === 0) {
        setUserGroups([]);
        return;
      }
  
      setLoading(true);
  
      Promise.all(
        groupIds.map((groupId) => {
          return new Promise((resolve) => {
            const groupRef = ref(db, `groups/${groupId}`);
            const unsubscribeGroup = onValue(groupRef, (groupSnap) => {
              resolve({
                id: groupId,
                ...groupSnap.val(),
              });
            });
  
            groupUnsubscribers.push(unsubscribeGroup); // Store the unsubscribe function
          });
        })
      )
        .then((groups) => {
        const sorted = (groups as GroupType[])
          .sort((a, b) => {
            // grab lastMessageTime or fallback to createdAt
            const ta = a.metadata?.lastMessageTime ?? a.createdAt;
            const tb = b.metadata?.lastMessageTime ?? b.createdAt;
            // newest first:
            return tb - ta;
          });
        setUserGroups(sorted);
        console.log('sorted:', sorted)
      })
        .catch((err) => console.log("Error fetching groups:", err))
        .finally(() => {
          setLoading(false);
        });
    });
  
    // Clean up on unmount
    return () => {
      unsubscribeUserGroups();
      groupUnsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return {userGroups,loading};
};

export default useCurrentUserGroup;
