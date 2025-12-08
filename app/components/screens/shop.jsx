import React, { useContext, useEffect, useState } from "react";
import { ImageBackground, ScrollView } from "react-native";
import { Box, VStack, Text, Image, Heading, HStack, Button, Pressable, Spinner } from "native-base";
import { Platform } from "react-native";
import Constants from 'expo-constants';
import Feather from '@expo/vector-icons/Feather';
import base_url from "../constants/baseurl";
import { authcontext } from "../../contexts/authcontext";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ShopView({navigation ,route}) {
    const {client ,shop} = route.params || {}
    const [shopobj , setshopobj] = useState(null);
     const {user} = useContext(authcontext);
     const [liked , setliked] = useState(null)
  //  console.log('SHOP INFO' , shopobj , 'SHOP IMAGE' , shopobj?.image)


     useEffect(function(){
        if(shopobj){
          const isliked = user?.favourite_shops?.some(function(val){
            return val.toString == shopobj._id.toString();
          }) 

          setliked(isliked);
        }
     } , [shopobj])

     const [likingshop , setlikingshop] = useState(false);
     const [likeerror , setlikeerror] = useState(null);

     const likeshop = async function(){
      try{
        if(likingshop){

        }
    // console.log(user._id);
        setlikeerror(null);
        setlikingshop(true);
          //  console.log('user info' , user);
          const res = await fetch(`${base_url}/like_shop/${shopobj?._id}/${user?._id}`);
          if(res.ok){
            setlikeerror(null);
            setlikingshop(false);
            const info = await res.json();
            const shopinfo = info.shop;
            setshopobj(shopinfo);
  
  
  
          }
          else{
           
            setlikingshop(false);
            const info = await res.json();
            // setshopobj(null);
            if(String(res.status).startsWith('4')){
              setlikeerror(info.message);
            }
            else{
             setlikeerror('server error , could not like shop');
            }
          }
      }
      catch(err){
        setlikingshop(false);
        setlikeerror('could not like shop')
        // setshopobj(null);
        console.log('could not like shop' , err);
        throw new Error(` error liking shops , ${err}`)
      }
    }



     const handlereturn = function(newshop){
       setshopobj(newshop);
     }


     const [gettingshop , setgettingshop] = useState(false);
     const [geterror , setgeterror] = useState(null);

     const getshop = async function(){
      try{
        if(gettingshop){

        }
    // console.log(user._id);
        setgeterror(null);
        setgettingshop(true);
          //  console.log('user info' , user);
          const res = await fetch(`${base_url}/get_shop/${shop}`);
          if(res.ok){
            setgeterror(null);
            setgettingshop(false);
            const info = await res.json();
            const shopinfo = info.shop;
            setshopobj(shopinfo);
  
  
  
          }
          else{
           
            setgettingshop(false);
            const info = await res.json();
            setshopobj(null);
            if(String(res.status).startsWith('4')){
              setgeterror(info.message);
            }
            else{
             setgeterror('server error , could not fetch shops');
            }
          }
      }
      catch(err){
        setgettingshop(false);
        setgeterror('could not fetch shop')
        setshopobj(null);
        console.log('could not get shops' , err);
        throw new Error(` error getting shops , ${err}`)
      }
    }

    useEffect(function(){
     (async function(){
      try{
         await getshop();
      }catch(err){
        console.log('error fetching shop object' , err);
      }
     })()
    } , [])

  // console.log('shop object'  ,shop);



  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10, paddingTop:Platform.OS==='android'?Constants.statusBarHeight:0  }}>
      {gettingshop &&  
        <>
        <Spinner     color={'blue.600'} width={'20px'} height={'20px'} mt={'10px'} alignSelf={'center'} ml={'auto'} mr={'auto'}             />
        <Text color={'blue.600'} fontSize={'sm'} fontWeight={'light'} ml={'auto'} mr={'auto'} mt={'10px'} >fetching shop info.....</Text>
        </>
      }

      {geterror?(
        <>
      
      <Text color={'red.600'} fontSize={'sm'} fontWeight={'light'} ml={'auto'} mr={'auto'} mt={'10px'} >{geterror}</Text>
                <Button  onPress={()=>{getshop()}} >RETRY </Button>
      </>
      ):(
        <>
          <ImageBackground source={{uri:`${base_url}/shop_picture/${shopobj?.image}?t=${Date.now()}`}} alt="shop"  style={{height:300 ,  width:"100%" , overflow:'hidden' ,  borderRadius:10 , position:'relative' }} >
              {
                client?(
                  <Pressable  onPress={()=>{likeshop()}} position={'absolute'} opacity={0.6} top={'10px'} right={'10px'} width={'50px'}  height={'50px'} borderRadius={'50%'} bg={'white'} alignItems={'center'} justifyContent={'center'} >
                  <AntDesign name="heart" size={24} color={liked?'green.600':'gray.600'} />
                  </Pressable>
                ):
                (
                  <Pressable   onPress={()=>{navigation.navigate('shopinfo' , {shopid:shopobj?._id , handlereturn})}}  position={'absolute'} opacity={0.6} top={'10px'} right={'10px'} width={'50px'}  height={'50px'} borderRadius={'50%'} bg={'white'} alignItems={'center'} justifyContent={'center'} >
                  <AntDesign  name="home" size={24} color="black" />
                  </Pressable>
                )
              }
          </ImageBackground>
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
        </>
      )
      
      }
    
    </ScrollView>
  );
}
