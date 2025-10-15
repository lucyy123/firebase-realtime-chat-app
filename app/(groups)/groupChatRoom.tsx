import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "@react-native-firebase/auth";
import {
  GroupMessageType,
  GroupType,
  UserReducerInitStateType,
} from "@/utils/types";
import GroupChatRoomHeader from "@/components/groups/GroupChatRoomHeader";
import {
  getDatabase,
  push,
  ref,
  update,
} from "@react-native-firebase/database";
import { useSelector } from "react-redux";
import { useGroupMessages } from "@/hooks/useGroupMessages";
import MessageItem from "@/components/homeUtils/MessageItem";

const GroupChatRoom = () => {
  const { group: raw } = useLocalSearchParams<{ group?: string }>();
  const group = raw ? (JSON.parse(raw) as GroupType) : undefined;
  const { messages, loadMore, isLoadingMore } = useGroupMessages(group?.id!);
  const inputRef = useRef<TextInput>(null);
  const messageRef = useRef("");
  const flatListRef = useRef<FlatList<GroupMessageType>>(null);
  const db = getDatabase();

  const { user } = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer
  );

  // whenever `messages` updates, scroll to the bottom (index 0 after inversion)
  useEffect(() => {
    if (messages.length) {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  }, [messages]);

  const currentUserUID = user?.uid;
  const currentUserName = user?.name;
  const PADDING_BOTTOM = Platform.OS === "ios" ? 20 : 0;
  const useGradualAnimation = () => {
    const height = useSharedValue(PADDING_BOTTOM);

    useKeyboardHandler(
      {
        onMove: (e) => {
          "worklet";
          height.value = Math.max(e.height, PADDING_BOTTOM);
        },
      },
      []
    );
    return { height };
  };

  const { height } = useGradualAnimation();
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  const handleSendMessage = async (senderId: string, senderName: string) => {
    try {
      const message = messageRef.current;
      if (message.trim() === "") return;

      // if (!groupId || !senderId || !senderName || !currentUserUID || !groupId){

      //   console.log('SenderId or SenderName or Group Id null:',)
      //   return
      // }
      const groupId = group?.id as string;
      console.log("groupId:", groupId);
      console.log("senderId:", senderId);
      console.log("senderName:", senderName);
      const timeStamp = Date.now();
      const type = "text"; // Assuming all messages are text for now

      // Message object

      // Create a new message key
      const newMessageRef = push(ref(db, `groups/${groupId}/messages`));
      const messageId = newMessageRef.key;
      console.log("messageId:", messageId);
      if (!messageId) {
        throw new Error("Failed to generate message ID.");
      }

      const newMessage: GroupMessageType = {
        id: messageId,
        message,
        senderId,
        senderName,
        timeStamp,
        type,
      };
      // Multi-path update for message + metadata
      const updates: any = {};
      updates[`groups/${groupId}/messages/${messageId}`] = newMessage;
      updates[`groups/${groupId}/metadata/lastMessage`] = message;
      updates[`groups/${groupId}/metadata/lastMessageTime`] = timeStamp;
      updates[`groups/${groupId}/metadata/lastMessageSenderId`] = senderId;

      await update(ref(db), updates);
      console.log("Message sent successfully:", newMessage);
      messageRef.current = "";
      inputRef.current?.clear();
    } catch (error) {
      console.log("error while sending the message:", error);
    }
  };

  //------------------------------------ Remove Member from Group-------------------

  // export async function removeMemberFromGroup(
  //   groupId: string,
  //   memberUid: string
  // ): Promise<void> {
  //   const db = getDatabase();
  //   const updates: Record<string, any> = {
  //     // Setting a path’s value to `null` deletes that key
  //     [`groups/${groupId}/members/${memberUid}`]:     null,
  //     [`userGroups/${memberUid}/${groupId}`]:         null,
  //   };
  //   await update(ref(db), updates);
  // }

  //--------------------------------- Add Member to Group-------------------

  // export async function addMemberToGroup(
  //   groupId: string,
  //   memberUid: string
  // ): Promise<void> {
  //   const db = getDatabase();
  //   const updates: Record<string, any> = {
  //     // 1. Mark membership in the group
  //     [`groups/${groupId}/members/${memberUid}`]:     true,
  //     // 2. Add this group under the user’s index
  //     [`userGroups/${memberUid}/${groupId}`]:         true,
  //   };
  //   await update(ref(db), updates);
  // }

  const renderItem = ({ item }: { item: GroupMessageType }) => (
    <MessageItem
      key={item.id}
      currentUserId={user?.uid!}
      message={item}
      isInGroup={true}
      senderName={currentUserName}
    />
  );

  return (
    <View
      style={{
        flex: 1, // entire space
        // backgroundColor:"red"
      }}
    >
      <GroupChatRoomHeader group={group!} />
      <View
        style={{
          // backgroundColor: "red",
          flex: 1,
          overflow: "visible",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flex: 1,
            // backgroundColor: "purple",
          }}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            // inverted
            keyExtractor={(item) => `${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.1}
            onEndReached={() => {
              if (!isLoadingMore) loadMore();
            }}
          />
        </View>

        <View style={{ marginBottom: hp(2.7), paddingTop: 16 }}>
          {/* Input & Send Button Container */}
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              flexDirection: "row",
              borderRadius: 50,
              marginHorizontal: 10,
              display: "flex",
              backgroundColor: "#fff",
              alignItems: "center",
              paddingHorizontal: 4,
              height: 45,
            }}
          >
            <TextInput
              placeholder="Type message..."
              multiline={true}
              scrollEnabled={true}
              ref={inputRef}
              onChangeText={(text) => {
                messageRef.current = text;
              }}
              style={{
                flex: 1,
                fontSize: hp(2.2),
                paddingLeft: 10,
                backgroundColor: "transparent", // Transparent background
                overflow: "visible", // Prevents overflow issues
                width: "100%",
                maxHeight: 120,

                // minHeight:10
              }}
            />
            {/* // Animated .view will be there........ */}

            <TouchableOpacity
              onPress={() =>
                handleSendMessage(currentUserUID!, currentUserName!)
              }
              style={{
                backgroundColor: "#A4DDED",
                borderRadius: 100,
                padding: 8,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 3,
              }}
            >
              {/* --------------------------- send button for message */}
              <Feather name="send" size={hp(2.7)} color={"#737373"} />
            </TouchableOpacity>
          </View>
        </View>
        <Animated.View style={fakeView} />
      </View>
    </View>
  );
};

export default GroupChatRoom;

const styles = StyleSheet.create({
  avatar: {
    height: hp(5.4),
    width: hp(5.4),
    borderRadius: hp(3.25),
  },
  threeDot: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
});
