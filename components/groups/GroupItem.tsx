import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { Dispatch, useEffect, useMemo, useState } from "react";
import { Router, useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { formatTimestampTo12Hour, getConversationId } from "@/utils/common";
import {
  AuthUserType,
  GroupType,
  MessageType,
  SelectedGpMemberType,
} from "@/utils/types";
import { getAuth } from "@react-native-firebase/auth";
import {
  getDatabase,
  limitToLast,
  onValue,
  orderByChild,
  query,
  ref,
} from "@react-native-firebase/database";
import FastImage from "react-native-fast-image";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

type Props = {
  group: GroupType;
};

const GroupItem = ({ group }: Props) => {
  console.log('group inGroupItem:', group?.metadata)
  const auth = getAuth();
  const db = getDatabase();
  const currentUserId = auth.currentUser?.uid;
  const lastMessage = group?.metadata?.lastMessage ;
  const lastMessageSenderId= group?.metadata?.lastMessageSenderId;
  const lastMessageTimeStamp = group?.metadata?.lastMessageTime;
  const [unreadCounts, setUnreadCounts] = useState<number>(0);
  const router = useRouter();
  const [isUserAddedIntoGp, setIsUserAddedIntoGp] = useState<boolean>(false);

  // set the unread messages count of the user when mounting

  const renderLastMessage = () => {
    if (!lastMessage) return "Say Hi To Everyone 👋";

    let messageContent = "";

     if (lastMessage.length > 25) {
      messageContent = `${lastMessage?.substring(0, 25)}...`;
    } else {
      messageContent = lastMessage;
    }

    // Add 'You: ' prefix for current user's messages
    if ( lastMessageSenderId=== currentUserId) {
      messageContent = `You: ${messageContent}`;
    }

    return messageContent;
  };

  const renderMessageTime = () => {
    const ts = lastMessageTimeStamp
    if (!ts) return "";

    const msgDate = new Date(ts);
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // helper to test if two dates are on the same Y/M/D
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    // 1️⃣ Today
    if (isSameDay(msgDate, now)) {
      return formatTimestampTo12Hour(ts);
    }

    // 2️⃣ Yesterday
    const yesterday = new Date(now.getTime() - oneDay);
    if (isSameDay(msgDate, yesterday)) {
      return `Yesterday ${formatTimestampTo12Hour(ts)}`;
    }

    // 3️⃣ Within last 7 days → weekday
    const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / oneDay);
    if (diffDays < 7) {
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return `${weekdays[msgDate.getDay()]} ${formatTimestampTo12Hour(ts)}`;
    }

    // 4️⃣ Older → short month/day + time
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${
      months[msgDate.getMonth()]
    } ${msgDate.getDate()} ${formatTimestampTo12Hour(ts)}`;
  };

  const handleRedirectToChatRoom = () => {
    router.push({
      pathname: "/(groups)/groupChatRoom",
      params: { group: JSON.stringify(group) },
    });
  };

  return (
    <>
      <TouchableOpacity
        onPress={()=>handleRedirectToChatRoom()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: hp(1.5),
          paddingHorizontal: wp(4),
          backgroundColor: isUserAddedIntoGp ? "#F0F0F0" : "#ffff",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
        activeOpacity={0.7}
      >
        {group?.id !== "111144445555" ? (
          <>
            <View style={styles.avatarContainer} >
              <FastImage
                source={{
                  uri:
                    group?.image ||
                    "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FPerson.png?alt=media&token=81724f29-94bc-4842-a420-a59378e8ea02",
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.avatar}
                fallback={true}
                defaultSource={require("./../../assets/images/userImage.jpg")}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <Text style={styles.userName} numberOfLines={1}>
                  {group?.name}
                </Text>
                {lastMessage && (
                  <Text style={styles.timeText}>{renderMessageTime()}</Text>
                )}
                {unreadCounts > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCounts > 99 ? "99+" : unreadCounts}
                    </Text>
                  </View>
                )}

                {isUserAddedIntoGp ? (
                  <FontAwesome5 name="check-circle" size={24} color="green" />
                ) : (
                  ""
                )}
              </View>

              <View style={styles.messageContainer}>
                {lastMessageSenderId === currentUserId && (
                  <MaterialIcons
                    name={lastMessage?  "done-all" : "done"}
                    size={hp(1.8)}
                    color="#888"
                    style={styles.statusIcon}
                  />
                )}
                <Text style={[styles.messageText]} numberOfLines={1}>
                  {renderLastMessage()}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.noResult}>No results found</Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    // backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarContainer: {
    position: "relative",
    marginRight: wp(4),
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: hp(3.25),
  },

  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  userName: {
    flex: 1,
    fontSize: hp(1.9),
    fontWeight: "600",
    color: "#1A1A1A",
    marginRight: wp(2),
  },
  timeText: {
    fontSize: hp(1.5),
    color: "#888",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: wp(1.5),
  },
  messageText: {
    flex: 1,
    fontSize: hp(1.7),
    color: "#666",
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#000",
  },
  noResult: {
    fontSize: hp(2),
    color: "#888",
    textAlign: "center",
    alignSelf: "center",
  },

  badge: {
    position: "absolute",
    top: hp(3),
    right: hp(0),
    height: hp(3.5),
    width: hp(4),
    borderRadius: 100,
    backgroundColor: "#0077e4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default React.memo(GroupItem);
