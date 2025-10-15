import ChatRoomCustomHeader from "@/components/chat/ChatRoomCustomHeader";
import ImgesInputsContainer from "@/components/chat/ImgesInputsContainer";
import MessageList from "@/components/homeUtils/MessageList";
import CameraComponent from "@/components/shared/CameraOpening";
import { getConversationId, uploadImageToFirebase } from "@/utils/common";
import { sendExpoPush } from "@/utils/registerForPushNotification";
import {
  AttchmentsAndDocumentsContainerChildType,
  AuthUserType,
  ImagesAndDocumentsContainerInterface,
  MessageType,
  UserReducerInitStateType,
} from "@/utils/types";
import { Feather, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getAuth } from "@react-native-firebase/auth";
import {
  getDatabase,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  runTransaction,
} from "@react-native-firebase/database";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActionSheetRef } from "react-native-actions-sheet";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import FileTransferBottomSheet from "./filesTransferBottomSheet";

const ChatRoom = () => {
  const [reciverUser, setReciverUser] = useState<AuthUserType>();
  const [currentUserProfile, setCurrentUserProfile] = useState<AuthUserType>();
  const [messages, setMessages] = useState<any[]>();
  // second user---> reciever user
  const { user: raw } = useLocalSearchParams<{ user?: string }>();
  const user = raw ? (JSON.parse(raw) as AuthUserType) : undefined;
  const inputRef = useRef<TextInput>(null);
  const [isMicShow, setIsMicShow] = useState<boolean>(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);

  // ------------------------------------------------------- Images-----------------------------------------------

  const [galleryImages, setGalleryImages] = useState<
    ImagesAndDocumentsContainerInterface[] | null
  >([]); // all images chosen from the gallery and captured from the camera too
  console.log("galleryImages:", galleryImages);
  // ------------------------------------------------------- Camera-----------------------------------------------
  const [cameraKey, setCameraKey] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  // ------------------------------------------------------- Documents-----------------------------------------------

  const [documents, setDocuments] = useState<
    ImagesAndDocumentsContainerInterface[] | null
  >([]);

  // Create a mutable ref to store the current message value
  const messageRef = useRef("");
  const { user: LoggedUser } = useSelector(
    (state: { userReducer: UserReducerInitStateType }) => state.userReducer
  );
  const db = getDatabase();
  const auth = getAuth();
  const currentLoggedUser = auth.currentUser;
  const receiverUserId = user;
  console.log("LoggedUser:", LoggedUser);
  console.log(" logged user from chatroom" + LoggedUser?.createdAt);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const ROOM_ID = getConversationId(LoggedUser, receiverUserId);
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

  //-------------------- Set receiver user's details
  useEffect(() => {
    if (!user) return;
    const newReviverUser = {
      uid: user?.uid as string,
      createdAt: Number(user?.createdAt),
      name: user?.name as string,
      phoneNumber: user?.phoneNumber as string,
      email: user?.email as string,
      image: (user?.image as string) || "",
      expoTokens: user?.expoTokens as string,
    };
    setReciverUser(newReviverUser);
    console.log("newReviverUser:", newReviverUser);
  }, []);

  //--------------Create roomId for smooth chat integration
  useEffect(() => {
    console.log("inside first useEffect", user);
    // --------------- get the logged user details
    const currentLoggedUser = auth.currentUser;
    console.log("currentLoggedUser:", currentLoggedUser);
    const userRef = ref(db, `users/${currentLoggedUser?.uid}`);
    onValue(userRef, (snapshot) => {
      setCurrentUserProfile(snapshot.val());
      console.log("snapshot.val():", snapshot.val());
    });

    // Determine chat path
    const reciverUserId = user?.uid as string;
    if (!receiverUserId) {
      console.log("No receiver Id is present");
      return;
    }
    const chatPath = `chats/${ROOM_ID}/messages`;

    // Real-time messages listener

    const messagesQuery = query(
      ref(db, chatPath),
      orderByChild("timeStamp"),
      limitToLast(50)
    );
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data
        ? Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .sort((a, b) => a.timeStamp - b.timeStamp) // Sort by timestamp
        : [];
      setMessages(loadedMessages);
      setMessagesLoading(false);
      console.log(
        `loadedMessages of the users of${currentLoggedUser?.uid}-${reciverUserId} `,
        loadedMessages
      );
    });

    return () => unsubscribe();
  }, []);

  //------------------- Reset the unread messages count for this user to ZERO
  useEffect(() => {
    const unreadRef = ref(
      db,
      `chats/${ROOM_ID}/metadata/unreadCounts/${currentLoggedUser?.uid}`
    );
    // transaction to set to zero
    runTransaction(unreadRef, () => 0);
  }, [ROOM_ID]);

  // ------------------------------------  Send message  -----------------------------
  const handleSendMessage = async () => {
    const receiverId = (user?.uid as string) || null;
    console.log("receiverId my nam is khan:", receiverId);
    const message = messageRef.current;
    console.log("message:", message);
    if (
      message.trim() === "" &&
      galleryImages &&
      galleryImages?.length <= 0 &&
      documents &&
      documents.length <= 0
    )
      return; // nothing is there to send [text - ]
    console.log("currentUserProfile:", currentUserProfile);
    console.log("user:", user);
    if (!auth.currentUser) return;

    console.log("messageRef.current:", messageRef.current);
    setSendLoading(true);
    try {
      let downloadUrls;
      let documentsDownloadURLs;
      let imagesContainer: AttchmentsAndDocumentsContainerChildType[] = [];
      let documentsContainer: AttchmentsAndDocumentsContainerChildType[] = [];
      // ------------------------------------  Check for images--------------------------------
      if (galleryImages && galleryImages?.length > 0) {
        const uploadPromises = galleryImages.map(({ uri, name }) =>
          uploadImageToFirebase(uri, name, "chat_image")
        );
        downloadUrls = await Promise.all(uploadPromises);
        imagesContainer = downloadUrls?.map((ele, index) => ({
          fileName: galleryImages[index]?.name,
          uri: ele,
          fileType: galleryImages[index]?.fileType,
        })) as AttchmentsAndDocumentsContainerChildType[];
      }

      // ------------------------------------  Check for documents--------------------------------
      if (documents && documents?.length > 0) {
        const uploadPromises = documents.map(({ uri, name }) =>
          uploadImageToFirebase(uri, name, "chat_files")
        );
        documentsDownloadURLs = await Promise.all(uploadPromises);
        documentsContainer = documentsDownloadURLs?.map((ele, index) => ({
          fileName: documents[index]?.name,
          uri: ele,
          fileType: documents[index]?.fileType,
        })) as AttchmentsAndDocumentsContainerChildType[];
      }

      const messageData: MessageType = {
        message: message,
        timeStamp: Date.now().toString(),
        senderId: currentLoggedUser?.uid as string,
        senderName: currentLoggedUser?.displayName as string,
        receiverId,
        attachments: imagesContainer || [],
        documentsContainer: documentsContainer || [],
      };
      // Clear the input
      inputRef.current?.clear();
      messageRef.current = "";
      setGalleryImages([]);
      //clear the message text
      inputRef.current?.clear();
      messageRef.current = "";
      //clear the documents
      setDocuments([]);
      setIsMicShow(true);
      // Determine the message path
      if (!receiverId) return "receiverId is null";
      const messagePath = `chats/${ROOM_ID}/messages`;
      await push(ref(db, messagePath), messageData);
      console.log("messagePath:", messagePath);

      console.log("Message sent successfully:", messageData);
      // const receiverExpoToken = reciverUser?.expoTokens;
      const receiverExpoToken = reciverUser?.expoTokens;

      // send notification to receiver's phone
      const notificationMessage =
        message === ""
          ? imagesContainer.length > 0
            ? "📷 image"
            : documentsContainer.length > 0
            ? "📂 file"
            : ""
          : message;
      await sendExpoPush(
        notificationMessage,
        receiverExpoToken,
        currentLoggedUser?.displayName!
      );

      // 3️⃣ Increment the receiver’s unread count
      const unreadForReceiverRef = ref(
        db,
        `chats/${ROOM_ID}/metadata/unreadCounts/${reciverUser?.uid}`
      );
      runTransaction(unreadForReceiverRef, (current = 0) => current + 1);
      setSendLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      //clear the images
      setGalleryImages([]);
      //clear the message text
      inputRef.current?.clear();
      messageRef.current = "";
      //clear the documents
      setDocuments([]);
      setIsMicShow(true);
      console.log("finally in send message");
    }
  };

  const handleImageRemove = (id: string) => {
    console.log("handle remove called");
    // setGalleryImage(null)

    const newImages = galleryImages?.filter((ele) => ele.id !== id);
    setGalleryImages(newImages || []);
    if (newImages && newImages?.length <= 0) {
      setIsMicShow(true);
    }
  };

  const handleDocumentRemove = (id: string) => {
    const newDocuments = documents?.filter((ele) => ele.id !== id);
    setDocuments(newDocuments || []);
    if (newDocuments && newDocuments?.length <= 0) {
      setIsMicShow(true);
    }
  };

  useEffect(() => {
    if (galleryImages && galleryImages?.length <= 0) {
      setIsMicShow(true);
    }
  }, [galleryImages?.length]);

  return (
    <>
      <View
        style={{
          flex: 1, // entire space
          // backgroundColor:"red"
        }}
      >
        {/* <StatusBar /> */}
        <ChatRoomCustomHeader receverUser={reciverUser} />
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
            {messagesLoading ? (
              <View style={{ top: hp(10) }}>
                <ActivityIndicator size={"large"} />
              </View>
            ) : (
              <MessageList
                messages={messages as MessageType[]}
                currentUserId={currentLoggedUser?.uid}
              />
            )}
          </View>
          {/* --------------------------Send message input +  file + camera + mic---------------------------------- */}

          <View style={{ marginBottom: hp(2), paddingTop: 16 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                paddingHorizontal: 6,
                // backgroundColor: "red",
                // height: 45,
              }}
            >
              {/*--------------------------- Attach file icon  button for opening the bottom sheet file transfer------------ */}

              <TouchableOpacity
                onPress={() => actionSheetRef.current?.show()}
                style={{
                  backgroundColor: "#0077e4",
                  borderRadius: 100,
                  padding: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 1,
                }}
              >
                <MaterialIcons
                  name="attach-file"
                  size={hp(2.7)}
                  color="#B2BEB5"
                />
              </TouchableOpacity>
              {/* ---------------------------------------------- Input container------------------------------------ */}
              <View style={styles.inputContainer}>
                {/* Attachment Button */}

                {/* Image Preview */}
                {/* -----------------------------Multiple image ------------------------------ */}
                {galleryImages && galleryImages?.length > 0 && (
                  <ImgesInputsContainer
                    dataToshow={galleryImages}
                    handleImageRemove={handleImageRemove}
                    isImages={true}
                  />
                )}
                {/* -----------------------------Multiple Documents ------------------------------ */}

                {documents && documents?.length > 0 && (
                  <ImgesInputsContainer
                    dataToshow={documents}
                    handleImageRemove={handleDocumentRemove}
                    isImages={false}
                  />
                )}

                {/* Text Input */}
                <TextInput
                  placeholder="Type a message"
                  placeholderTextColor="#999"
                  multiline
                  scrollEnabled
                  ref={inputRef}
                  onChangeText={(text) => {
                    messageRef.current = text;
                    setIsMicShow(false);
                    if (text === "") {
                      setIsMicShow(true);
                    }
                  }}
                  onSubmitEditing={handleSendMessage}
                  style={{
                    // flex: 1,
                    fontSize: 16,
                    color: "#333",
                    maxHeight: 100,
                    paddingHorizontal: hp(1),
                    // backgroundColor:"red",
                  }}
                />
              </View>

              {/*--------------------------- Mic Icon + Camera Icon + send button icon --------------------------------r------------ */}

              {isMicShow ? (
                <>
                  <TouchableOpacity
                    onPress={() => setShowCamera(true)}
                    style={{
                      // backgroundColor: "#A4DDED",
                      borderRadius: 100,
                      padding: 8,
                      justifyContent: "center",
                      alignItems: "center",

                      // marginLeft: 1,
                    }}
                  >
                    <Feather name="camera" size={hp(2.7)} color="#B2BEB5" />
                  </TouchableOpacity>

                  {/* <CameraOpen/> */}

                  <TouchableOpacity
                    // onPress={handleSendMessage}
                    style={{
                      backgroundColor: "#A4DDED",
                      borderRadius: 100,
                      padding: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      // marginLeft: 3,
                    }}
                  >
                    {/* --------------------------- Mic Icon  button for recording-------------- */}
                    <Ionicons
                      name="mic-outline"
                      size={hp(2.7)}
                      color="#0077e4"
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={handleSendMessage}
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

                  {sendLoading ? (
                    <ActivityIndicator size="small" color="#f5f5f5" />
                  ) : (
                    <Feather name="send" size={hp(2.7)} color={"#0077e4"} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Animated.View style={fakeView} />
        </View>
      </View>

      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <CameraComponent
          key={cameraKey}
          onImageCaptured={(uri) => {
            if (uri) {
              const newImage = {
                id: Date.now().toString(),
                uri: uri,
                name: `photo_${Date.now()}.jpg`,
                fileType: "image/jpeg",
              };
              setGalleryImages((prev) =>
                prev ? [...prev, newImage] : [newImage]
              );
              setIsMicShow(false);
            }
            setShowCamera(false);
          }}
          onClose={() => {
            setShowCamera(false);
            setCameraKey((prev) => prev + 1); // Force remount on next open
          }}
        />
      </Modal>

      <FileTransferBottomSheet
        actionSheetRef={actionSheetRef}
        setGalleryImages={setGalleryImages}
        setIsMicShow={setIsMicShow}
        setDocuments={setDocuments}
        setShowCamera={setShowCamera}
      />
    </>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  inputContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    // alignItems: 'center',
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
    padding: 8,
    // minHeight: 50,
    height: "auto",
    marginLeft: 5,
  },
  attachmentButton: {
    padding: 6,
    marginRight: 4,
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: 8,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  removeImageButton: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    padding: 2,
  },
  input: {},
  sendButton: {
    marginLeft: 8,
    padding: 6,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
});
