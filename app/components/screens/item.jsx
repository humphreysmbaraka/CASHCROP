import React, { useState } from "react";
import { ScrollView, Alert ,Platform } from "react-native";
import { Box, Image, Text, Button, Heading, VStack, Spinner } from "native-base";
import Constants from 'expo-constants';
import base_url from "../constants/baseurl";

export default function ViewItem({navigation , route}) {

    const [deleting , setdeleting] = useState(false);
    const [deleteerror , setdeleteerror] = useState(null);
    // const  {item} = route?.params ||{};
    const {item , shop , handlereturn} = route?.params || {};

    const deleteitem = async function(){
       try{
        if(deleting){
          return;
        }
        else{

          
          setdeleting(true);
          setdeleteerror(null);
          const res = await fetch(`${base_url}/delete_item?shop=${shop._id}&item=${item._id}` , {
            method:'DELETE',
            headers:{
              'Content_type' :'application/json'
            }
           });
  
           if(res.ok){
            setdeleting(false);
            setdeleteerror(null);
            const info = await res.json();
            const newshop = info.shop;
            handlereturn(newshop);
            navigation.goBack();            
           }
           else{
            setdeleting(false);
            // setdeleteerror(null);
            const info = await res.json();
            if(String(res.status).startsWith('4')){
                setdeleteerror(info.message);
            }
            else{
              setdeleteerror('server error');
            }
  
           }


        }
       }
       catch(err){
        console.log('error deleting item' , err);
       }
    }
 
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


  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10 , paddingTop : Platform.OS=='android'?Constants.statusBarHeight:0 }}>
      <Image source={{uri:`${base_url}/item_picture/${item?.image}` || null}} alt={item?.name} height={200} width="100%" borderRadius={10} />
      <VStack mt={2} space={1}>
        <Heading>{item?.name}</Heading>
        {/* <Text>{item.description}</Text> */}
        {/* <Text>Added on: {item.date}</Text> */}
        <Text>Available Quantity: {item?.quantity} {item?.unit}</Text>
        <Text>Price: {item?.price} per {item?.unit}</Text>
        <Text mt={'10px'} alignSelf={'center'} fontWeight={'bold'} >PRODUCT ESCRIPTION</Text>
        <Text  alignSelf={'center'} width={'90%'}>{item?.description}</Text>
      </VStack>

      <Button mt={4} onPress={() =>{navigation.navigate('edit' ,{screen:'edit' ,params:{ item , edit:true , shop ,  handlereturn}})} }>Edit Item</Button>
      {deleteerror && <Text alignSelf={'center'} color={'red.200'}  fontSize={'xs'}    >{deleteerror}</Text>}
      <Button mt={2} mb={'60px'} colorScheme="danger" onPress={deleteitem}>
        Delete Item   {deleting &&  <Spinner alignSelf={'center'} ml={'auto'} mr={'auto'}  width={'20px'} height={'20px'} color={'white'}             /> }
      </Button>
    </ScrollView>
  );
}
