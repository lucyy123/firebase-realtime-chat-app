import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import NewGroupHeader from "@/components/groups/NewGroupHeader";
import CustomHeader from "@/components/shared/CustomHeader";

const GroupsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="newGroup"
        options={{
          header: () => <NewGroupHeader />,
        }}
      />
      <Stack.Screen
        name="createGroup"
      
        options={{
          header: ()=><CustomHeader title="Create Group"/>
      
        }}
      />
    </Stack>
  );
};

export default GroupsLayout;

const styles = StyleSheet.create({});
