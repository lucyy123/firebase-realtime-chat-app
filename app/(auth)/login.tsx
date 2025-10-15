import useCurrentLocation from "@/hooks/useCurrentLocation";
import { UserLocationRedInitalStateType } from "@/utils/types";
import { Feather } from "@expo/vector-icons";
import {
  fetchSignInMethodsForEmail,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { getDatabase, ref, update } from "@react-native-firebase/database";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const auth = getAuth();
  const db = getDatabase();
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const [isPasswordHide, setIsPasswordHide] = useState(true);
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const { errorMsg, latitude, longitude } = useCurrentLocation();

  const { address, location } = useSelector(
    (state: { userCurrentLocationReducer: UserLocationRedInitalStateType }) =>
      state.userCurrentLocationReducer
  );

  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  //-------------------- Configure the google auth service
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "18967278229-ud4t7cr0tevuo8ecs6dg45vji7ic1ug8.apps.googleusercontent.com",
    });
  }, []);

  // console.log(' window.location.origin:',  window.location.origin)
  const handleSignUp = async () => {
    if (!userEmail) {
      setEmailError("Please add a valid email before proceeding");
      return;
    }

    if (!password) {
      setPasswordError("Please add a your password before proceeding");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(userEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, userEmail, password);
      const user = auth.currentUser!;
      const hasPhone = user.providerData.some((p) => p.providerId === "phone");
      if (hasPhone) {
        // already merged → go straight to Home
        router.replace("/(tabs)/homeChat");
      } else {
        // not yet merged → link phone next
        router.replace("/mobileLink");
      }
    } catch (error: any) {
      switch (error.code) {
        case "auth/invalid-email":
          Toast.show({
            type: "error",
            text1: "That email address is badly formatted.",
          });
          break;

        case "auth/user-disabled":
          Toast.show({
            type: "error",
            text1: "Your account has been disabled. Please contact support.",
          });
          break;

        case "auth/user-not-found":
          Toast.show({
            type: "error",
            text1: "No account found with this email.",
          });
          break;

        case "auth/wrong-password":
          Toast.show({
            type: "error",
            text1: "Incorrect password. Please try again.",
          });
          break;

        case "auth/too-many-requests":
          Toast.show({
            type: "error",
            text1: "Too many attempts. Please wait a moment and try again.",
          });
          break;

        case "auth/network-request-failed":
          Toast.show({
            type: "error",
            text1: "Network error—please try again.",
          });
          break;

        default:
          // Fallback for any other / new error codes
          Toast.show({
            type: "error",
            text1: "Login failed. Please try again.",
          });
          console.warn("Unhandled auth error:", error?.code, error?.message);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;
      const cred = GoogleAuthProvider.credential(idToken);
      const usercred = await signInWithCredential(auth, cred);

      // check if the user's google acount is already merged
      const user = auth.currentUser!;
      // if user is brand new
      if (usercred.additionalUserInfo?.isNewUser) {
        await update(ref(db, `users/${user.uid}`), {
          name: user?.displayName,
          email: user?.email,
          providers: ["google"],
          createdAt: Date.now(),
          uid: user?.uid,
          image: user?.photoURL,
          role: "0",
        });
      }
      // check if the user's google acount is already merged

      const hasPhone = user.providerData.some((p) => p.providerId === "phone");
      if (hasPhone) {
        // they’re already merged with Phone
        router.replace("/(tabs)/homeChat");
        return;
      }

      // otherwise, they need to link their phone now
      router.replace("/mobileLink");
    } catch (e: any) {
      switch (e.code) {
        case "auth/account-exists-with-different-credential":
          // their Google email is already taken by another provider
          const email = e.customData?.email;
          const pendingCred = GoogleAuthProvider.credentialFromError(e);
          if (email && pendingCred) {
            // find which provider they used before
            const methods = await fetchSignInMethodsForEmail(auth, email);
            Toast.show({
              type: "info",
              text1: "Account exists with " + methods.join(", "),
              text2: "Please sign in with that method first, then link Google.",
            });
            // you could navigate them to the phone or email login screen here
          }
          break;

        case "auth/network-request-failed":
          Toast.show({
            type: "error",
            text1: "Network error—please try again.",
          });
          break;

        case "auth/popup-closed-by-user":
        case "auth/cancelled-popup-request":
          // user cancelled the Google dialog
          break;

        default:
          Toast.show({ type: "error", text1: e.message });
      }
    } finally {
      setGoogleLoading(false);
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
              paddingTop: hp(12),
              paddingHorizontal: wp(8),
              gap: 15,
              paddingBottom: hp(10),
            }}
          >
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
                source={require("../../assets/images/loginLogobg.png")}
                style={{
                  width: wp(55),
                  aspectRatio: 1,
                  objectFit: "contain",
                }}
                resizeMode="contain"
              />
            </View>

            <View style={{ gap: 20 }}>
              {/* ----------------------- Sign in title------------------------------ */}
              <Text
                style={{
                  fontSize: hp(3),
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Login to your Account
              </Text>

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

            {/* --------------------------Sign up button  with Email and password Method------------------*/}

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
                  {"Continue with Email"}
                </Text>
              )}
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  borderWidth: hp(0.04),
                  flex: 1,
                  borderColor: "#B2BEB5",
                }}
              ></View>
              <Text>or</Text>
              <View
                style={{
                  borderWidth: hp(0.04),
                  flex: 1,
                  borderColor: "#B2BEB5",
                }}
              ></View>
            </View>

            {/* -------------------------- Continue with Google ------------------*/}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogle}
              activeOpacity={0.7}
            >
              {googleLoading ? (
                <Feather name="loader" size={24} color="#0077e4" />
              ) : (
                <>
                  <Image
                    source={require("../../assets/images/googleLogobg.png")}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* --------------------Dont have account singup----------------------------- */}
            <View style={{ flex: 1, marginTop: hp(1) }}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: hp(2.2),
                  color: "grey",
                }}
              >
                Don't have an account?{" "}
                <Link
                  style={{
                    color: "#0c58ce",
                    fontWeight: "bold",
                  }}
                  href={"/singUp"}
                >
                  Sign up
                </Link>
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // orange-ish
    paddingVertical: hp(1),
    paddingHorizontal: hp(1.5),
    borderRadius: 40,
    // marginTop: hp(2),
  },

  googleButtonText: {
    fontSize: hp(2.2),
    fontWeight: "500",
    color: "#000",
    marginLeft: 10,
  },

  googleIcon: {
    width: hp(4),
    height: hp(4),
  },
});
