import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Image, Text, Button, Heading, Spinner } from "native-base";
import Constants from 'expo-constants';
import { Platform } from "react-native";
import base_url from "../constants/baseurl";
import { authcontext } from "../../contexts/authcontext";



export default function MyShops({ navigation }) {

    const {user} = useContext(authcontext);
    const [fetching , setfetching] = useState(false);
    const [fetcherror , setfetcherror] = useState(null);
    const [shops , setshops] = useState([])


  const getshops = async function(){
    try{
  console.log(user._id);
      setfetcherror(null);
      setfetching(true);
         console.log('user info' , user);
        const res = await fetch(`${base_url}/get_shops/${user?._id}`);
        if(res.ok){
          setfetcherror(null);
          setfetching(false);
          const info = await res.json();
          const shops = info.shops;
          setshops(shops);



        }
        else{
         
          setfetching(false);
          const info = await res.json();
          setshops([]);
          if(String(res.status).startsWith('4')){
            setfetcherror(info.message);
          }
          else{
           setfetcherror('server error , could not fetch shops');
          }
        }
    }
    catch(err){
      setfetching(false);
      setshops([]);
      console.log('could not get shops' , err);
      throw new Error(` error getting shops , ${err}`)
    }
  }


useEffect(function(){
   const fetch = async function(){
    try{
      await getshops();
    }
    catch(err){
      console.log('errorfetching shops' , err);
    }
   }

   fetch();

} , [])



  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10, paddingTop:Platform.OS==='android'?Constants.statusBarHeight:0 }}>
      <Heading size="lg" mb={4}>
        My Shops
      </Heading>

      {(!shops || shops?.length === 0) ? (
         <>
        
        
        {!fetching  &&   
          <Text mt={10} textAlign="center" fontSize="md" color="gray.500">
          No shop(s) were found , maybe you have not created any yet
        </Text>

        
        }

        {fetching &&  
        
        <>
         <Text mt={10} textAlign="center" fontSize="md" color="gray.500">
           fetching shops
        </Text>
        <Spinner   alignSelf={'center'}    color={'blue'} width={'40px'} height={'40px'}         />
        </>
        }



{fetcherror   && <Text  alignSelf={'center'} color={'red.700'} fontSize={'xs'} >{fetcherror}</Text>}
        <Button  mb={'60px'} mt={4} onPress={async () =>{await getshops()}}>
        retry  {fetching &&   <Spinner   color={'white'} width={'20px'} height={'20px'}              />}
      </Button>
         
         </>
      ) : (
        <HStack flexWrap="wrap" justifyContent="space-between">
          {shops.map((shop , index) => (
            <Box
              key={index}
              bg="gray.50"
              borderRadius="lg"
              shadow={1}
              width="48%"
              mb={4}
              overflow="hidden"
             
            >
              <Image
                source={{uri:`${base_url}/shop_picture/${shop?.image}`}}
                alt={shop.name}
                height={120}
                width="100%"
              />
              <Text p={2} fontWeight="bold">
                {shop.name}
              </Text>
              <Button
                mb={2}
                mx={2}
                onPress = {()=>{navigation.navigate('shop' , {shop:shop})}}
               
              >
                View
              </Button>
            </Box>
          ))}
        </HStack>
      )}

      <Button  mb={'60px'} mt={4} onPress={() =>{navigation.navigate('create')}}>
        Create New Shop
      </Button>
    </ScrollView>
  );
}
