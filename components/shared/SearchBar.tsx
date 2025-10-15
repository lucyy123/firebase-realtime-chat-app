import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { Dispatch } from 'react'
import { Feather } from '@expo/vector-icons';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from "react-native-responsive-screen";


type Props ={
    searchQuery:string | undefined
    setSearchQuery:Dispatch<React.SetStateAction<string |undefined>>;
    placeholder?:string | 'Search or start a new chat'
}

const CustomeSearchBar = ({searchQuery,setSearchQuery,placeholder}:Props) => {
  return (
    <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 100,
      display: "flex",
      flexDirection: "row",
      gap: 10,
      paddingInline: wp(5),
      height: hp(7),
      alignItems: "center",
      margin:hp(1)
    }}
  >
   <Feather name="search" size={24} color="black" />
    <TextInput
      placeholder={placeholder || "Search or start a new chat"}
      value={searchQuery}
      onChangeText={(searchValue) => {
        setSearchQuery(searchValue)
      }}
      style={{
        fontSize: hp(2.2),
        flex: 1,
        marginRight: 5,
        color: "gray",
      }}
    />
  </View>
  )
}

export default CustomeSearchBar

const styles = StyleSheet.create({})