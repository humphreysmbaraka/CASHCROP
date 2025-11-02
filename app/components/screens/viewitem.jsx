import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Text, Image, Button, Heading, Divider } from "native-base";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AddToCartModal from "./addtocartmodal";
import base_url from "../constants/baseurl";

export default function ViewItemPage({navigation ,route}) {
  const [quantity, setQuantity] = useState(1);
  const pricePerUnit = 120; // Example price per unit
  const [openmodal ,setopenmodal] = useState(false);
  const {item} = route?.params || {};
  
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white", paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0, padding: 10 }}
    >
      {/* Item Info */}
      <HStack space={4} mb={4} alignItems="center">
        <Image
          source={{uri:`${base_url}/item_picture/${item.image}`}}
          alt="item"
          size="xl"
          borderRadius="md"
        />
        <VStack>
          <Text fontSize="lg" fontWeight="bold">{item?.name}</Text>
          <Text fontSize="md" color="gray.500">{`Price: ${item?.price} / ${item?.unit}`}</Text>
        </VStack>
      </HStack>

      {/* Description */}
      <Box mb={4}>
        {/* <Heading size="sm" mb={2}>Description</Heading> */}
        <Text>
          {/* This is a sample description for the item. It gives details about the product, quality, and other important info. */}
        </Text>
      </Box>

      <Divider mb={4} />

      {/* Seller Info */}
      <Box mb={4}>
        <Heading size="sm" mb={2}>Seller Info</Heading>
        <VStack space={2} alignItems="center" bg="gray.50" p={3} borderRadius="md">
          <Image
            source={require("../../assets/gmail.jpeg")}
            alt="shop"
            size="lg"
            borderRadius="md"
          />
          <Text fontWeight="bold">cerials hub</Text>
          <Text color="gray.500">Location: Nairobi, Kenya</Text>
          <Button mt={2} onPress={() => {navigation.navigate('seller' , {screen:'shop' , params:{client:true}})}}>View Shop</Button>
        </VStack>
      </Box>

      {/* Action Buttons */}
      <HStack space={4} mb={20}>
        <Button flex={1} colorScheme="teal" onPress={() => {setopenmodal(true)}}>
          Add to Cart
        </Button>
        <Button flex={1} variant="outline" onPress={() => Alert.alert("Back pressed")}>
          Back
        </Button>
      </HStack>
      <AddToCartModal item  viewfromcart={false}      isOpen={openmodal}     onClose={() => setopenmodal(false)}        />
    </ScrollView>
  );
}
