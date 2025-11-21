// OrdersPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { VStack, Text, Box, HStack, Pressable, Image, Button, Spinner } from "native-base";
import { Platform } from "react-native";
import Constants from 'expo-constants';
import base_url from "../constants/baseurl";
import { authcontext } from "../../contexts/authcontext";
const sections = ["New", "Pending", "Completed"];
const sampleOrders = [
  { title: "Order #1" },
  { title: "Order #2" },
  { title: "Order #3" },
];

export default function OrdersPage(navigation) {
  const [activeTab, setActiveTab] = useState(user?.role=='seller'?"Sales":'All');
  let pageheaders;
 const{user} = useContext(authcontext);
 if(user.role == 'seller'){
  pageheaders = ['Sales' , 'Purchases' , 'Pending payments' , 'Settled']
 }
 else if(user.role =='buyer'){
  pageheaders = ['All']

 }
 const [sampleorders , setsampleorders] = useState(null);
 const [gettingorders , setgettingorders] = useState(false);
 const [geterror , setgeterror] = useState(null);
 const [purchases , setpurchases] = useState(null);
 const [sales , setsales] = useState(null);
 const [pendingpays , setpendingpays] = useState(null);
 const [settled  ,setsettled] = useState(null);
 const [buyerorders , setbuyerorders] = useState(null);

  const getsellerorders = async function(){  // FOR SELLERS  , SALES ORDERS , PENDING PAYMENTS , PURCHASES , settled orders
    try{
      
      if(gettingorders){
        return
      }
      setgettingorders(true);
      setgeterror(null);
     const orders = await fetch(`${base_url}/get_seller_orders/${user._id}`);
     
     if(orders.ok){
      setgettingorders(false);
      setgeterror(null);
      const info = await orders.json(); // will have purchases , sales orders , pending payments , settle orders
      const purchases = info.purchases;
      const sales = info.sales;
      const pendingpays = info.pendingpays;
      const settled = info.settled;

      setpurchases(purchases);
      setsales(sales);
      setpendingpays(pendingpays);
      setsettled(settled);

     

     }
     else{
      console.log('orders response not ok');
      const info =await orders.json();
      setgettingorders(false);
      if(String(orders.status).startsWith('4')){
        setgeterror(info.message);
      }
      else{
        setgeterror('server error');
      }
      setorders(null)
     }
    }catch(err){
      setgettingorders(false);
      setgeterror('error');
      console.log('could not fetch orders' , err);
      throw new Error(err);
    }
  }

  
  const getbuyerorders = async function(){  // FOR BUYERS , gets purchases only
    try{
      if(gettingorders){
        return
      }
      setgettingorders(true);
      setgeterror(null);
     const orders = await fetch(`${base_url}/get_buyer_orders/${user._id}`);
     if(orders.ok){
      setgettingorders(false);
      setgeterror(null);
      const info = await orders.json(); // will have purchases , sales orders , pending payments , settle orders
      const orders = info.orders;
      setbuyerorders(orders);
     }
     else{
      console.log('orders response not ok');
      const info =await orders.json();
      setgettingorders(false);
      if(String(orders.status).startsWith('4')){
        setgeterror(info.message);
      }
      else{
        setgeterror('server error');
      }
      setorders(null)
     }
    }catch(err){
      setgettingorders(false);
      setgeterror('error');
      console.log('could not fetch orders' , err);
      throw new Error(err);
    }
  }




  useEffect(function(){
   (async function(){
   try{
    if(user?.role == 'seller'){
      await getsellerorders();
    }
    else if(user?.role == 'buyer'){
      await getbuyerorders();
    }
   }
   catch(err){
    console.log('error occured while fetching orders' , err);
   }
   })()
  } ,[])


  useEffect(function(){
     if(user.role =='seller'){
       if(activeTab=='Sales'){
        setsampleorders(sales);
       } else if(activeTab == 'Purchases'){
        setsampleorders(purchases)
       } else if(activeTab == 'Pending payments'){
        setsampleorders(pendingpays)
       } else if(activeTab == 'Settled'){
        setsampleorders(settled)
       }
     }
     else if(user.role == 'buyer'){
       setsampleorders(buyerorders);
     }
  } , [activeTab])


  return (
    <VStack  bg="white" p={4} space={4} mt={Platform.OS==='android'?Constants.statusBarHeight:0} >
      {/* Tabs */}
      <ScrollView  style={{width:'100%'}} horizontal={true} showsHorizontalScrollIndicator={false} >
      <HStack space={4}  overflow={'auto'} width={'100%'} >
        {pageheaders?.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}>
            <Box
              px={4}
              py={2}
              borderRadius="full"
              bg={activeTab === tab ? "teal.500" : "gray.200"}
            >
              <Text color={activeTab === tab ? "white" : "black"} fontWeight="bold">
                {tab}
              </Text>
            </Box>
          </Pressable>
        ))}
      </HStack>
      </ScrollView>

      {/* Scrollable Content */}
      <ScrollView  >
        {/* {sections.map((sec, idx) => ( */}
          {/* <VStack key={idx} space={2} mb={4}>
            <Text fontSize="md" fontWeight="bold">
              {sec}
            </Text> */}
            <VStack space={2}>
             
             {(sampleorders && sampleorders.length == 0) && 
             
             <>
             <Text>{`there were no ${activeTab} found`}</Text>
             </>
             }


             {geterror &&  
             <>
                          <Text color={'red.600'} fontWeight={'bold'} alignSelf={'center'} >{geterror}</Text>
                          <Button onPress={()=>{
                             user?.role=='seller'?getsellerorders():getbuyerorders();
                          }} colorScheme={'blue'} alignItems={'center'} justifyContent={'center'} >RETRY
                          {gettingorders &&  
                           <Spinner        color={'white'} width={'20px'} height={'20px'} alignSelf={'center'} mr={'auto'} ml={'auto'}           />
                          }
                          </Button>

             </>
             
             }

{gettingorders &&  
             <>
                           <Spinner        color={'blue'} width={'20px'} height={'20px'} alignSelf={'center'} mr={'auto'} ml={'auto'}           />
                          <Text color={'blue.600'} fontWeight={'bold'} alignSelf={'center'} >fetching orders....</Text>

             </>
             
             }
              
              {sampleorders?.map((order, i) => (
                <Box
                  key={i}
                  p={4}
                  bg="white"
                  shadow={1}
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="gray.200"
                >
                  <Pressable onPress={navigation.navigate('vieworder' , {order:order._id})} width={'99%'} p={'2px'}  >
                     <HStack>
                      <Image></Image>
                      <VStack p={'4px'} >
                        <Text>order id</Text> 
                        <Text mr={'10px'} fontWeight={'bold'}   color={'white'}  fontSize={'sm'} p={'3px'} bg={order.status=='NEW'?'green.600':order.status=='PENDING'?'purple.600':order.status=='CANCELLED'?'red.600':order.status=='DELIVERED'?'gray.600':order.status=='COMPLETED'?'green.600':order.status=='REVERSED'?'red.600':order.status=='WAITING FOR REFUND'?'orange.300':order.status=='REFUNDED'?'orange.800':'purple.700'}  > status</Text>
                      </VStack>
                     </HStack>
                  </Pressable>
                </Box>
              ))}
            </VStack>
          {/* </VStack> */}
         {/* ))} */}
      </ScrollView>
    </VStack>
  );
}
