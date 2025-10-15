import { filesTransferOptions } from "@/utils/common";
import { ImagesAndDocumentsContainerInterface } from "@/utils/types";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from "expo-image-picker";
import React, { Dispatch, RefObject } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";


type Props = {
  actionSheetRef: RefObject<ActionSheetRef>;
  setGalleryImages: Dispatch<React.SetStateAction<ImagesAndDocumentsContainerInterface[] | null>>;
  setIsMicShow:Dispatch<React.SetStateAction<boolean>>;
  setDocuments:Dispatch<React.SetStateAction<ImagesAndDocumentsContainerInterface[] | null>>
  setShowCamera:Dispatch<React.SetStateAction<boolean>>
};

const FileTransferBottomSheet = ({
  actionSheetRef,
  setGalleryImages,
  setIsMicShow,
  setDocuments,
  setShowCamera
}: Props) => {

  // ----------------------------- H A ND L E R S------------------------------------------
  const pickImageFromGallery = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });

    console.log(result);

    if (!result.canceled) {
      console.log('result.assets:', result.assets)
      const newImages = (result.assets ?? []).map((ele) => ({
        id: `${ele.fileName}-${Date.now()}`,
        uri: ele?.uri,
        name: ele?.fileName,
        fileType:ele?.mimeType
      })) as ImagesAndDocumentsContainerInterface[];
    
      setGalleryImages(prev => {
        const existingNames = new Set((prev ?? []).map(img => img.name));
        // Only keep those new images whose file name is not already in the set
        const filteredNew = newImages.filter(img => !existingNames.has(img.name));
        return [
          // preserve existing images
          ...(prev ?? []),
          // append only the non-duplicates
          ...filteredNew,
        ];
      
      });
      setIsMicShow(false)
    
    }

    actionSheetRef.current?.hide();
  };

  const handleFileOpen = (type: string) => {
    if (type === "Gallery") {
      pickImageFromGallery();
    } else if (type ==="Camera"){
        setShowCamera(true);
        actionSheetRef.current?.hide();
    }
    else if (type ==='Document'){
      pickDocuments()
    } else {
      console.log("Some different type is opening");
    }
  };




  //-----------------------------------------Documents---------------------------------

  const pickDocuments = async ()=>{
    let result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory:true,
      multiple:true,
      type:'*/*'
    })

    console.log('result.assets:', result.assets)
    if(!result.canceled) { // if document get selected or picked by user
      const newDocs = (result.assets ?? []).map((ele) => ({
        id: `${ele.name}-${Date.now()}`,
        uri: ele.uri,
        name: ele.name,
      fileType:ele?.mimeType
      })) as ImagesAndDocumentsContainerInterface[];

      setDocuments(prev => {
        const existingNames = new Set((prev ?? []).map(img => img.name));
        // Only keep those new images whose file name is not already in the set
        const filteredNew = newDocs.filter(img => !existingNames.has(img.name));
        return [
          // preserve existing images
          ...(prev ?? []),
          // append only the non-duplicates
          ...filteredNew,
        ];
      
      });
      setIsMicShow(false)

  
    }           
    actionSheetRef.current?.hide();

  }


  return (
    <View>
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled={true} // allow dragging
        snapPoints={[hp(30)]} // draggable snap at half screen
        initialSnapIndex={0} // start at the first snap point
        indicatorStyle={styles.indicator} // styling for drag-handle
        headerAlwaysVisible={true}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            padding: hp(2.6),
            justifyContent: "space-between",
            //  flex:1
          }}
        >
          {filesTransferOptions?.map((ele) => {
            const ICON = ele.Icon;

            return (
              <View
                key={`${ele.iconName}`}
                style={{
                  display: "flex",
                  //   flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: "black",
                    padding: hp(2.3),
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: hp(1.3),
                    width: wp(20),
                  }}
                  onPress={() => handleFileOpen(ele.title)}
                  activeOpacity={0.7}
                >
                  <ICON
                    name={ele.iconName as any}
                    color="black"
                    size={hp(2.7)}
                  />
                  {/* // for as of now type = any */}
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: hp(2.0),
                    fontWeight: "700",
                    marginTop: 1,
                  }}
                >
                  {" "}
                  {ele.title}
                </Text>
              </View>
            );
          })}
        </View>
      </ActionSheet>
    </View>
  );
};

export default FileTransferBottomSheet;

const styles = StyleSheet.create({
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 8,
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
    // backgroundColor: "#fddd",
  },
});
