import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import Bg from "../../../assets/images/bg.png";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
  NunitoSans_600SemiBold,
} from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const ActivitiesCalendar = () => {
  const API_BASE_URL = Constants.expoConfig.extra.apiBaseUrl;
  const [selectedDate, setSelectedDate] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchActivities = async (date) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/activities/date?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch activities:", errorData);
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      setActivities(data.activities);
    } catch (error) {
      console.error("Error fetching activities:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (day) => {
    const date = day.dateString;
    setSelectedDate(date);
    fetchActivities(date);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00A8FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <ScrollView style={styles.scrollViewContent}>
        <Text style={styles.title}>Calendar</Text>
        <Calendar
          onDayPress={handleDateChange}
          markedDates={{
            [selectedDate]: {
              selected: true,
              marked: false,
              selectedColor: "#00A8FF",
            },
          }}
          style={styles.calendar}
        />
        {activities.length === 0 ? (
          <View style={styles.noActivitiesContainer}>
            <ImageBackground source={Bg} style={styles.background} />
            <Text style={styles.noActivitiesText}>No available activities</Text>
          </View>
        ) : (
          <>
            <Text style={styles.availableActivitiesText}>
              Available Activities
            </Text>
            <FlatList
              data={activities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.activityImage}
                  />
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle}>{item.title}</Text>
                      <Text style={styles.activityCategory}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={styles.activityDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.activityLocation}>{item.location}</Text>
                    <Text
                      style={styles.activityDate}
                    >{`Start: ${item.start_date}`}</Text>
                    <Text
                      style={styles.activityDate}
                    >{`End: ${item.end_date}`}</Text>
                  </View>
                </View>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivitiesCalendar;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
    marginBottom: 10,
    color: "#00A8FF",
    textAlign: "center",
    textTransform: "uppercase",
  },
  calendar: {
    marginBottom: 20,
  },
  availableActivitiesText: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    marginBottom: 10,
    color: "#00A8FF",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: 340,
    height: 400,
    marginBottom: 20,
  },
  activityImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  activityContent: {
    padding: 10,
    flexDirection: "column",
    gap: 10,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityTitle: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 16,
  },
  activityCategory: {
    color: "#00A8FF",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 15,
  },
  activityDescription: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_400Regular",
    fontSize: 14,
    marginBottom: 5,
  },
  activityLocation: {
    color: "#00A8FF",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 15,
    textAlign: "flex-start",
  },
  activityDate: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
  },
  noActivitiesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noActivitiesText: {
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
    textAlign: "center",
    marginTop: 10,
    color: "#2d2e2e",
  },
  loaderContainer: {
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
  carouselContainer: {
    paddingVertical: 10,
  },
});