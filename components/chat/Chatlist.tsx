import { AuthUserType } from "@/utils/types";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import ChatItem from "./ChatItem";

type Props = {
  users: AuthUserType[];
};

const Chatlist = ({users}: Props) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <FlatList
        data={users || []}
        keyExtractor={(user) =>`${user?.uid}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 2 }}
        renderItem={({item, index }) => (
          <ChatItem user={item} router={router}/>
        )}
      />
    </View>
  );
};

export default Chatlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
 
  },
});
