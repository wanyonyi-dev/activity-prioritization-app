import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import * as SplashScreen from "expo-splash-screen";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import Card from "./Card";
import Bg from "../../../assets/images/bg.png";
import AntDesign from "@expo/vector-icons/AntDesign";
import { TaskPriorityManager } from './taskPriorityManager';

// Activity Service Priority Constants
const ACTIVITY_PRIORITIES = {
  AUTH_VALIDATION: {
    priority: 4,
    type: 'auth',
    retryCount: 3
  },
  ACTIVITY_CREATE: {
    priority: 3,
    type: 'data_update',
    retryCount: 2
  },
  ACTIVITY_UPDATE: {
    priority: 3,
    type: 'data_update',
    retryCount: 2
  },
  ACTIVITY_DELETE: {
    priority: 3,
    type: 'data_delete',
    retryCount: 2
  },
  ACTIVITY_FETCH: {
    priority: 2,
    type: 'data_fetch',
    retryCount: 1
  },
  BOOKMARK_UPDATE: {
    priority: 2,
    type: 'data_update',
    retryCount: 1
  },
  IMAGE_UPLOAD: {
    priority: 2,
    type: 'image_upload',
    retryCount: 1
  },
  UI_UPDATE: {
    priority: 1,
    type: 'ui_update',
    retryCount: 0
  }
};

// Activity Service Class
class ActivityService {
  constructor(apiBaseUrl) {
    this.API_BASE_URL = apiBaseUrl;
    this.priorityManager = new TaskPriorityManager();
  }

