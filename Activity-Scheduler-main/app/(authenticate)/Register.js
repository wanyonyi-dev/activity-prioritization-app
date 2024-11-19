import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../../assets/images/logo.png";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Constants from 'expo-constants';
import { useFonts, NunitoSans_400Regular, NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Register = () => {
  const API_BASE_URL = Constants.expoConfig.extra.apiBaseUrl;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const checkSignupStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Error retrieving the token:", error);
      }
    };
    checkSignupStatus();
  }, []);

  const handleRegister = async () => {
    if (!firstName) {
      setFirstNameError("First name is required");
    } else {
      setFirstNameError("");
    }
  
    if (!lastName) {
      setLastNameError("Last name is required");
    } else {
      setLastNameError("");
    }
  
    if (!email) {
      setEmailError("Email is required");
    } else {
      setEmailError("");
    }
  
    if (!password) {
      setPasswordError("Password is required");
    } else {
      setPasswordError("");
    }
  
    if (!firstName || !lastName || !email || !password) {
      return;
    }
  
    setLoading(true);
    const user = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: password,
    };
  
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, user);
      const token = response.data.access_token;
      if (token) {
        await AsyncStorage.setItem("authToken", token);
        setAlertVisible(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
      } else {
        setPasswordError("Token is null or undefined");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        if (errorMessage === "Email already exists") {
          setEmailError(errorMessage);
        } else {
          setFirstNameError(errorMessage.first_name || "");
          setLastNameError(errorMessage.last_name || "");
          setEmailError(errorMessage.email || "");
          setPasswordError(errorMessage.password || "An unexpected error occurred");
        }
      } else {
        setPasswordError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAlertDismiss = () => {
    setAlertVisible(false);
    router.replace("/(tabs)/home");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} />
          </View>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Get Started</Text>
            <Text style={styles.subHeaderText}>Create your account now</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  setFirstNameError("");
                }}
                style={styles.textInput}
                placeholder="First name"
              />
            </View>
            {firstNameError ? (
              <Text style={styles.errorText}>{firstNameError}</Text>
            ) : null}
            <View style={styles.inputContainer}>
              <TextInput
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  setLastNameError("");
                }}
                style={styles.textInput}
                placeholder="Last name"
              />
            </View>
            {lastNameError ? (
              <Text style={styles.errorText}>{lastNameError}</Text>
            ) : null}
            <View style={styles.inputContainer}>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError("");
                }}
                style={styles.textInput}
                placeholder="emailaddress@gmail.com"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            <View style={styles.inputContainer}>
              <TextInput
                value={password}
                secureTextEntry={!passwordVisible}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                style={styles.textInput}
                placeholder="Password"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            <Pressable onPress={handleRegister} style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register</Text>
            </Pressable>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Have an account?</Text>
              <Pressable onPress={() => router.replace("/Login")}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && (
        <Modal animationType="none">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00A8FF" />
          </View>
        </Modal>
      )}
      <Modal
        visible={alertVisible}
        animationType="slide"
        onRequestClose={handleAlertDismiss}
      >
        <View style={styles.alertContainer}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Welcome onboard</Text>
            <Text style={styles.alertMessage}>You have been registered successfully</Text>
            <Pressable
              style={styles.alertButton}
              onPress={handleAlertDismiss}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginTop: 20,
  },
  logo: {
    width: 300,
    resizeMode: "contain",
  },
  headerContainer: {
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "600",
    marginTop: 20,
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
  },
  subHeaderText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#4b5563",
    fontFamily: "NunitoSans_400Regular",
  },
  formContainer: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 4,
    marginTop: 20,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    color: "gray",
    marginLeft: 15,
    marginVertical: 10,
    fontSize: 16,
    flex: 1,
    fontFamily: "NunitoSans_400Regular",
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginLeft: 15,
    fontFamily: "NunitoSans_400Regular",
  },
  registerButton: {
    width: 100,
    backgroundColor: "#00A8FF",
    padding: 12,
    borderRadius: 5,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 30,
  },
  registerButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
 
  },
  loginContainer: {
    marginTop: 20,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "400",
    fontFamily: "NunitoSans_400Regular",
  },
  loginLink: {
    fontSize: 15,
    color: "#00A8FF",
    textDecorationLine: "underline",
    fontFamily: "NunitoSans_400Regular", 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertBox: {
    width: 350,
    padding: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "NunitoSans_700Bold",
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "400",
    fontFamily: "NunitoSans_400Regular",
  },
  alertButton: {
    backgroundColor: "#00A8FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "NunitoSans_700Bold", 
  },
});