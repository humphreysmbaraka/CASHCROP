import React from "react";
import { ScrollView, Alert ,Platform } from "react-native";
import { Box, Image, Text, Button, Heading, VStack } from "native-base";
import Constants from 'expo-constants';

export default function ViewItem({navigation , route}) {
 
  // const item = {
  //   name: "Rice",
  //   description: "High quality rice",
  //   date: "08/09/2025",
  //   quantity: "10",
  //   unit: "kg",
  //   price: "200",
  //   pricePer: "kg",
  //   image: require("../../assets/gmail.jpeg"),
  // };

  const  {item} = route?.params ||{};
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10 , paddingTop : Platform.OS=='android'?Constants.statusBarHeight:0 }}>
      <Image source={{uri:item?.image}} alt={item?.name} height={200} width="100%" borderRadius={10} />
      <VStack mt={2} space={1}>
        <Heading>{item?.name}</Heading>
        {/* <Text>{item.description}</Text> */}
        {/* <Text>Added on: {item.date}</Text> */}
        <Text>Available Quantity: {item?.quantity} {item?.unit}</Text>
        <Text>Price: {item?.price} per {item?.unit}</Text>
      </VStack>

      <Button mt={4} onPress={() =>{navigation.navigate('edit' , {item:item})} }>Edit Item</Button>
      <Button mt={2} mb={'60px'} colorScheme="danger" onPress={() => {alert('DELETE ITEM?')}}>
        Delete Item
      </Button>
    </ScrollView>
  );
}
