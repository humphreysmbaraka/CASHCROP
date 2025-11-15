import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Box, VStack, Text, Image, Heading, HStack, Button, Pressable } from "native-base";
import { Platform } from "react-native";
import Constants from 'expo-constants';
import Feather from '@expo/vector-icons/Feather';
import base_url from "../constants/baseurl";


export default function ShopView({navigation ,route}) {
    const {client ,shop} = route.params || {}
    const [shopobj , setshopobj] = useState(shop || null);
     
       useEffect(function(){
           setshopobj(shop);
        } , [shop]);

     const handlereturn = function(newshop){
       setshopobj(newshop);
     }

  // console.log('shop object'  ,shop);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10, paddingTop:Platform.OS==='android'?Constants.statusBarHeight:0  }}>
      <Image source={{uri:`${base_url}/shop_picture/${shopobj?.image}`}} alt="shop" height={200} width="100%" borderRadius={10} />
      <Heading mt={2}>{shopobj?.name}</Heading>
      <Text>Created on 08/09/2025</Text>
       {client && 
       <HStack width={'95%'}  space={'100px'} alignSelf={'center'} mt={'10px'} mb={'10px'} p={'4px'} alignItems={'center'} justifyContent={'center'} >
       <Feather name="phone-call" size={24} color="black" />
       <Text color={'black'} fontWeight={'light'} >{`call us on ${shopobj?.owner?.number}`}</Text>
       </HStack>
       }
      {/* <Text>Products: Cereals, Vegetables</Text> */}

      <Heading size="md" mt={4}>Available Stock</Heading>
      <HStack flexWrap="wrap" justifyContent="space-between" mt={2}>
        {
        shopobj?.items.length > 0?(
            shopobj?.items.map((item ,index) => (
                <Pressable  onPress={()=>{client?navigation.navigate('visitview' , {screen:'view' ,params:{item , fromshop:true} }):navigation.navigate('shopitem' ,{item , shop:shopobj , handlereturn})}} key={index} width="48%" mb={4} bg="gray.50" borderRadius="lg" shadow={1} overflow="hidden">
                  <Image source={{uri:`${base_url}/item_picture/${item?.image}`|| null}} alt={item.name} height={120} width="100%" />
                  <Text  width={'95%'} isTruncated  p={2} fontWeight="bold">{item.name}</Text>
                  <Text p={2}>Price: {item.price}</Text>
                  {/* <Text p={2}>Qty: {item.quantity}</Text> */}
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
     
     <Button mb={'60px'}  onPress={() => {navigation.navigate('add', { shop:shopobj ,handlereturn })}}  mt={2}>Add Item</Button>
     }
    </ScrollView>
  );
}
