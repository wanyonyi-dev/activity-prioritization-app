import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useCallback } from "react";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

SplashScreen.preventAutoHideAsync();

const Card = ({ activity, filter, handleEditActivity, handleBookmarkActivity, handleDelete, errorMessage }) => {
  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <View style={styles.card} onLayout={onLayoutRootView}>
      {activity.image && (
        <Image source={{ uri: activity.image }} style={styles.cardImage} />
      )}
      <View style={styles.bookmarkIconContainer}>
        <TouchableOpacity
          onPress={() => handleBookmarkActivity(activity.id)}
        >
          <MaterialIcons name="bookmark-add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{activity.title}</Text>
          <Text style={styles.cardCategory}>{activity.category}</Text>
        </View>
        <Text style={styles.cardDescription}>{activity.description}</Text>
        <Text style={styles.cardLocation}>{activity.location}</Text>
        {filter === "my" && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => handleEditActivity(activity)}
            >
              <MaterialIcons name="edit-note" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDelete(activity.id)}
            >
              <MaterialCommunityIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 10,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  bookmarkIconContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardTitle: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 16,
  },
  cardCategory: {
    color: "#00A8FF",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 15,
  },
  cardDescription: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_400Regular",
    fontSize: 14,
    marginBottom: 5,
  },
  cardLocation: {
    color: "#00A8FF",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 15,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 2,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: "#00A8FF",
  },
  deleteButton: {
    backgroundColor: "white",
  },
  editButtonText: {
    color: "white",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});