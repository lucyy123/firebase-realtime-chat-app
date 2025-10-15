import { safeFirebaseUrl } from "@/utils/common";
import { AuthUserType, GroupSelectedMemberInitType, UserReducerInitStateType } from "@/utils/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getDatabase,
  push,
  ref,
  update,
} from "@react-native-firebase/database";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const CELL_SIZE = SCREEN_WIDTH / NUM_COLUMNS;

const CreateNewGroup = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const { selectedMembers } = useLocalSearchParams<{
    selectedMembers?: string;
  }>();
  // --------------------------- Current logged user--------------------------------
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer
  );
  const {members} = useSelector((state:{groupSelectedMemberReducer:GroupSelectedMemberInitType})=>state.groupSelectedMemberReducer)
  console.log('members:', members)
  const db = getDatabase();

  //  memoize the parsed array (so we don’t JSON.parse on every render)
  const membersArray: AuthUserType[] = useMemo(() => {
    if (!selectedMembers) return [];
    try {
      return JSON.parse(selectedMembers);
    } catch {
      console.warn("Could not parse selectedMembers:", selectedMembers);
      return [];
    }
  }, [selectedMembers]);

  console.log("selectedMembers:", selectedMembers);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageName(`${Date.now()}+${result?.assets[0].fileName as string}`);
    }
  };

  const handleCreateNewGroup = async () => {
    const ts = Date.now();

    setLoading(true);
    try {
      // 1️⃣ Reserve a new group ID
      const groupRef = push(ref(db, "groups"));
      const groupId = groupRef.key!;
      const membersMap: Record<string, true> = {};
      membersArray.forEach((m) => {
        if (m?.uid) {
          membersMap[m.uid] = true;
        }
      });
      if (user?.uid) {
        membersMap[user.uid] = true;
      }

      const membersDetails = membersArray.map((selectedMember) => ({
        name: selectedMember?.name,
        image: selectedMember?.image,
        uid: selectedMember?.uid,
        expoTokens: selectedMember?.expoTokens || "",
      }));

      membersDetails.push({
        name: user?.name,
        image: user?.image,
        uid: user?.uid,
        expoTokens: user?.expoTokens || "",
      });

      // 3️⃣ Build your initial “system” message
      const initialMsgRef = push(ref(db, `groups/${groupId}/messages`));
      const initialMsgId = initialMsgRef.key!;
      const initialMessage = {
        senderId: user?.uid,
        senderName: user?.name || "System",
        message: `${user?.name || "Someone"} created the group`,
        timeStamp: ts,
        type: "system",
      };

      const groupData = {
        name: groupName, // your state
        image: image || null, // your state, or null
        createdBy: user?.uid,
        createdAt: ts,
        members: membersMap,
        membersDetails,
        metadata: {
          lastMessage: initialMessage.message,
          lastMessageTime: ts,
          lastMessageSenderId: initialMessage.senderId,
        },
        messages: {
          [initialMsgId]: initialMessage,
        },
      };

      // Multi-path update: write under /groups and index under /userGroups
      const updates: Record<string, any> = {
        [`groups/${groupId}`]: groupData,
        [`userGroups/${user?.uid}/${groupId}`]: true,
      };

      membersArray.forEach((m) => {
        updates[`userGroups/${m.uid}/${groupId}`] = true;
      });
      await update(ref(db), updates);
      console.log("Group created successfully:", groupId);
      Toast.show({
        type: "success",
        text1: "Group created successfully",
      });
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
      router.push("/(tabs)/groups"); /// when group created successfully then navigate to groups page [groups chat room]
    }
  };

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            //   backgroundColor: "#f5f5f5",
            flex: 1,
            paddingTop: hp(3),
            paddingHorizontal: wp(8),
            gap: 15,
            paddingBottom: hp(10),
          }}
        >
          {/* ------------------ User Image + uploding image  */}
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              // backgroundColor:"red",
              // padding: hp(1),
            }}
          >
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                // backgroundColor:"blue",
                padding: hp(1),
                height: hp(19),
                width: hp(19),
                borderRadius: 100,
                borderWidth: hp(0.8),
                borderColor: "#e2e2e2",
                position: "relative",
              }}
            >
              <Image
                source={{
                  uri:
                    image ||
                    "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FphoneNumber.jpg?alt=media&token=610c23e9-2dc6-4c55-8c96-e6f00da6a46d",
                }}
                style={{
                  height: hp(16),
                  width: hp(16),
                  borderRadius: 100,
                }}
              />
              {/* -------------------Icon for image change or update */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: "2%",
                  right: "1%",
                  backgroundColor: "#fff",
                  height: wp(8),
                  width: wp(8),
                  alignItems: "center",
                  borderRadius: 100,
                  display: "flex",
                  justifyContent: "center",
                }}
                onPress={pickImage}
              >
                <Feather name="camera" size={wp(5)} color="#B2BEB5" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 20 }}>
            {/* -------------------- Group Name -------------------- */}

            <View>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "row",
                  gap: 10,
                  paddingInline: wp(5),
                  height: hp(7),
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={24}
                  color={"#B2BEB5"}
                />
                <TextInput
                  placeholder="Group name"
                  value={groupName}
                  onChangeText={(name) => {
                    setGroupName(name);
                  }}
                  style={{
                    fontSize: hp(2.2),
                    flex: 1,
                    marginRight: 5,
                    color: "gray",
                  }}
                />
              </View>
            </View>

            {/* -------------------- Selected Members -------------------- */}
            <View style={{ height: hp(40) }}>
              <FlatList
                data={members}
                keyExtractor={(u) => u?.uid as string}
                numColumns={4}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cell}
                    // onPress={() => onAvatarPress(item)}
                    activeOpacity={0.7}
                  >
                    <FastImage
                      source={{
                        uri:safeFirebaseUrl(item?.image)
                          ? item?.image
                          : "https://firebasestorage.googleapis.com/v0/b/handydash-75858.appspot.com/o/profile_pics%2FphoneNumber.jpg?alt=media&token=610c23e9-2dc6-4c55-8c96-e6f00da6a46d",
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                      }}
                      style={{
                        flex: 1, // fill the square
                        borderRadius: 100,
                        borderWidth: 1,
                        borderColor: "#fff",
                        // backgroundColor: "#fddd",
                      }}
                      fallback
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </View>

            <View style={styles.gridContainer}></View>
          </View>

          {/* --------------------------Save changes button */}

          <TouchableOpacity
            onPress={handleCreateNewGroup}
            style={{
              height: hp(7),
              borderRadius: 10,
              marginTop: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fa7e29",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#f5f5f5" />
            ) : (
              <Text
                style={{
                  fontSize: hp(2.5),
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CreateNewGroup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
  list: {
    paddingVertical: 8,
  },

  screen: {
    flex: 1,
  },
  gridContainer: {
    flex: 1, // takes all space above the button
  },
  listContent: {
    padding: 8,
  },
  cell: {
    flex: 1, // each cell equally divides the row
    aspectRatio: 1, // makes it a square
    margin: 4, // gutter between cells
    flexBasis: "22%",
    flexGrow: 0,
    flexShrink: 0,
  },
  avatar: {
    flex: 1, // fill the square
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#fff",
    // backgroundColor: "#fddd",
  },
  footerButton: {
    padding: 16,
    backgroundColor: "#0077e4",
    alignItems: "center",
  },
  footerButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
