import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useCallback } from "react";
import Bg from "../../assets/images/bg.png";
import { useRouter } from "expo-router";
import { useFonts, NunitoSans_400Regular, NunitoSans_700Bold, NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Welcome = () => {
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold, 
    NunitoSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.logoContainer}>
          <Image source={Bg} style={styles.logo} />
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Let's Get</Text>
          <Text style={styles.subHeaderText}>Started</Text>
        </View>
        <Text style={styles.slogan}>
          Effortlessly Organize, Maximize Your Time, and{"\n"}
          Enjoy More of What Matters!
        </Text>
        <Pressable
          onPress={() => router.replace("/Register")}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>Join Now</Text>
        </Pressable>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Pressable onPress={() => router.replace("/Login")}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
  },
  logoContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  logo: {
    width: 350,
    resizeMode: "contain",
  },
  headerContainer: {
    alignItems: "start",
  },
  headerText: {
    fontSize: 50,
    fontWeight: "600",
    marginTop: 10,
    color: "#4b5563",
    fontFamily: "NunitoSans_700Bold",
  },
  subHeaderText: {
    fontSize: 50,
    fontWeight: "600",
    color: "#4b5563",
    fontFamily: "NunitoSans_700Bold",
  },
  slogan: {
    color: "#4b5563",
    marginVertical: 20,
    fontSize: 14,
    lineHeight: 26,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#00A8FF",
    padding: 12,
    borderRadius: 10,
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
    fontWeight: "300",
    fontFamily: "NunitoSans_400Regular",
  },
  loginLink: {
    fontSize: 15,
    color: "#00A8FF",
    textDecorationLine: "underline",
    fontFamily: "NunitoSans_400Regular",
  },
});