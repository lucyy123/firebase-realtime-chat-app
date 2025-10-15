import { AuthUserType, GroupType } from "@/utils/types";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import SingleUserInGp from "./SingleUserInGp";
import GroupItem from "./GroupItem";

type Props = {
  groups: GroupType[] | [] | undefined;
};

const GroupsList = ({ groups }: Props) => {


  return (
    <View style={styles.container}>
      <FlatList
        data={groups || []}
        keyExtractor={(group)=>`${group?.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({item,index})=>(
            <GroupItem group = {item}/>
        )}
      />
    </View>
  );
};

export default GroupsList;

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: 4 },
});
