import { OTPInput } from "@/components/authenticationUtils/OTPInputs";
import { setUserCred } from "@/redux/reducers/userCredSlice";
import { UserLocationRedInitalStateType } from "@/utils/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  FirebaseAuthTypes,
  getAuth,
  linkWithCredential,
  PhoneAuthProvider,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { getDatabase, ref, update } from "@react-native-firebase/database";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";

export default function MobileLike() {
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [isShowOTPInput, setIsShowOTPInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const auth = getAuth();
  const db = getDatabase();
  const router = useRouter();
  const [phoneNumberInvalidError, setPhoneNumberInvalidError] =
    useState<string>();
  const [phoneNumberLengthError, setPhoneNumberLengthError] =
    useState<string>();
  const [otpValueError, setOtpValueError] = useState<string>();
  const [otpsentStatusError, setOtpsentStatusError] = useState<string>();
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [attempts, setAttempts] = useState(3); // Maximum three attempts allowed
  const [attemptsWarning, setAttemptsWarning] = useState<string>();
  const { address, location } = useSelector(
    (state: { userCurrentLocationReducer: UserLocationRedInitalStateType }) =>
      state.userCurrentLocationReducer
  );
  const dispatch = useDispatch();

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setPhoneNumberLengthError(
        "Please add a valid phone number before proceeding"
      );
      return;
    }

    if (phoneNumber.length < 10 || phoneNumber.length > 10) {
      setPhoneNumberLengthError("Phone number should be 10 digits");
      return;
    }
    try {
      setLoading(true);
      const newPhoneNumber = phoneNumber?.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber?.trim()}`;
      if (!/^\+?[1-9]\d{1,14}$/.test(newPhoneNumber)) {
        setPhoneNumberInvalidError("Invalid phone number");
        // Alert.alert("Invalid phone number format.");
        return;
      }
      console.log("Sending OTP to phone number:", newPhoneNumber);
      //  sign out before a new flow
      // await signOut(auth)
      const confirmation = await signInWithPhoneNumber(auth, newPhoneNumber);
      console.log("confirmation:", confirmation);
      setConfirm(confirmation);
      setIsShowOTPInput(true);
      setOtpsentStatusError(
        `We have sent OTP code verification to your mobile number `
      );
      if (attempts <= 0) {
        Toast.show({
          type: "success",
          text1: `OTP re-sent to your mobile number`,
          text2: phoneNumber,
        });

        // Reset the attempts and attempts warning
        setAttempts(3);
        setAttemptsWarning("");
      }
      // Alert.alert("SMS sent");
    } catch (error: any) {
      console.log("error sending OTP:", error);
      console.log("error.message:", error?.message);
      console.log("error.code:", error?.code);
      if (error?.code === "auth/invalid-phone-number") {
        console.log("Invalid phone number");
        setPhoneNumberInvalidError("Enter a valid phone number");
      } else if (error?.code === "auth/unknown") {
        setPhoneNumberInvalidError("Something went wrong please try again");
      } else if (error?.code === "auth/too-many-requests") {
        Toast.show({
          type: "error",
          text1: "Too many requests ,Try again later",
          text2: "Or use different phone number",
        });
        setPhoneNumber("");
      } else {
        Toast.show({
          type: "error",
          text2: error?.code,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otpValues.join("");
    if (!otpValue) {
      setPhoneNumberLengthError("Please add a valid OTP before proceeding");
      return;
    }

    if (!confirm || !otpValue) {
      setOtpValueError("Please enter valid OTP");
      return;
    }

    if (otpValue.length < 6 || otpValue.length > 6) {
      setOtpValueError("OTP should be 6 digits");
      return;
    }

    try {
      setLoading(true);
      const phoneCredential = PhoneAuthProvider.credential(
        confirm.verificationId,
        otpValue
      );

      // 3️⃣ Link onto the already‑signed‑in user (Email or Google)
      const user = auth.currentUser!;
      await linkWithCredential(user, phoneCredential);

      await update(ref(db, `users/${user.uid}`), {
        phoneNumber: phoneNumber,
        // gather all linked providers (e.g. ['google.com','phone'])
        providers: [user.providerData.map((p) => p.providerId), "phone"],
        updatedAt: Date.now(),
        locationDetails: { location, address },
      });
      Toast.show({
        type: "success",
        text1: "Phone number linked!",
      });
      router.replace("/(tabs)/homeChat");
    } catch (error: any) {
      console.error("OTP verification failed:", error?.code, error?.message);
      if (error?.code === "auth/invalid-verification-code") {
        // Every time when user entered the wrong otp value - Attempt increases by one
        setAttempts((pre) => pre - 1);
        if (attempts - 1 > 0) {
          setOtpValueError(`Invalid OTP, Please try again`);
        }
        setAttemptsWarning(`Attempts remaining - ${attempts - 1}`);
      } else if (
        error?.code === "auth/session-expired" ||
        error?.code === "auth/code-expired"
      ) {
        setOtpsentStatusError("OTP expired—please resend.");
        dispatch(setUserCred({ otpCode: null, verificationID: null }));
      } else if (error?.code === "auth/credential-already-in-use") {
        Toast.show({
          type: "info",
          text1: "This phone is already linked to another account.",
        });
      } else {
        setOtpValueError("Something went wrong please try again");

        Toast.show({
          type: "error",
          text1: "Could not link phone",
          text2: error.message,
        });
      }
    } finally {
      setLoading(false);
      setOtpValues([]);
    }
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={hp(10)}
      style={{ flex: 1, marginBottom: hp(1) }}
    >
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <View
          style={{
            // backgroundColor: "#f5f5f5",
            flex: 1,
            paddingTop: hp(10),
            paddingHorizontal: wp(8),
            gap: 15,
            paddingBottom: hp(10),
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{}}>
            <Text
              style={{
                color: "#0c58ce",
                fontSize: hp(2.2),
                fontWeight: "bold",
              }}
            >
              Login
            </Text>
          </TouchableOpacity>

          {/* -----------login image------------ */}
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Image
              source={require("../../assets/images/linkageImage.png")}
              style={{
                width: wp(40),
                aspectRatio: 1,
                objectFit: "contain",
              }}
              resizeMode="contain"
            />
          </View>

          <View style={{ gap: 35 }}>
            {/* ----------------------- log in title */}
            <Text
              style={{
                fontSize: hp(4),
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {isShowOTPInput ? "Verification Code" : "Login Account"}
            </Text>

            {/* --------------------OTP sent success message-------------- */}
            {isShowOTPInput && otpsentStatusError && (
              <View
                style={{
                  // backgroundColor: "#88EFD0",
                  padding: hp(1),
                  borderRadius: 10,
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: hp(2),
                      color: "#B2BEB5",
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {otpsentStatusError}
                  </Text>
                </View>

                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: hp(2),
                      color: "#00000",
                      fontWeight: "900",
                    }}
                  >
                    {" "}
                    {phoneNumber}
                  </Text>
                  <MaterialCommunityIcons
                    name="pencil-circle"
                    size={wp(5)}
                    color="red"
                    onPress={() => {
                      // Hide phone and otp errors
                      setOtpValueError("");
                      setOtpsentStatusError("");
                      setPhoneNumberInvalidError("");
                      setPhoneNumberLengthError("");
                      setIsShowOTPInput((prev) => !prev);
                    }}
                  />
                </View>
              </View>
            )}

            {/* --------------------  inputs-------------------- */}
            {isShowOTPInput ? (
              <OTPInput
                otpValues={otpValues}
                setOtpValues={setOtpValues}
                setOtpValueError={setOtpValueError}
                setPhoneNumberLengthError={setPhoneNumberLengthError}
              />
            ) : (
              // <View
              //   style={{
              //     backgroundColor: "#fff",
              //     borderRadius: 10,
              //     flexDirection: "row",
              //     gap: 10,
              //     paddingHorizontal: wp(5),
              //     height: hp(7),
              //     alignItems: "center",
              //   }}
              // >
              //   <Ionicons name="keypad-outline" size={24} color="black" />
              //   <TextInput
              //     placeholder="Enter OTP"
              //     value={otpValue}
              //     keyboardType="number-pad"
              //     onChangeText={(otp) => {
              //       // Hide OTP error when user starts typing
              //       setOtpValueError("");
              //       setOtpValue(otp);
              //     }}
              //     style={{
              //       fontSize: hp(2.2),
              //       flex: 1,
              //       marginRight: 5,
              //       color: "gray",
              //     }}
              //   />
              // </View>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  flexDirection: "row",
                  gap: 10,
                  paddingHorizontal: wp(5),
                  height: hp(7),
                  alignItems: "center",
                }}
              >
                <Feather name="phone" size={24} color="gray" />
                <TextInput
                  placeholder="Enter phone number"
                  keyboardType="number-pad"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    // Hide errors when user starts typing
                    setPhoneNumberLengthError("");
                    setPhoneNumberInvalidError("");
                    setPhoneNumber(text);
                  }}
                  style={{
                    fontSize: hp(2.2),
                    flex: 1,
                    marginRight: 5,
                    color: "gray",
                  }}
                />
              </View>
            )}
          </View>

          <View>
            {phoneNumberLengthError && (
              <Text
                style={{
                  fontSize: hp(2),
                  color: "red",
                  fontWeight: "700",
                }}
              >
                {phoneNumberLengthError}
              </Text>
            )}

            {phoneNumberInvalidError && (
              <Text
                style={{
                  fontSize: hp(2),
                  color: "red",
                  fontWeight: "700",
                }}
              >
                {phoneNumberInvalidError}
              </Text>
            )}

            {otpValueError && (
              <Text
                style={{
                  fontSize: hp(2),
                  color: "red",
                  fontWeight: "700",
                }}
              >
                {otpValueError}
              </Text>
            )}

            {attemptsWarning && attempts > 0 && (
              <Text
                style={{
                  fontSize: hp(2),
                  marginTop: 1,
                  color: "red",
                  fontWeight: "700",
                }}
              >
                {attemptsWarning}
              </Text>
            )}
            {attemptsWarning && attempts <= 0 && (
              <>
                <Text
                  style={{
                    fontSize: hp(2),
                    marginTop: 1,
                    color: "red",
                    fontWeight: "700",
                    width: "100%",
                  }}
                >
                  OTP attempts exceeded. Please request a new code.
                </Text>
                <Text
                  onPress={handleSendOtp}
                  style={{
                    fontSize: hp(2),
                    marginTop: 2,
                    color: "#0c5ec8",
                    fontWeight: "700",
                    alignSelf: "flex-end",
                  }}
                >
                  Resend OTP
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={isShowOTPInput ? handleVerifyOtp : handleSendOtp}
            style={{
              height: hp(7),
              backgroundColor: "#fa7e29",
              borderRadius: 10,
              marginTop: 15,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            {loading ? (
              <ActivityIndicator size={"small"} color={"#f5f5f5"} />
            ) : (
              <Text
                style={{
                  fontSize: hp(2.5),
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {isShowOTPInput ? "Submit" : "Request OTP"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
