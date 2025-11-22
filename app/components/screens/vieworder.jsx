import React, { useEffect, useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Text, Image, Button, Heading, Divider } from "native-base";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AddToCartModal from "./addtocartmodal";
import base_url from "../constants/baseurl";

export default function ViewOrder({navigation ,route}) {
    const [getting , setgetting] = useState(false);
    const [geterror , setgeterror] = useState(null);
    const {order} = route.params;
    const [orderobject , setorderobject] = useState(null);


    const getorder = async function(){  // FOR BUYERS , gets purchases only
        try{
          if(gettingorders){
            return
          }
          setgetting(true);
          setgeterror(null);
         const orders = await fetch(`${base_url}/get_order/${order}`);
         if(orders.ok){
          setgetting(false);
          setgeterror(null);
          const info = await orders.json(); // will have purchases , sales orders , pending payments , settle orders
          const order = info.order;
          setorderobject(order);
         }
         else{
          console.log('order response not ok');
          const info =await orders.json();
          setgetting(false);
          if(String(orders.status).startsWith('4')){
            setgeterror(info.message);
          }
          else{
            setgeterror('server error');
          }
          setorderobject(null)
         }
        }catch(err){
          setgetting(false);
          setgeterror('error');
          console.log('could not fetch order' , err);
          throw new Error(err);
        }
      } 

      useEffect(function(){
        (async function(){
        try{
          await getorder();
        }
        catch(err){
         console.log('error occured while fetching orders' , err);
        }
        })()
       } ,[])




       const [canceling , setcancelling] = useState(false);
       const [cancelerror , setcancelerror] = useState(null);

       
      
       const cancel = async function(){  // FOR BUYERS , gets purchases only
        try{
          if(gettingorders){
            return
          }
          setcancelling(true);
          setcancelerror(null);
         const response = await fetch(`${base_url}/cancel_order/${order}`);
         if(response.ok){
          setcancelling(false);
          setcancelerror(null);
          const info = await response.json(); // will have purchases , sales orders , pending payments , settle orders
          const order = info.order;
          setorderobject(order);  // set it to the updated object
         }
         else{
          console.log('order response not ok');
          const info =await response.json();
          setcancelling(false);
          if(String(response.status).startsWith('4')){
            setcancelerror(info.message);
          }
          else{
            setcancelerror('server error');
          }
          setorderobject(null)
         }
        }catch(err){
          setgetting(false);
          setcancelerror('error');
          console.log('could not fetch order' , err);
          throw new Error(err);
        }
      } 

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white", paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0, padding: 10 }}
    >
        <Text        >{`order id and order date`}</Text>
        <Text        >{`order status`}</Text>

      {/* Item Info */}
      <VStack width={'95%'} p={4} space={4} mb={4} alignSelf={'center'} alignItems="center" justifyContent={'space-between'} >
         {/* IMAGE OF ITEM */}
        <Image
          source={{uri:`${base_url}/item_picture/${item?.image}`}}
          alt="item"
          size="xl"
          borderRadius="md"
          width={'95%'}
          height={'200px'}
        />
        <VStack>  
            {/* OEDER ID , DATE , STATUS */}
          <Text fontSize="lg" fontWeight="light">{item?.name}</Text>
          <Text fontSize="md" color="gray.500">{`Price: ${item?.price} / ${item?.unit}`}</Text>
        </VStack>
      </VStack>

      {/* Description  DESCRIPTION OF THE ITEM */}
      <Box mb={4}>
        <Heading size="sm" mb={2}>Description</Heading>
        <Text>
        { item?.description}
        </Text>
      </Box>

      <Divider mb={4} />

      {/* Seller Info SELLER OF THE PRODUCT */}
       {!fromshop &&  
          <Box mb={4}>
          <Heading size="sm" mb={2}>Seller Info</Heading>
          <VStack   width={'95%'} space={2} alignItems="center" bg="gray.50" p={3} borderRadius="md">
            {/* IMAGE OF THE SHOP */}
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
            <Button mt={2}>View Shop</Button>
            <Button mt={2}>View item</Button>
          </VStack>
        </Box>
  
       
       }
      {/* Action Buttons WILL BE HIDDEN FOR SETTLED AND CANCELLED ORDERS */}
      <HStack space={4} mb={20}>
        <Button flex={1} colorScheme="red" >
          CANCEL
        </Button>
        <Button flex={1} variant="outline"  >
          Back
        </Button>
      </HStack>
      <AddToCartModal item={item}  viewfromcart={false}      isOpen={openmodal} key={modalkey}    onClose={function(){
         setmodalkey(null);
         setopenmodal(false)
      }}        />
    </ScrollView>
  );
}
