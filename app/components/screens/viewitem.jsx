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
  console.log('ROUTE PARAMS' , route.params);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white", paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0, padding: 10 }}
    >
      {/* Item Info */}
      <VStack width={'95%'} p={4} space={4} mb={4} alignSelf={'center'} alignItems="center" justifyContent={'space-between'} >
        <Image
          source={{uri:`${base_url}/item_picture/${item?.image}`}}
          alt="item"
          size="xl"
          borderRadius="md"
          width={'95%'}
          height={'200px'}
        />
        <VStack>
          <Text fontSize="lg" fontWeight="light">{item?.name}</Text>
          <Text fontSize="md" color="gray.500">{`Price: ${item?.price} / ${item?.unit}`}</Text>
        </VStack>
      </VStack>

      {/* Description */}
      <Box mb={4}>
        <Heading size="sm" mb={2}>Description</Heading>
        <Text>
        { item?.description}
        </Text>
      </Box>

      <Divider mb={4} />

      {/* Seller Info */}
      <Box mb={4}>
        <Heading size="sm" mb={2}>Seller Info</Heading>
        <VStack   width={'95%'} space={2} alignItems="center" bg="gray.50" p={3} borderRadius="md">
          <Image
            source={{uri:`${base_url}/shop_picture/${item?.shop?.image}`}}
            alt="shop"
            size="lg"
            borderRadius="md"
          />
          <Text fontWeight="bold">{item?.shop?.name}</Text>
          <Text color="gray.500">
            {` Location : ${item?.shop?.county?.name} , ${item?.shop?.country?.countryName}`}
          </Text>
          <Button mt={2} onPress={() => {navigation.navigate('seller' , {screen:'shop' , params:{client:true , shop:item?.shop}})}}>View Shop</Button>
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
