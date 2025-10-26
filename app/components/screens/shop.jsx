import React from "react";
import { ScrollView } from "react-native";
import { Box, VStack, Text, Image, Heading, HStack, Button, Pressable } from "native-base";
import { Platform } from "react-native";
import Constants from 'expo-constants';
import Feather from '@expo/vector-icons/Feather';
import base_url from "../constants/baseurl";
// const stockItems = [
//   { id: 1, name: "Rice", price: "200", quantity: "10kg", image: require("../../assets/gmail.jpeg") },
//   { id: 2, name: "Beans", price: "150", quantity: "5kg", image: require("../../assets/gmail.jpeg") },
//   { id: 3, name: "Rice", price: "200", quantity: "10kg", image: require("../../assets/gmail.jpeg") },
//   { id: 4, name: "Beans", price: "150", quantity: "5kg", image: require("../../assets/gmail.jpeg") },
//   { id: 5, name: "Rice", price: "200", quantity: "10kg", image: require("../../assets/gmail.jpeg") },
//   { id: 6, name: "Beans", price: "150", quantity: "5kg", image: require("../../assets/gmail.jpeg") },
//   { id: 7, name: "Rice", price: "200", quantity: "10kg", image: require("../../assets/gmail.jpeg") },
//   { id: 8, name: "Beans", price: "150", quantity: "5kg", image: require("../../assets/gmail.jpeg") },
//   { id: 9, name: "Rice", price: "200", quantity: "10kg", image: require("../../assets/gmail.jpeg") },
//   { id: 10, name: "Beans", price: "150", quantity: "5kg", image: require("../../assets/gmail.jpeg") },
//   { id: 11, name: "Rice", price: "200", quantity: "10kg", image: require("../../assets/gmail.jpeg") },
//   { id: 12, name: "Beans", price: "150", quantity: "5kg", image: require("../../assets/gmail.jpeg") },
// ];

export default function ShopView({navigation ,route}) {
    const {client ,shop} = route.params || {}
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10, paddingTop:Platform.OS==='android'?Constants.statusBarHeight:0  }}>
      <Image source={{uri:fetch(`${base_url}/shop_picture/${shop?.image}`)}} alt="shop" height={200} width="100%" borderRadius={10} />
      <Heading mt={2}>{shop?.name}</Heading>
      <Text>Created on 08/09/2025</Text>
       {client && 
       <HStack width={'95%'}  space={'100px'} alignSelf={'center'} mt={'10px'} mb={'10px'} p={'4px'} alignItems={'center'} justifyContent={'center'} >
       <Feather name="phone-call" size={24} color="black" />
       <Text color={'black'} fontWeight={'light'} >{`call us on ${shop.number}`}</Text>
       </HStack>
       }
      {/* <Text>Products: Cereals, Vegetables</Text> */}

      <Heading size="md" mt={4}>Available Stock</Heading>
      <HStack flexWrap="wrap" justifyContent="space-between" mt={2}>
        {
        shop?.items.length > 0?(
            shop?.items.map((item ,index) => (
                <Pressable  onPress={()=>{client?navigation.navigate('visitview' , {screen:'view' ,params:{item} }):navigation.navigate('shopitem' , {screen:'overview' , params:{item}})}} key={index} width="48%" mb={4} bg="gray.50" borderRadius="lg" shadow={1} overflow="hidden">
                  <Image source={{uri:fetch(`/${base_url}/item_picture/${item?._id}`)|| null}} alt={item.name} height={120} width="100%" />
                  <Text p={2} fontWeight="bold">{item.name}</Text>
                  <Text p={2}>Price: {item.price}</Text>
                  <Text p={2}>Qty: {item.quantity}</Text>
                </Pressable>
              ))
        )
        :
        (
            <Text p={2} fontWeight="bold">this shop has no items yet</Text>  
        )
      }
      </HStack>

     {!client &&  
     
     <Button mb={'60px'} onPress={()=>{navigation.navigate('additem' , { screen: 'add' , params:{shop} })}} mt={2}>Add Item</Button>
     }
    </ScrollView>
  );
}
