import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { getDatabase, ref } from '@react-native-firebase/database'
import { getAuth } from '@react-native-firebase/auth'

const GroupDetails = () => {



  return (

    <View style={{
      flex:1,
      justifyContent:"center",
      display:"flex",
      alignItems:"center"
    }}>
      <Text>GroupDetails</Text>


    </View>
  )
}

export default GroupDetails

const styles = StyleSheet.create({})