  async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async createActivity(newActivity) {
    const taskId = `create-${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      this.priorityManager.addTask({
        id: taskId,
        type: ACTIVITY_PRIORITIES.ACTIVITY_CREATE.type,
        priority: ACTIVITY_PRIORITIES.ACTIVITY_CREATE.priority,
        action: async () => {
          try {
            const token = await this.getAuthToken();
            if (!token) throw new Error('No token found');

            const formData = this.prepareActivityFormData(newActivity);
            
            const response = await fetch(`${this.API_BASE_URL}/activities`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData
            });

            if (!response.ok) {
              throw new Error('Failed to create activity');
            }

            const createdActivity = await response.json();
            resolve(createdActivity);
          } catch (error) {
            reject(error);
          }
        },
        dependencies: []
      });
    });
  }

  async updateActivity(activityId, updates) {
    const taskId = `update-${activityId}`;
    
    return new Promise((resolve, reject) => {
      this.priorityManager.addTask({
        id: taskId,
        type: ACTIVITY_PRIORITIES.ACTIVITY_UPDATE.type,
        priority: ACTIVITY_PRIORITIES.ACTIVITY_UPDATE.priority,
        action: async () => {
          try {
            const token = await this.getAuthToken();
            if (!token) throw new Error('No token found');

            const formData = this.prepareActivityFormData(updates);
            
            const response = await fetch(`${this.API_BASE_URL}/activity/${activityId}`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
              body: formData
            });

            if (!response.ok) {
              throw new Error('Failed to update activity');
            }

            const updatedActivity = await response.json();
            resolve(updatedActivity);
          } catch (error) {
            reject(error);
          }
        },
        dependencies: [`fetch-${activityId}`]
      });
    });
  }

  async fetchActivities(filter = '') {
    const taskId = `fetch-activities-${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      this.priorityManager.addTask({
        id: taskId,
        type: ACTIVITY_PRIORITIES.ACTIVITY_FETCH.type,
        priority: ACTIVITY_PRIORITIES.ACTIVITY_FETCH.priority,
        action: async () => {
          try {
            const token = await this.getAuthToken();
            if (!token) throw new Error('No token found');

            const endpoint = filter === 'all' ? '/all' : '';
            const response = await fetch(`${this.API_BASE_URL}/activities${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
              throw new Error('Failed to fetch activities');
            }

            const activities = await response.json();
            resolve(activities);
          } catch (error) {
            reject(error);
          }
        },
        dependencies: []
      });
    });
  }

  async bookmarkActivity(activityId) {
    const taskId = `bookmark-${activityId}`;
    
    return new Promise((resolve, reject) => {
      this.priorityManager.addTask({
        id: taskId,
        type: ACTIVITY_PRIORITIES.BOOKMARK_UPDATE.type,
        priority: ACTIVITY_PRIORITIES.BOOKMARK_UPDATE.priority,
        action: async () => {
          try {
            const token = await this.getAuthToken();
            if (!token) throw new Error('No token found');

            const response = await fetch(`${this.API_BASE_URL}/bookmark-activity/${activityId}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) {
              throw new Error('Failed to bookmark activity');
            }

            const result = await response.json();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        dependencies: [`fetch-${activityId}`]
      });
    });
  }

  prepareActivityFormData(activity) {
    const formData = new FormData();
    
    formData.append('title', activity.title);
    formData.append('description', activity.description);
    formData.append('location', activity.location);
    formData.append('category', activity.category);
    
    if (activity.start_date) {
      formData.append('start_date', this.formatDateTime(new Date(activity.start_date)));
    }
    if (activity.end_date) {
      formData.append('end_date', this.formatDateTime(new Date(activity.end_date)));
    }

    if (activity.image) {
      const uri = activity.image;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('image', {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`
      });
    }

    return formData;
  }

  formatDateTime(date) {
    const pad = (num) => (num < 10 ? `0${num}` : num);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}

SplashScreen.preventAutoHideAsync();

const Home = () => {
  const activityService = new ActivityService(API_BASE_URL);
  const API_BASE_URL = Constants.expoConfig.extra.apiBaseUrl;
  const [activities, setActivities] = useState([]);
  const [activityErrors, setActivityErrors] = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editedActivities, setEditedActivities] = useState({
    id: null,
    title: "",
    description: "",
    location: "",
    category: "",
    image: "",
    start_date: null,
    end_date: null,
  });

  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    location: "",
    category: "Outdoors",
    image: "",
    start_date: null,
    end_date: null,
  });

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [imageError, setImageError] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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
    fetchActivities("");
  }, []);

  useEffect(() => {
    const endpoint = filter === "all" ? "/all" : "";
    fetchActivities(endpoint);
  }, [filter]);

  // activityService.js


// Initialize priority manager
const priorityManager = new TaskPriorityManager();

// Priority levels for different operations
const ACTIVITY_PRIORITIES = {
  AUTH_VALIDATION: {
    priority: 4,
    type: 'auth',
    retryCount: 3
  },
  ACTIVITY_CREATE: {
    priority: 3,
    type: 'data_update',
    retryCount: 2
  },
  ACTIVITY_UPDATE: {
    priority: 3,
    type: 'data_update',
    retryCount: 2
  },
  ACTIVITY_DELETE: {
    priority: 3,
    type: 'data_delete',
    retryCount: 2
  },
  ACTIVITY_FETCH: {
    priority: 2,
    type: 'data_fetch',
    retryCount: 1
  },
  BOOKMARK_UPDATE: {
    priority: 2,
    type: 'data_update',
    retryCount: 1
  },
  IMAGE_UPLOAD: {
    priority: 2,
    type: 'image_upload',
    retryCount: 1
  },
  UI_UPDATE: {
    priority: 1,
    type: 'ui_update',
    retryCount: 0
  }
};


  const handleSaveActivity = async () => {
    const errors = {};

    if (!editedActivities.title.trim()) {
      errors.title = "Title is required";
    } else {
      const wordCount = editedActivities.title.trim().split(/\s+/).length;
      if (wordCount > 4) {
        errors.title = "Title should not exceed 4 words";
      }
    }
    setTitleError(errors.title || "");

    if (!editedActivities.description.trim()) {
      errors.description = "Description is required";
    } else {
      const wordCount = editedActivities.description.trim().split(/\s+/).length;
      if (wordCount > 50) {
        errors.description = "Description should not exceed 50 words";
      }
    }
    setDescriptionError(errors.description || "");

    if (!editedActivities.location.trim()) {
      errors.location = "Location is required";
    }
    setLocationError(errors.location || "");

    if (!editedActivities.category.trim()) {
      errors.category = "Category is required";
    } else {
      const allowedCategories = ["Outdoors", "Indoors", "General"];
      if (!allowedCategories.includes(editedActivities.category)) {
        errors.category = `Category should be one of ${allowedCategories.join(
          ", "
        )}`;
      }
    }
    setCategoryError(errors.category || "");

    if (!editedActivities.start_date) {
      errors.start_date = "Start date is required";
    } else {
      const startDate = new Date(editedActivities.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.start_date =
          "Start date should be equal to today or in the future";
      }
    }
    setStartDateError(errors.start_date || "");

    if (!editedActivities.end_date) {
      errors.end_date = "End date is required";
    } else {
      const startDate = new Date(editedActivities.start_date);
      const endDate = new Date(editedActivities.end_date);
      if (endDate < startDate) {
        errors.end_date = "End date should be equal to or after the start date";
      }
    }
    setEndDateError(errors.end_date || "");

    if (!editedActivities.image) {
      errors.image = "Image is required";
    }
    setImageError(errors.image || "");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const formattedStartDate = editedActivities.start_date
        ? formatDateTime(new Date(editedActivities.start_date))
        : null;
      const formattedEndDate = editedActivities.end_date
        ? formatDateTime(new Date(editedActivities.end_date))
        : null;

      const formData = new FormData();
      formData.append("title", editedActivities.title);
      formData.append("description", editedActivities.description);
      formData.append("location", editedActivities.location);
      formData.append("category", editedActivities.category);
      formData.append("start_date", formattedStartDate);
      formData.append("end_date", formattedEndDate);

      if (editedActivities.image) {
        const uri = editedActivities.image;
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const response = await fetch(uri);
        const blob = await response.blob();

        formData.append("image", {
          uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/activity/${editedActivities.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const errorData =
          contentType && contentType.includes("application/json")
            ? await response.json()
            : await response.text();
        console.error("Failed to update activity:", errorData);
        throw new Error("Failed to update activity");
      }

      if (contentType && contentType.includes("application/json")) {
        const updatedActivity = await response.json();
        setActivities((prevActivities) =>
          prevActivities.map((activity) =>
            activity.id === updatedActivity.id ? updatedActivity : activity
          )
        );
        setModalVisible(false);
      } else {
        const textData = await response.text();
        console.error("Unexpected response format:", textData);
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error updating activity:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
    setEditedActivities({
      id: "",
      title: "",
      description: "",
      location: "",
      category: "",
      image: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleInputChange = (name, value, isEditing = false) => {
    if (isEditing) {
      setEditedActivities((prevActivity) => ({
        ...prevActivity,
        [name]: value,
      }));
    } else {
      setNewActivity((prevActivity) => ({
        ...prevActivity,
        [name]: value,
      }));
    }

    switch (name) {
      case "title":
        setTitleError("");
        break;
      case "description":
        setDescriptionError("");
        break;
      case "location":
        setLocationError("");
        break;
      case "category":
        setCategoryError("");
        break;
      case "start_date":
        setStartDateError("");
        break;
      case "end_date":
        setEndDateError("");
        break;
      case "image":
        setImageError("");
        break;
      default:
        break;
    }
  };

  const pickImage = async (isEditing = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (isEditing) {
        setEditedActivities((prevState) => ({
          ...prevState,
          image: result.assets[0].uri,
        }));
      } else {
        setNewActivity((prevState) => ({
          ...prevState,
          image: result.assets[0].uri,
        }));
      }
      setImageError("");
    }
  };

  const handleCreateActivity = async () => {
    const errors = {};

    if (!newActivity.title.trim()) {
      errors.title = "Title is required";
    } else {
      const wordCount = newActivity.title.trim().split(/\s+/).length;
      if (wordCount > 4) {
        errors.title = "Title should not exceed 4 words";
      }
    }
    setTitleError(errors.title || "");

    if (!newActivity.description.trim()) {
      errors.description = "Description is required";
    } else {
      const wordCount = newActivity.description.trim().split(/\s+/).length;
      if (wordCount > 50) {
        errors.description = "Description should not exceed 50 words";
      }
    }
    setDescriptionError(errors.description || "");

    if (!newActivity.location.trim()) {
      errors.location = "Location is required";
    }
    setLocationError(errors.location || "");

    if (!newActivity.category.trim()) {
      errors.category = "Category is required";
    } else {
      const allowedCategories = ["Outdoors", "Indoors", "General"];
      if (!allowedCategories.includes(newActivity.category)) {
        errors.category = `Category should be one of ${allowedCategories.join(
          ", "
        )}`;
      }
    }
    setCategoryError(errors.category || "");

    if (!newActivity.start_date) {
      errors.start_date = "Start date is required";
    } else {
      const startDate = new Date(newActivity.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.start_date =
          "Start date should be equal to today or in the future";
      }
    }
    setStartDateError(errors.start_date || "");

    if (!newActivity.end_date) {
      errors.end_date = "End date is required";
    } else {
      const startDate = new Date(newActivity.start_date);
      const endDate = new Date(newActivity.end_date);
      if (endDate < startDate) {
        errors.end_date = "End date should be equal to or after the start date";
      }
    }
    setEndDateError(errors.end_date || "");

    if (!newActivity.image) {
      errors.image = "Image is required";
    }
    setImageError(errors.image || "");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const formattedStartDate = newActivity.start_date
        ? formatDateTime(new Date(newActivity.start_date))
        : null;
      const formattedEndDate = newActivity.end_date
        ? formatDateTime(new Date(newActivity.end_date))
        : null;

      const formData = new FormData();
      formData.append("title", newActivity.title);
      formData.append("description", newActivity.description);
      formData.append("location", newActivity.location);
      formData.append("category", newActivity.category);
      formData.append("start_date", formattedStartDate);
      formData.append("end_date", formattedEndDate);

      if (newActivity.image) {
        const uri = newActivity.image;
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const response = await fetch(uri);
        const blob = await response.blob();

        formData.append("image", {
          uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const errorData =
          contentType && contentType.includes("application/json")
            ? await response.json()
            : await response.text();
        console.error("Failed to create activity:", errorData);
        throw new Error("Failed to create activity");
      }

      if (contentType && contentType.includes("application/json")) {
        const createdActivity = await response.json();
        setActivities((prevActivities) => [createdActivity, ...prevActivities]);
        setCreateModalVisible(false);
        setNewActivity({
          title: "",
          description: "",
          location: "",
          category: "Outdoors",
          start_date: "",
          end_date: "",
          image: null,
        });
      } else {
        const textData = await response.text();
        console.error("Unexpected response format:", textData);
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error creating activity:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateModalVisible(false);
    setNewActivity({
      title: "",
      description: "",
      location: "",
      category: "Outdoors",
      image: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleBookmarkActivity = async (activityId) => {
    setLoading(true);
    setErrorMessage(null);
    setActivityErrors((prevErrors) => ({
      ...prevErrors,
      [activityId]: null,
    }));
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        setActivityErrors((prevErrors) => ({
          ...prevErrors,
          [activityId]: "No token found",
        }));
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/bookmark-activity/${activityId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to bookmark activity";
        setActivityErrors((prevErrors) => ({
          ...prevErrors,
          [activityId]: errorMessage,
        }));
        setLoading(false);
        return;
      }

      const updatedActivity = await response.json();
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === updatedActivity.activity_id
            ? { ...activity, ...updatedActivity }
            : activity
        )
      );

      setActivityErrors((prevErrors) => {
        const { [activityId]: _, ...rest } = prevErrors;
        return rest;
      });
    } catch (error) {
      setActivityErrors((prevErrors) => ({
        ...prevErrors,
        [activityId]: "Error bookmarking activity: " + error.message,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/activity/${activityId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete activity:", errorData);
        throw new Error("Failed to delete activity");
      }

      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== activityId)
      );
    } catch (error) {
      console.error("Error deleting activity:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.filterButton,
              filter === "all" && styles.activeFilterButton,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "all" && styles.activeFilterButtonText,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              styles.filterButtonLast,
              filter === "my" && styles.activeFilterButton,
            ]}
            onPress={() => setFilter("my")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "my" && styles.activeFilterButtonText,
              ]}
            >
              My Activities
            </Text>
          </Pressable>
          <Pressable onPress={() => setCreateModalVisible(true)}>
            <AntDesign name="pluscircle" size={28} color="#00A8FF" />
          </Pressable>
        </View>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00A8FF" />
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.noActivitiesContainer}>
            <Image source={Bg} style={styles.noActivitiesImage} />
            <Text style={styles.noActivitiesText}>
              No activities at the moment
            </Text>
            <Pressable onPress={() => setCreateModalVisible(true)}>
              <AntDesign
                name="pluscircle"
                size={28}
                color="#00A8FF"
                style={{ marginTop: 10 }}
              />
            </Pressable>
          </View>
        ) : (
          <View contentContainerStyle={styles.activitiesContainer}>
            {activities.map((activity, index) => (
              <Card
                key={index}
                activity={activity}
                filter={filter}
                handleEditActivity={handleEditActivity}
                handleDelete={handleDelete}
                handleBookmarkActivity={handleBookmarkActivity}
                errorMessage={activityErrors[activity.id]}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00A8FF" />
          </View>
        ) : (
          <>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Activity</Text>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Title"
                      value={editedActivities.title}
                      onChangeText={(text) =>
                        handleInputChange("title", text, true)
                      }
                    />
                  </View>
                  {titleError ? (
                    <Text style={styles.errorText}>{titleError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Description"
                      value={editedActivities.description}
                      onChangeText={(text) =>
                        handleInputChange("description", text, true)
                      }
                    />
                  </View>
                  {descriptionError ? (
                    <Text style={styles.errorText}>{descriptionError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Location"
                      value={editedActivities.location}
                      onChangeText={(text) =>
                        handleInputChange("location", text, true)
                      }
                    />
                  </View>
                  {locationError ? (
                    <Text style={styles.errorText}>{locationError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <Picker
                      selectedValue={editedActivities.category}
                      style={styles.picker}
                      onValueChange={(itemValue) =>
                        handleInputChange("category", itemValue, true)
                      }
                    >
                      <Picker.Item label="Outdoors" value="Outdoors" />
                      <Picker.Item label="Indoors" value="Indoors" />
                    </Picker>
                  </View>
                  {categoryError ? (
                    <Text style={styles.errorText}>{categoryError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {editedActivities.start_date
                          ? formatDateTime(
                              new Date(editedActivities.start_date)
                            )
                          : "Pick a start date"}
                      </Text>
                      <AntDesign name="calendar" size={20} color="#00A8FF" />
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker
                        value={
                          editedActivities.start_date
                            ? new Date(editedActivities.start_date)
                            : new Date()
                        }
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowStartDatePicker(false);
                          if (date) {
                            handleInputChange(
                              "start_date",
                              date.toISOString(),
                              true
                            );
                          }
                        }}
                      />
                    )}
                  </View>
                  {startDateError ? (
                    <Text style={styles.errorText}>{startDateError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {editedActivities.end_date
                          ? formatDateTime(new Date(editedActivities.end_date))
                          : "Pick an end date"}
                      </Text>
                      <AntDesign name="calendar" size={20} color="#00A8FF" />
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker
                        value={
                          editedActivities.end_date
                            ? new Date(editedActivities.end_date)
                            : new Date()
                        }
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowEndDatePicker(false);
                          if (date) {
                            handleInputChange(
                              "end_date",
                              date.toISOString(),
                              true
                            );
                          }
                        }}
                      />
                    )}
                  </View>
                  {endDateError ? (
                    <Text style={styles.errorText}>{endDateError}</Text>
                  ) : null}
                  <Pressable
                    style={styles.imagePickerButton}
                    onPress={() => pickImage(true)}
                  >
                    <Text style={styles.imagePickerButtonText}>
                      Pick an image
                    </Text>
                  </Pressable>
                  {editedActivities.image ? (
                    <Image
                      source={{ uri: editedActivities.image }}
                      style={styles.imagePreview}
                    />
                  ) : null}
                  {imageError ? (
                    <Text style={styles.errorText}>{imageError}</Text>
                  ) : null}
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[styles.button, styles.submitButton]}
                      onPress={handleSaveActivity}
                    >
                      <Text style={styles.submitButtonText}>Save</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancelEdit}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </>
        )}
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00A8FF" />
          </View>
        ) : (
          <>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Create Activity</Text>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Title"
                      value={newActivity.title}
                      onChangeText={(text) => handleInputChange("title", text)}
                    />
                  </View>
                  {titleError ? (
                    <Text style={styles.errorText}>{titleError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Description"
                      value={newActivity.description}
                      onChangeText={(text) =>
                        handleInputChange("description", text)
                      }
                    />
                  </View>
                  {descriptionError ? (
                    <Text style={styles.errorText}>{descriptionError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Location"
                      value={newActivity.location}
                      onChangeText={(text) =>
                        handleInputChange("location", text)
                      }
                    />
                  </View>
                  {locationError ? (
                    <Text style={styles.errorText}>{locationError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <Picker
                      selectedValue={newActivity.category}
                      style={styles.picker}
                      onValueChange={(itemValue) =>
                        handleInputChange("category", itemValue)
                      }
                    >
                      <Picker.Item label="Outdoors" value="Outdoors" />
                      <Picker.Item label="Indoors" value="Indoors" />
                    </Picker>
                  </View>
                  {categoryError ? (
                    <Text style={styles.errorText}>{categoryError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {newActivity.start_date
                          ? formatDateTime(new Date(newActivity.start_date))
                          : "Pick a start date"}
                      </Text>
                      <AntDesign name="calendar" size={20} color="#00A8FF" />
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker
                        value={
                          newActivity.start_date
                            ? new Date(newActivity.start_date)
                            : new Date()
                        }
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowStartDatePicker(false);
                          if (date) {
                            handleInputChange("start_date", date.toISOString());
                          }
                        }}
                      />
                    )}
                  </View>
                  {startDateError ? (
                    <Text style={styles.errorText}>{startDateError}</Text>
                  ) : null}
                  <View style={styles.inputContainer}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {newActivity.end_date
                          ? formatDateTime(new Date(newActivity.end_date))
                          : "Pick an end date"}
                      </Text>
                      <AntDesign name="calendar" size={20} color="#00A8FF" />
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker
                        value={
                          newActivity.end_date
                            ? new Date(newActivity.end_date)
                            : new Date()
                        }
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowEndDatePicker(false);
                          if (date) {
                            handleInputChange("end_date", date.toISOString());
                          }
                        }}
                      />
                    )}
                  </View>
                  {endDateError ? (
                    <Text style={styles.errorText}>{endDateError}</Text>
                  ) : null}
                  <Pressable
                    style={styles.imagePickerButton}
                    onPress={() => pickImage(false)}
                  >
                    <Text style={styles.imagePickerButtonText}>
                      Pick an image
                    </Text>
                  </Pressable>
                  {newActivity.image ? (
                    <Image
                      source={{ uri: newActivity.image }}
                      style={styles.imagePreview}
                    />
                  ) : null}
                  {imageError ? (
                    <Text style={styles.errorText}>{imageError}</Text>
                  ) : null}
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[styles.button, styles.submitButton]}
                      onPress={handleCreateActivity}
                    >
                      <Text style={styles.submitButtonText}>Create</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancelCreate}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default Home;

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
  buttonContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButtonText: {
    color: "#00A8FF",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  filterButtonLast: {
    marginRight: "auto",
  },
  activeFilterButton: {
    backgroundColor: "#00A8FF",
  },
  activeFilterButtonText: {
    color: "white",
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
  noActivitiesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noActivitiesImage: {
    width: 300,
    height: 300,
  },
  noActivitiesText: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 20,
    marginTop: 20,
  },
  activitiesContainer: {
    marginVertical: 20,
  },
  activityItem: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  activityText: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_400Regular",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  modalContent: {
    width: 360,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "NunitoSans_700Bold",
    marginBottom: 10,
    color: "#2d2e2e",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 1,
    margin: 10,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    color: "gray",
    marginLeft: 15,
    paddingVertical: 8,
    fontSize: 16,
    flex: 1,
    fontFamily: "NunitoSans_400Regular",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginVertical: 10,
    gap: 10,
  },
  datePickerText: {
    color: "gray",
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
  },
  picker: {
    width: "100%",
    color: "gray",
    paddingVertical: 8,
    fontSize: 16,
    flex: 1,
    fontFamily: "NunitoSans_400Regular",
  },
  imagePickerButton: {
    backgroundColor: "#00A8FF",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  imagePickerButtonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 20,
  },
  submitButton: {
    backgroundColor: "#00A8FF",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  cancelButton: {
    backgroundColor: "white",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
  },
  cancelButtonText: {
    color: "#00A8FF",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  errorText: {
    color: "red",
    marginBottom: 3,
    fontFamily: "NunitoSans_400Regular",
  },
});