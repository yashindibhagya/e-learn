import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3c0061', // Set active icon color
        tabBarInactiveTintColor: 'gray',  // Optional: Set inactive color
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
          tabBarLabel: 'Home',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />,
          tabBarLabel: 'Explore',
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />,
          tabBarLabel: 'Progress',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="user-circle-o" size={size} color={color} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navbar: {
    color: '#3c0061',
  },
});
