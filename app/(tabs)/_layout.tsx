import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions } from "react-native";

import { COLORS } from "@/constants/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  const tabHeight = width < 360 ? 58 : 65;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,

        tabBarStyle: {
          height: tabHeight + insets.bottom,

          paddingTop: 8,

          paddingBottom:
            insets.bottom > 0
              ? insets.bottom
              : 8,

          borderTopColor: COLORS.border,

          backgroundColor: "#FFFFFF",
        },

        tabBarLabelStyle: {
          fontSize: width < 360 ? 10 : 11,
          fontWeight: "700",
        },

        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="play-circle-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="referral"
        options={{
          title: "Refer & Earn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="gift-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}