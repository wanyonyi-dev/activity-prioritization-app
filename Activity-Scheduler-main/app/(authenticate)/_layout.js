import {Stack} from "expo-router";

export default function Layout(){
    return (
        <Stack>
            <Stack.Screen name="Login" options={{headerShown: false}}/>
            <Stack.Screen name="Register" options={{headerShown: false}}/>
            <Stack.Screen name="Welcome" options={{headerShown: false}}/>
        </Stack>
    )
}