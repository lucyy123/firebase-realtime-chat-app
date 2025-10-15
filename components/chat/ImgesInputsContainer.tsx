import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { ImagesAndDocumentsContainerInterface } from "@/utils/types";

type Props = {
  handleImageRemove: (id: string) => void;
  dataToshow: ImagesAndDocumentsContainerInterface[] | null;
  isImages: boolean;
};

const ImgesInputsContainer = ({
  handleImageRemove,
  dataToshow,
  isImages,
}: Props) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 3,
        // marginRight:hp(2)
      }}
    >
      <FlatList
        data={dataToshow || []}
        horizontal={true}
        keyExtractor={(image) => `${image?.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          gap: hp(2),
          paddingRight: hp(1),
        }}
        renderItem={({ item, index }) => (
          <View
            style={{
              //  flex:1,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row",
              // backgroundColor: "black",
              paddingHorizontal: hp(0.5),
              marginVertical: hp(1.5),
            }}
          >
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                padding: hp(1),
                height: hp(8),
                width:hp(8),
                borderRadius: 10,
                borderWidth: hp(0.1),
                borderColor: "#B2BEB5",
                position: "relative",
              }}
            >
              {isImages ? (
                <Image
                  source={{ uri: item?.uri }}
                  // source={require("../../assets/images/userImage.jpg")}
                  style={{
                    height: hp(8),
                    width: hp(8),
                    borderRadius: 10,
                  }}
                />
              ) : (
                <View
                  style={{
                    // height: hp(8),
                    // width: hp(10),
                    borderRadius: 10,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: hp(1.5),
                      fontWeight: "600",
                    }}
                  >
                    {item?.name}
                  </Text>
                </View>
              )}
              {/* -------------------Remove image or Delete image icon---------------------------- */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: "-20%",
                  right: "-20%",
                  // height: hp(8),
                  // width: hp(8),
                  alignItems: "center",
                  // borderRadius: 100,
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "#ff4444",
                  borderRadius: 10,
                }}
                onPress={() => handleImageRemove(item.id)}
              >
                <MaterialIcons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ImgesInputsContainer;

const styles = StyleSheet.create({});

/**
 *  <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 3,
                  }}
                >
                  <FlatList
                    data={galleryImages || []}
                    horizontal={true}
                    keyExtractor={(image) => `${image?.id}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      flexGrow: 1,
                      gap: hp(2),
                      paddingRight: hp(1),
                    }}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          //  flex:1,
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          flexDirection: "row",
                          // backgroundColor: "black",
                          paddingHorizontal: hp(0.5),
                          marginVertical: hp(1.5),
                        }}
                      >
                        <View
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            padding: hp(1),
                            height: hp(8),
                            width: hp(8),
                            borderRadius: 10,
                            borderWidth: hp(0.8),
                            borderColor: "#B2BEB5",
                            position: "relative",
                          }}
                        >
                          <Image
                            source={{ uri: item?.uri }}
                            // source={require("../../assets/images/userImage.jpg")}
                            style={{
                              height: hp(8),
                              width: hp(8),
                              borderRadius: 10,
                            }}
                          />
                          {/* -------------------Remove image or Delete image icon---------------------------- */
//           <TouchableOpacity
//             style={{
//               position: "absolute",
//               top: "-50%",
//               right: "-50%",
//               // height: hp(8),
//               // width: hp(8),
//               alignItems: "center",
//               // borderRadius: 100,
//               display: "flex",
//               justifyContent: "center",
//               backgroundColor: "#ff4444",
//               borderRadius: 10,
//             }}
//             onPress={() => handleImageRemove(item.id)}
//           >
//             <MaterialIcons
//               name="close"
//               size={16}
//               color="white"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     )}
//   />
// </View>
