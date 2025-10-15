import { GroupMessageType, MessageType } from "@/utils/types";
import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import MessageItem from "./MessageItem";
type Props = {
  messages: MessageType[] | undefined | GroupMessageType[];
  currentUserId: string | undefined | null;
  isInGroup?:boolean;
  senderName?:string | null
};

const MessageList = ({ messages, currentUserId,isInGroup = false,senderName }: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);


  useEffect(() => {
    // Auto-scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  console.log("messages in list:", messages);
  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 10,
        paddingBottom: 20,
      }}
      style={{ flex: 1 }}
      onContentSizeChange={() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }}
    >
      {messages?.map((message: MessageType | GroupMessageType, index) => (
        <MessageItem
          currentUserId={currentUserId}
          message={message}
          key={Date.now() + index}
          isInGroup={isInGroup}
          senderName={senderName}
        />
      ))}
    </ScrollView>
  );
};

export default MessageList;

const styles = StyleSheet.create({});
