
import { Dispatch, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

type Props = {
    otpValues:string[]
    setOtpValues:Dispatch<React.SetStateAction<string[]>>;
    setOtpValueError:Dispatch<React.SetStateAction<string | undefined>>
    setPhoneNumberLengthError:Dispatch<React.SetStateAction<string | undefined>>
    
}

export const OTPInput = ({otpValues,setOtpValues,setOtpValueError,setPhoneNumberLengthError}:Props) => {
   
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const inputsRef = useRef<Array<TextInput | null>>(Array(6).fill(null));
  
    const handleOtpChange = (text: string, index: number) => {

        // Hide the OTP error when user start typingmm
        setOtpValueError('')
        setPhoneNumberLengthError('')
      // Allow only numeric characters
      const numericText = text.replace(/[^0-9]/g, '');
      
      // Update OTP values
      const newOtpValues = [...otpValues];
      newOtpValues[index] = numericText.slice(-1); // Take only last character
      setOtpValues(newOtpValues);
  
      // Auto-focus next input if a number was entered
      if (numericText && index < 5) {
        inputsRef.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
  
      // Handle paste scenario
      if (numericText.length === 6) {
        const pastedOtp = numericText.split('');
        pastedOtp.forEach((char, i) => {
          if (i < 6) newOtpValues[i] = char;
        });
        setOtpValues([...pastedOtp.slice(0, 6)]);
        inputsRef.current[5]?.focus();
        setFocusedIndex(5);
      }
    };
  
    const handleKeyPress = ({ nativeEvent }: any, index: number) => {
          // Hide the OTP error when user start typingmm
          setOtpValueError('')
        setPhoneNumberLengthError('')

      if (nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
        // Move focus to previous input on backspace
        inputsRef.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    };
  
    const handleInputFocus = (index: number) => {
          // Hide the OTP error when user start typingmm
          setOtpValueError('')
        setPhoneNumberLengthError('')

      setFocusedIndex(index);
      // Move cursor to end when focusing
      inputsRef.current[index]?.setNativeProps({
        selection: { start: 1, end: 1 }
      });
    };
  
    return (
      <View style={styles.container}>
        {Array(6).fill(null).map((_, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={1}
            onPress={() => {
              inputsRef.current[index]?.focus();
              setFocusedIndex(index);
            }}
          >
            <TextInput
              ref={(ref) => (inputsRef.current[index] = ref)}
              style={[
                styles.input,
                focusedIndex === index && styles.focusedInput,
                index === 0 && { marginLeft: 0 }
              ]}
              keyboardType="number-pad"
              maxLength={index === 5 ? 6 : 1} // Allow paste in last input
              value={otpValues[index]}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleInputFocus(index)}
              selectTextOnFocus
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(2),
    },
    input: {
      width: wp(12),
      height: wp(12),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      backgroundColor: '#FFFFFF',
      textAlign: 'center',
      fontSize: hp(2.5),
      marginLeft: wp(2),
    },
    focusedInput: {
      borderColor: '#007AFF',
      backgroundColor: '#F0F8FF',
    },
  });