import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/services/auth.service";
import CountryPicker, {
  type CountryCode as PickerCountryCode,
} from "react-native-country-picker-modal";

export default function LoginScreen() {
  const { setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"mobile" | "email">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<PickerCountryCode>("IN");
  const [callingCode, setCallingCode] = useState("91");
  const [countryVisible, setCountryVisible] = useState(false);

  const handleLogin = async () => {
    const normalizedIdentifier = loginType === "email"
      ? identifier.trim().toLowerCase()
      : `+${callingCode}${identifier.replace(/\D/g, "")}`;

    if (!identifier.trim() || !password) {
      Alert.alert("Missing details", "Please enter your email/mobile and password.");
      return;
    }

    if (loginType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (loginType === "mobile" && identifier.replace(/\D/g, "").length < 6) {
      Alert.alert("Invalid mobile", "Please enter a valid mobile number.");
      return;
    }

    try {
      setIsLoading(true);
      const session = await loginUser({ identifier: normalizedIdentifier, password });
      await setSession(session);
      Alert.alert("Success", "Login successful");
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Login failed", "Invalid email/mobile or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Image
        source={require("@/assets/images/headlogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        Welcome Back 👋
      </Text>

      <Text style={styles.subtitle}>
        Login to continue your learning journey
      </Text>
<View style={styles.switchBox}>

  <TouchableOpacity
    style={[
      styles.switchButton,
      loginType === "mobile" && styles.activeSwitch,
    ]}
    onPress={() => {
      setLoginType("mobile");
      setIdentifier("");
    }}
  >
    <Text
      style={[
        styles.switchText,
        loginType === "mobile" && styles.activeText,
      ]}
    >
      Mobile
    </Text>
  </TouchableOpacity>


  <TouchableOpacity
    style={[
      styles.switchButton,
      loginType === "email" && styles.activeSwitch,
    ]}
    onPress={() => {
      setLoginType("email");
      setIdentifier("");
    }}
  >
    <Text
      style={[
        styles.switchText,
        loginType === "email" && styles.activeText,
      ]}
    >
      Email
    </Text>
  </TouchableOpacity>

</View>

     <View style={styles.inputBox}>

  {loginType === "mobile" ? (
    <TouchableOpacity
      onPress={() => setCountryVisible(true)}
      style={styles.countryPicker}
    >
      <CountryPicker
        countryCode={countryCode}
        withFlag
        withFilter
        withCallingCode
        visible={countryVisible}
        onClose={() => setCountryVisible(false)}
        onSelect={(country) => {
          setCountryCode(country.cca2);
          setCallingCode(country.callingCode[0]);
          setCountryVisible(false);
        }}
      />
      <Text style={styles.countryCode}>+{callingCode}</Text>
    </TouchableOpacity>
  ) : null}

  <Ionicons
    name={
      loginType === "mobile"
        ? "call-outline"
        : "mail-outline"
    }
    size={24}
    color="#2563EB"
  />

  <TextInput
    placeholder={
      loginType === "mobile"
        ? "Mobile number"
        : "Email address"
    }
    keyboardType={
      loginType === "mobile"
        ? "phone-pad"
        : "email-address"
    }
    value={identifier}
    onChangeText={setIdentifier}
    autoCapitalize="none"
    autoCorrect={false}
    style={styles.input}
  />

</View>



      <View style={styles.inputBox}>

        <Ionicons
          name="lock-closed-outline"
          size={24}
          color="#2563EB"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
        >

          <Ionicons
            name={
              showPassword
                ? "eye-outline"
                : "eye-off-outline"
            }
            size={24}
            color="#64748B"
          />

        </TouchableOpacity>

      </View>



      <TouchableOpacity>
        <Text style={styles.forgot}>
          Forgot Password?
        </Text>
      </TouchableOpacity>



      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >

        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}

      </TouchableOpacity>



      <TouchableOpacity
        onPress={() => router.push("/auth/register")}
      >

        <Text style={styles.register}>

          Don't have an account?

          <Text style={styles.link}>
            {" "}Create Account
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
    width:220,
    height:100,
    alignSelf:"center",
    marginBottom:40,
  },


  title:{
    fontSize:32,
    fontWeight:"900",
    color:"#111827",
    textAlign:"center",
  },


  subtitle:{
    textAlign:"center",
    color:"#64748B",
    fontSize:16,
    marginTop:10,
    marginBottom:40,
  },


  inputBox:{
    height:60,
    backgroundColor:"#FFFFFF",
    borderRadius:16,
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:18,
    marginBottom:18,
    borderWidth:1,
    borderColor:"#E2E8F0",
  },


  input:{
    flex:1,
    marginLeft:14,
    fontSize:16,
    color:"#111827",
  },


  forgot:{
    color:"#2563EB",
    textAlign:"right",
    fontWeight:"700",
    marginBottom:30,
  },


  button:{
    height:60,
    backgroundColor:"#2563EB",
    borderRadius:18,
    justifyContent:"center",
    alignItems:"center",
  },


  buttonText:{
    color:"#FFFFFF",
    fontSize:18,
    fontWeight:"800",
  },

  countryPicker:{
    flexDirection:"row",
    alignItems:"center",
    marginRight:8,
  },

  countryCode:{
    color:"#2563EB",
    fontWeight:"700",
  },

  buttonDisabled:{
    opacity:0.7,
  },


  register:{
    textAlign:"center",
    marginTop:30,
    color:"#64748B",
    fontSize:16,
  },


  link:{
    color:"#2563EB",
    fontWeight:"800",
  },
switchBox:{
  height:50,
  backgroundColor:"#EAF0FF",
  borderRadius:14,
  flexDirection:"row",
  padding:5,
  marginBottom:20,
},


switchButton:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  borderRadius:12,
},


activeSwitch:{
  backgroundColor:"#2563EB",
},


switchText:{
  color:"#64748B",
  fontWeight:"700",
},


activeText:{
  color:"#FFFFFF",
},
});
