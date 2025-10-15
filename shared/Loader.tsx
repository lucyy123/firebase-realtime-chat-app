import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

type Props ={
    loaderColor?:string
}

const LottieLoader = ({loaderColor="#f5f5f5"}:Props) => {
  return (
      <LottieView
        source={require("../assets/animations/loader.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: 150,
    height: 150,
    color:'#f5f5f5',
  },
});

export default LottieLoader;
