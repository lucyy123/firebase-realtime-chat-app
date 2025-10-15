import Homeheader from "@/components/homeUtils/Homeheader";
import {
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0077e4",
        tabBarStyle: {
          elevation: 0,
          
        },
       
      }}
    >
      <Tabs.Screen
        name="homeChat"
        options={{
          header: ()=> <Homeheader/>,
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          header: ()=> <Homeheader/>,
          title: "Groups",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-group-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
