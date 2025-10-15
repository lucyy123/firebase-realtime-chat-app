
// UsersList.tsx
import React, { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import SingleUserInGp from "./SingleUserInGp";
import { AuthUserType } from "@/utils/types";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

type Props = {
  users: AuthUserType[];
  selectedMembers: AuthUserType[];
  handleToggleMember: (user: AuthUserType) => void;
};

const ITEM_HEIGHT = hp(9); // match the item’s container height

const UsersList: React.FC<Props> = ({
  users,
  selectedMembers,
  handleToggleMember,
}) => {
  // 1) Stable key extractor
  const keyExtractor = useCallback((user: AuthUserType) => user.uid, []);

  // 2) Precompute isSelected, pass it down
  const renderItem = useCallback(
    ({ item }: { item: AuthUserType }) => {
      const isSelected = selectedMembers.some((m) => m.uid === item.uid);
      return (
        <SingleUserInGp
          user={item}
          isSelected={isSelected}
          onToggle={() => handleToggleMember(item)}
        />
      );
    },
    [selectedMembers, handleToggleMember]
  );

  // 3) Tell RN exactly where each item lives
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default React.memo(UsersList);

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: 4 },
});
