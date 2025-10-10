// OrdersPage.jsx
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { VStack, Text, Box, HStack, Pressable } from "native-base";
import { Platform } from "react-native";
import Constants from 'expo-constants';
const sections = ["New", "Pending", "Completed"];
const sampleOrders = [
  { title: "Order #1" },
  { title: "Order #2" },
  { title: "Order #3" },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("Sales");

  return (
    <VStack flex={1} bg="white" p={4} space={4} mt={Platform.OS==='android'?Constants.statusBarHeight:0} >
      {/* Tabs */}
      <HStack space={4}>
        {["Sales", "Purchases"].map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}>
            <Box
              px={4}
              py={2}
              borderRadius="full"
              bg={activeTab === tab ? "teal.500" : "gray.200"}
            >
              <Text color={activeTab === tab ? "white" : "black"} fontWeight="bold">
                {tab}
              </Text>
            </Box>
          </Pressable>
        ))}
      </HStack>

      {/* Scrollable Content */}
      <ScrollView>
        {sections.map((sec, idx) => (
          <VStack key={idx} space={2} mb={4}>
            <Text fontSize="md" fontWeight="bold">
              {sec}
            </Text>
            <VStack space={2}>
              {sampleOrders.map((order, i) => (
                <Box
                  key={i}
                  p={4}
                  bg="white"
                  shadow={1}
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="gray.200"
                >
                  <Text>{order.title} ({activeTab})</Text>
                </Box>
              ))}
            </VStack>
          </VStack>
        ))}
      </ScrollView>
    </VStack>
  );
}
