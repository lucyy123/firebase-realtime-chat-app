import EmptyGroupsMessage from "@/components/groups/EmptyGroupMessage";
import GroupsList from "@/components/groups/GroupsList";
import CustomeSearchBar from "@/components/shared/SearchBar";
import useCurrentUserGroup from "@/hooks/useCurrentUserGroup";
import { GroupType } from "@/utils/types";
import { getAuth } from '@react-native-firebase/auth';
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
const Groups = () => {
 const {loading,userGroups} =  useCurrentUserGroup()
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  const [filteredGroups, setFilteredGroups] = useState<GroupType[]>([]);
   
  const currentUserUid= getAuth().currentUser?.uid

//-------------------------filtered groups based on search query-------------------
useEffect(()=>{
const filtered = userGroups?.filter((group)=>group.name.toLowerCase().includes(searchQuery?.toLowerCase() as string))
setFilteredGroups(filtered || [])
},[searchQuery])





  const NoMatchWithSearchResult:GroupType[] = [
    {
      createdAt:1745920106369,
      createdBy: "",
      id: "111144445555",
      name: "No Match Found",
      image:'',
      messages:null,
      members:null,
      metadata:null,
      membersDetails:null

      
    },
  ];



  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
     {userGroups && userGroups.length>0 && <CustomeSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search by group name"
          />}
      {loading ? (
        <View style={{ top: hp(10) }}>
          <ActivityIndicator size={"large"} />
        </View>
      ) : (
        <>
          { userGroups && userGroups?.length <=0 ? <EmptyGroupsMessage/>:
          <GroupsList groups={searchQuery? filteredGroups.length<=0?NoMatchWithSearchResult:filteredGroups:userGroups} />
        }
        </>
      )}
    </View>
  );
};

export default Groups;

const styles = StyleSheet.create({});
