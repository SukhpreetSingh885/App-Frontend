import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useState } from "react";
import { registerUser } from "@/services/auth.service";
import CountryPicker from "react-native-country-picker-modal";

import {
  isValidPhoneNumber,
  AsYouType,
  type CountryCode as PhoneCountryCode,
} from "libphonenumber-js";
import type {
  CountryCode as PickerCountryCode
} from "react-native-country-picker-modal";

export default function RegisterScreen() {
const { referralCode } =
  useLocalSearchParams<{
    referralCode?: string;
  }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

const [countryCode, setCountryCode] =
  useState<PickerCountryCode>("IN");
  const [phoneCountryCode, setPhoneCountryCode] =
  useState<PhoneCountryCode>("IN");
  const [callingCode, setCallingCode] =
    useState("91");

  const [countryVisible, setCountryVisible] =
    useState(false);



  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");



  const formatPhoneNumber = (value: string) => {

   const formatter = new AsYouType(phoneCountryCode);
    const formatted = formatter.input(
      value.replace(/\D/g, "")
    );

    setMobile(formatted);

  };



  const validate = () => {

    let valid = true;


    setNameError("");
    setMobileError("");
    setEmailError("");
    setPasswordError("");
    setConfirmError("");


    if (!name) {

      setNameError(
        "Please enter your name"
      );

      valid = false;

    } else if (!/^[A-Za-z ]+$/.test(name)) {

      setNameError(
        "Name should contain only letters"
      );

      valid = false;

    }



    if (!mobile) {

      setMobileError(
        "Please enter your mobile number"
      );

      valid = false;

    } else {

      const phoneNumber =
        `+${callingCode}${mobile.replace(/\D/g, "")}`;


      if (!isValidPhoneNumber(phoneNumber)) {

        setMobileError(
          "Please enter a valid mobile number"
        );

        valid = false;

      }

    }
        if (!email) {

      setEmailError(
        "Please enter your email address"
      );

      valid = false;

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

      setEmailError(
        "Please enter a valid email address"
      );

      valid = false;

    }



    if (!password) {

      setPasswordError(
        "Please enter your password"
      );

      valid = false;

    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)
    ) {

      setPasswordError(
        "Password needs 8 characters, uppercase, lowercase, number and special character"
      );

      valid = false;

    }



    if (!confirmPassword) {

      setConfirmError(
        "Please confirm your password"
      );

      valid = false;

    } else if (password !== confirmPassword) {

      setConfirmError(
        "Passwords do not match"
      );

      valid = false;

    }


    return valid;

  };



  return (
    <View style={styles.container}>

      <Image
        source={require("@/assets/images/headlogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />


      <Text style={styles.title}>
        Create Account
      </Text>


      <Text style={styles.subtitle}>
        Start learning with Viralstan Academy
      </Text>



      <View style={styles.inputBox}>

        <Ionicons
          name="person-outline"
          size={22}
          color="#2563EB"
        />

        <TextInput
          placeholder="Full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

      </View>


      {nameError ? (
        <Text style={styles.error}>
          {nameError}
        </Text>
      ) : null}



      <View style={styles.inputBox}>

        <TouchableOpacity
          onPress={() =>
            setCountryVisible(true)
          }
          style={styles.countryPicker}
        >

          <CountryPicker
            countryCode={countryCode}
            withFlag
            withFilter
            withCallingCode
            visible={countryVisible}

            onClose={() =>
              setCountryVisible(false)
            }
onSelect={(country) => {

  setCountryCode(
    country.cca2
  );

  setPhoneCountryCode(
    country.cca2 as PhoneCountryCode
  );

  setCallingCode(
    country.callingCode[0]
  );

  setMobile("");

  setCountryVisible(false);

}}
          />


          <Text style={styles.countryCode}>
            +{callingCode}
          </Text>


        </TouchableOpacity>



        <TextInput
          placeholder="Mobile number"
          value={mobile}
          onChangeText={formatPhoneNumber}
          keyboardType="phone-pad"
          style={styles.input}
        />

      </View>


      {mobileError ? (
        <Text style={styles.error}>
          {mobileError}
        </Text>
      ) : null}



      <View style={styles.inputBox}>

        <Ionicons
          name="mail-outline"
          size={22}
          color="#2563EB"
        />


        <TextInput
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

      </View>


      {emailError ? (
        <Text style={styles.error}>
          {emailError}
        </Text>
      ) : null}
            <View style={styles.inputBox}>

        <Ionicons
          name="lock-closed-outline"
          size={22}
          color="#2563EB"
        />


        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.input}
        />


        <TouchableOpacity
          onPress={() =>
            setShowPassword(!showPassword)
          }
        >

          <Ionicons
            name={
              showPassword
                ? "eye-outline"
                : "eye-off-outline"
            }
            size={22}
            color="#64748B"
          />

        </TouchableOpacity>


      </View>


      {passwordError ? (
        <Text style={styles.error}>
          {passwordError}
        </Text>
      ) : null}




      <View style={styles.inputBox}>

        <Ionicons
          name="lock-closed-outline"
          size={22}
          color="#2563EB"
        />


        <TextInput
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          style={styles.input}
        />


        <TouchableOpacity
          onPress={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
        >

          <Ionicons
            name={
              showConfirmPassword
                ? "eye-outline"
                : "eye-off-outline"
            }
            size={22}
            color="#64748B"
          />

        </TouchableOpacity>


      </View>


      {confirmError ? (
        <Text style={styles.error}>
          {confirmError}
        </Text>
      ) : null}




      <TouchableOpacity
        style={styles.button}
      onPress={async () => {

const isValid = validate();

if (!isValid) return;

  try {

    await registerUser({

      name,

      email,

      password,

      mobile: mobile.replace(/\D/g, ""),

      countryCode: `+${callingCode}`,
       referralCode:
    typeof referralCode === "string"
      ? referralCode
      : undefined,

    });

    Alert.alert(
      "Account Created Successfully 🎉",
      "Welcome to Viralstan Academy.\nPlease login to continue learning.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ],
      { cancelable: false },
    );


  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";

    if (message === "Mobile number already registered") {
      Alert.alert(
        "Mobile Number Already Registered",
        "Mobile number already registered. Please login or use another number.",
      );
    } else {
      Alert.alert("Registration failed", message);
    }

  }

}}
      >

        <Text style={styles.buttonText}>
          Create Account
        </Text>

      </TouchableOpacity>




      <TouchableOpacity
        onPress={() =>
          router.push("/auth/login")
        }
      >

        <Text style={styles.loginText}>

          Already have an account?

          <Text style={styles.link}>
            {" "}Login
          </Text>

        </Text>

      </TouchableOpacity>


    </View>
  );

}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#F5F8FF",
    justifyContent:"center",
    paddingHorizontal:24,
  },


  logo:{
    width:200,
    height:90,
    alignSelf:"center",
    marginBottom:20,
  },


  title:{
    fontSize:30,
    fontWeight:"900",
    textAlign:"center",
    color:"#111827",
  },


  subtitle:{
    textAlign:"center",
    color:"#64748B",
    marginBottom:25,
  },


  inputBox:{
    height:56,
    backgroundColor:"#FFFFFF",
    borderRadius:16,
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:15,
    marginBottom:5,
    borderWidth:1,
    borderColor:"#E2E8F0",
  },


  countryPicker:{
    flexDirection:"row",
    alignItems:"center",
    marginRight:10,
  },


  countryCode:{
    color:"#2563EB",
    fontWeight:"700",
  },


  input:{
    flex:1,
    fontSize:16,
  },


  error:{
    color:"#DC2626",
    fontSize:12,
    marginBottom:8,
    marginLeft:5,
  },


  button:{
    height:58,
    backgroundColor:"#2563EB",
    borderRadius:16,
    justifyContent:"center",
    alignItems:"center",
    marginTop:15,
  },


  buttonText:{
    color:"#FFFFFF",
    fontSize:18,
    fontWeight:"800",
  },


  loginText:{
    textAlign:"center",
    marginTop:20,
    color:"#64748B",
  },


  link:{
    color:"#2563EB",
    fontWeight:"800",
  },

});
