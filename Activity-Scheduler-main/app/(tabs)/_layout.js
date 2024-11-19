import { Tabs } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="home"
                options={{
                    tabBarLabel: "Home",
                    tabBarLabelStyle: ({ focused }) => ({
                        color: focused ? "#00A8FF" : "#2d2e2e",
                    }),
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <MaterialIcons name="home" size={25} color="#00A8FF" />
                        ) : (
                            <MaterialIcons name="home" size={25} color="#2d2e2e" />
                        ),
                }}
            />
            <Tabs.Screen
                name="activitiesCalendar"
                options={{
                    tabBarLabel: "Calendar",
                    tabBarLabelStyle: ({ focused }) => ({
                        color: focused ? "#00A8FF" : "#2d2e2e",
                    }),
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <MaterialIcons name="calendar-month" size={25} color="#00A8FF" />
                        ) : (
                            <MaterialIcons name="calendar-month" size={25} color="#2d2e2e" />
                        ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    tabBarLabel: "Account",
                    tabBarLabelStyle: ({ focused }) => ({
                        color: focused ? "#00A8FF" : "#2d2e2e",
                    }),
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <MaterialCommunityIcons name="account" size={25} color="#00A8FF" />
                        ) : (
                            <MaterialCommunityIcons name="account" size={25} color="#2d2e2e" />
                        ),
                }}
            />
        </Tabs>
    );
}