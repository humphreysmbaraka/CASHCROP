import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Text, Image, Button, Heading, Pressable } from "native-base";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AddToCartModal from "./addtocartmodal";


export default function CartPage() {
  const [activeTab, setActiveTab] = useState("cart");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10, paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0 }}>
      {/* Tabs */}
      <HStack space={4} mb={4} mt={'40px'} >
        <Button flex={1} colorScheme={activeTab === "cart" ? "teal" : "gray"} onPress={() => setActiveTab("cart")}>
          Cart
        </Button>
        <Button flex={1} colorScheme={activeTab === "saved" ? "teal" : "gray"} onPress={() => setActiveTab("saved")}>
          Saved for Later
        </Button>
      </HStack>

      <VStack space={4}>
        {/* Sample Product */}
        <Pressable onPress={() => setModalOpen(true)}>
          <HStack space={4} alignItems="center" bg="gray.50" p={3} borderRadius="md">
            <Image source={require("../../assets/gmail.jpeg")} alt="product" size="lg" borderRadius="md"/>
            <VStack space={'4px'} width={'70%'} flex={1}>
              <Text width={'90%'} isTruncated={true} fontWeight="bold">Item Name</Text>
              <Text>Total: $120</Text>
              {activeTab === "cart" ? (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="gray" onPress={() => Alert.alert("Save for later")}>Save for later</Button>
                </>
              ) : (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="teal" onPress={() => Alert.alert("Move to cart")}>Move to Cart</Button>
                </>
              )}
            </VStack>
            {/* <HStack space={2}>
              {activeTab === "cart" ? (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="gray" onPress={() => Alert.alert("Save for later")}>Save</Button>
                </>
              ) : (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="teal" onPress={() => Alert.alert("Move to cart")}>Move to Cart</Button>
                </>
              )}
            </HStack> */}
          </HStack>
        </Pressable>
      </VStack>

     {(activeTab=='cart') && 
     
     <Button mt={6} colorScheme="teal" w="100%" onPress={() => Alert.alert("Checkout pressed")}>
     Checkout
   </Button>}

      <AddToCartModal viewfromcart={true} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </ScrollView>
  );
}
