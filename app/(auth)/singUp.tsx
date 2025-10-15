import CustomHeader from "@/components/shared/CustomHeader";
import {
  UserCredRedInitStateType,
  UserLocationRedInitalStateType
} from "@/utils/types";
import { Feather } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  getAuth
} from "@react-native-firebase/auth";
import {
  getDatabase,
  ref,
  set
} from "@react-native-firebase/database";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

const singUp = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const auth = getAuth();
  const db = getDatabase();
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const { otpCode, verificationID } = useSelector(
    (state: { userCredReducer: UserCredRedInitStateType }) =>
      state.userCredReducer
  );
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [isPasswordHide, setIsPasswordHide] = useState(true);
  const { address, location } = useSelector(
    (state: { userCurrentLocationReducer: UserLocationRedInitalStateType }) =>
      state.userCurrentLocationReducer
  );

  const handleSignUp = async () => {
    // 1️⃣ Front‑end validation
    if (!userName) {
      setNameError("Please add a valid name before proceeding");
      return;
    }
    if (!userEmail) {
      setEmailError("Please add a valid email before proceeding");
      return;
    }
    if (!password) {
      setPasswordError("Please add a password before proceeding");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    // 3️⃣ If not found → create a new account
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        password
      );
      // 4️⃣ Write your new user record to Realtime Database
      await set(ref(db, `users/${userCred.user.uid}`), {
        name: userName,
        email: userEmail,
        phoneNumber: null,
        role: "0",
        createdAt: Date.now(),
        locationDetails: {
          location,
          address,
        },
        providers: ["email"],
        uid: userCred?.user?.uid,
        image:userCred?.user?.photoURL
      });
      router.replace("/mobileLink");
    } catch (createErr: any) {
      console.error("Error creating user:", createErr);
      if (createErr.code === "auth/weak-password") {
        setPasswordError("Password should be at least 6 characters");
      } else if (createErr.code === "auth/email-already-in-use") {
        setEmailError("This email is already in use");
        Toast.show({
          type: "error",
          text1: "This email is already in use",
          text2: "Please login with email",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Signup failed",
          text2: createErr.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={hp(10)}
        style={{ flex: 1, marginBottom: hp(1) }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <StatusBar style="dark" />
         <View
            style={{
              backgroundColor: "#f5f5f5",
              flex: 1,
              paddingTop: hp(8),
              paddingHorizontal: wp(8),
              gap: 15,
              paddingBottom: hp(10),
            }}
          >
            <TouchableOpacity onPress={()=>router.back()} style = {{}}>

            <Text style ={{
              color:'#0c58ce',
              fontSize:hp(2.2),
              fontWeight:"bold"

            }}>Login</Text>     
            </TouchableOpacity>
     
            {/* -----------Linkage image------------ */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Image
                source={require("../../assets/images/loginPageImagebg.png")}
                style={{
                  width: wp(60),
                  aspectRatio: 1,
                  objectFit: "contain",
                }}
                resizeMode="contain"
              />
            </View>

            <View style={{ gap: 20, marginTop: hp(5) }}>
              {/* ----------------------- sign in title */}
              <Text
                style={{
                  fontSize: hp(3),
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Create your Account
              </Text>
              {/* -------------------- name input + Error-------------------- */}

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
                  <Feather name="user" size={24} color="gray" />
                  <TextInput
                    placeholder="Enter name"
                    value={userName}
                    onChangeText={(text) => {
                      // Hide the Error Message when user start typing....
                      setNameError("");
                      setUserName(text);
                    }}
                    style={{
                      fontSize: hp(2.2),
                      flex: 1,
                      marginRight: 5,
                      color: "gray",
                    }}
                  />
                </View>
                {nameError && (
                  <View>
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: "red",
                        fontWeight: "700",
                      }}
                    >
                      {nameError}
                    </Text>
                  </View>
                )}
              </View>

              {/* -------------------- Email input + Error-------------------- */}
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
                  <Feather name="mail" size={24} color="gray" />
                  <TextInput
                    placeholder="Enter email"
                    keyboardType="email-address"
                    value={userEmail}
                    onChangeText={(mail) => {
                      setUserEmail(mail);
                      // Hide the error message when user starts typing.....
                      setEmailError("");
                    }}
                    style={{
                      fontSize: hp(2.2),
                      flex: 1,
                      marginRight: 5,
                      color: "gray",
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {emailError && (
                  <View>
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: "red",
                        fontWeight: "700",
                      }}
                    >
                      {emailError}
                    </Text>
                  </View>
                )}
              </View>

              {/* -------------------- Password inpu + Errort-------------------- */}

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
                  <Feather name="lock" size={24} color="black" />
                  <TextInput
                    placeholder="Enter password"
                    value={password}
                    secureTextEntry={isPasswordHide} // To handle the type of input - password to text
                    textContentType="password"
                    onChangeText={(pass) => {
                      setPassword(pass);
                      // Hide the error message when user starts typing.....
                      setPasswordError("");
                    }}
                    style={{
                      fontSize: hp(2.2),
                      flex: 1,
                      marginRight: 5,
                      color: "gray",
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Feather
                    name={isPasswordHide ? "eye-off" : "eye"}
                    size={24}
                    color="black"
                    onPress={() => setIsPasswordHide((pre) => !pre)}
                  />
                </View>
                {passwordError && (
                  <View>
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: "red",
                        fontWeight: "700",
                      }}
                    >
                      {passwordError}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* --------------------------sign up button  with Email and password Method------------------*/}

            <TouchableOpacity
              onPress={handleSignUp}
              // disabled = {!phoneNumberValid}
              style={{
                // height: hp(7),
                paddingVertical: hp(1.5),
                backgroundColor: "#fa7e29",
                borderRadius: 10,
                marginTop: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                paddingHorizontal: hp(1.5),
              }}
            >
              {loading ? (
                <Feather name="loader" size={24} color="white" />
              ) : (
                <Text
                  style={{
                    fontSize: hp(1.8),
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {"Sign up"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
};

export default singUp;

const styles = StyleSheet.create({});
