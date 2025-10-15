


import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import FastImage from "react-native-fast-image";
import ImageView from "react-native-image-viewing";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { formatTimestampTo12Hour } from "@/utils/common";
import { MessageType, GroupMessageType } from "@/utils/types";

type Props = {
  message: MessageType | GroupMessageType;
  currentUserId: string;
  isInGroup?: boolean;
  senderName:string | null | undefined;
};

export default function MessageItem({
  message,
  currentUserId,
  isInGroup = false,
  senderName:string
}: Props) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const attachments = message.attachments ?? [];
  const docs = message.documentsContainer ?? [];
  const lightboxImages = attachments.map((att) => ({ uri: att.uri }));

  // Only show up to 4 in the grid:
  const gridImages = attachments.slice(0, 4);
  const extraCount = attachments.length - 4;

  // Size each thumbnail to half the bubble width:
  const bubbleWidth = Dimensions.get("window").width * 0.5; 
  const thumbSize = (bubbleWidth - 12 /* padding */ - 8 /* gaps */) / 2;

  // Render one grid cell:
  const renderThumb = ({ item, index }: { item: { uri: string }; index: number }) => {
    const isOverflow = index === 3 && extraCount > 0;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.thumbWrapper, { width: thumbSize, height: thumbSize }]}
        onPress={() => {
          console.log("Tapped index", index);
          setStartIndex(index);
          setViewerVisible(true);
        }}
      >
    
          <Image
       source={{ uri: item.uri }}
       style={styles.thumb}
       resizeMode="cover"
     />
        {isOverflow && (
          <View style={styles.overlay}>
            <Text style={styles.moreText}>+{extraCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.row,
        {
          flexDirection:
            message.senderId === currentUserId ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor:
              message.senderId === currentUserId ? "#A4DDED" : "#fff",
          },
        ]}
      >
        {isInGroup && message.senderId !== currentUserId && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {/* IMAGE GRID or Single Image */}
        {attachments.length > 1 ? (
          <FlatList
            data={gridImages}
            renderItem={renderThumb}
            keyExtractor={(_, i) => String(i)}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
          />
        ) : attachments.length === 1 ? (
          // <FastImage
          //   source={{ uri: attachments[0].uri, priority: FastImage.priority.high }}
          //   style={[styles.singleImage, { width: bubbleWidth * 0.6, height: bubbleWidth * 0.6 }]}
          // />

  //        <Image
  //    source={{ uri: attachments[0].uri }}
  //    style={[styles.singleImage, { width: bubbleWidth*0.6, height: bubbleWidth*0.6 }]}
  //    resizeMode="cover"
  //  />

   <TouchableOpacity
   activeOpacity={0.8}
   onPress={() => {
     setStartIndex(0);
     setViewerVisible(true);
   }}
 >
   <Image
     source={{ uri: attachments[0].uri }}
     style={[styles.singleImage, { width: bubbleWidth*0.6, height: bubbleWidth*0.6 }]}
     resizeMode="cover"
   />
 </TouchableOpacity>
        ) : null}

        {docs.length > 0 && (
          <View style={styles.docContainer}>
            <Image
              source={require("../../assets/images/fileIconBg.png")}
              style={styles.docIcon}
              resizeMode="contain"
            />
            <Text style={styles.docName} numberOfLines={1} ellipsizeMode="tail">
              {docs[0].fileName}
            </Text>
          </View>
        )}

        {message.message && (
          <Text
            style={[
              styles.text,
              {
                color:
                  message.senderId === currentUserId ? "#000" : "#737373",
              },
            ]}
          >
            {message.message}
          </Text>
        )}

        <Text
          style={[
            styles.time,
            {
              color:
                message.senderId === currentUserId ? "#888" : "#666",
            },
          ]}
        >
          {formatTimestampTo12Hour(Number(message.timeStamp))}
        </Text>
      </View>

      {/* Place this at the root so it always mounts */}
      <ImageView
        images={lightboxImages}
        imageIndex={startIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
    marginHorizontal: 10,
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  senderName: {
    color: "#83b1be",
    paddingBottom: 4,
  },
  grid: {
    justifyContent: "space-between",
    marginVertical: hp(1),
  },
  thumbWrapper: {
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumb: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  singleImage: {
    borderRadius: 10,
    marginVertical: hp(1),
    backgroundColor: "#eee",
  },
  docContainer: {
    height: hp(15),
    width: hp(20),
    borderRadius: 10,
    marginVertical: hp(0.5),
    alignItems: "center",
  },
  docIcon: {
    height: hp(12),
    width: hp(12),
    borderRadius: 100,
  },
  docName: {
    fontSize: hp(1.5),
    flexShrink: 1,
    paddingTop: 4,
  },
  text: {
    fontSize: hp(1.9),
    marginTop: hp(0.5),
  },
  time: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: hp(0.5),
  },
});
