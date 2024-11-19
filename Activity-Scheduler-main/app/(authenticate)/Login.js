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
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";
import Constants from 'expo-constants';

SplashScreen.preventAutoHideAsync();

const Login = () => {
  const API_BASE_URL = Constants.expoConfig.extra.apiBaseUrl;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Error retrieving the token:", error);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
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

    if (!email || !password) {
      return;
    }

    setLoading(true);
    const user = {
      email: email.toLowerCase(),
      password: password,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, user);
      const token = response.data.access_token;
      if (token) {
        await AsyncStorage.setItem("authToken", token);
        router.replace("/(tabs)/home");
      } else {
        setPasswordError("Token is null or undefined");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        if (errorMessage === "User does not exist") {
          setEmailError(errorMessage);
        } else if (errorMessage === "Incorrect password") {
          setPasswordError(errorMessage);
        } else {
          setPasswordError("An unexpected error occurred");
        }
      } else {
        setPasswordError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.headerText}>Welcome Back</Text>
            <Text style={styles.subHeaderText}>
              Login to your account to continue
            </Text>
          </View>
          <View style={styles.formContainer}>
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
            <Pressable onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <Pressable onPress={() => router.replace("/Register")}>
                <Text style={styles.signUpLink}>Sign up</Text>
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
    </SafeAreaView>
  );
};

export default Login;

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
    fontWeight: "700",
    marginTop: 20,
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
  },
  subHeaderText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4b5563",
    fontFamily: "NunitoSans_400Regular",
  },
  formContainer: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginLeft: 15,
    fontFamily: "NunitoSans_400Regular",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 4,
    marginTop: 30,
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
  loginButton: {
    width: 100,
    backgroundColor: "#00A8FF",
    padding: 12,
    borderRadius: 5,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 40,
  },
  loginButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
  },
  signUpContainer: {
    marginTop: 20,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "400",
    fontFamily: "NunitoSans_400Regular",
  },
  signUpLink: {
    fontSize: 15,
    color: "#00A8FF",
    fontFamily: "NunitoSans_400Regular",
    textDecorationLine: "underline",
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
});
