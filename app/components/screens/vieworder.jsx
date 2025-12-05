import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Text, Image, Button, Heading, Divider, Spinner } from "native-base";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AddToCartModal from "./addtocartmodal";
import base_url from "../constants/baseurl";
import { socketcontext } from "../../contexts/socket context";
import { authcontext } from "../../contexts/authcontext";

export default function ViewOrder({navigation ,route}) {
    const [getting , setgetting] = useState(false);
    const [geterror , setgeterror] = useState(null);
    // const {order , viewingsale} = route.params;
    const [orderobject , setorderobject] = useState(null);
    const {order , viewingsale ,  viewingpurchase , viewingpendingpayment , viewingsettled , viewingbuyerorder , setsales , setpurchases ,setpendingpays , setsettled , setbuyerorders , setsampleorders } = route.params;
    const {socket} = useContext(socketcontext);
    const {user} = useContext(authcontext)
    // const {order} = router.params

    const getorder = async function(){  // GET THE SPECIFIC ORDER BY ID
        try{
          if(getting){
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





       

       const [confirming, setconfirming] = useState(false);
       const [confirmerror , setconfirmerror] = useState(null);

       const confirmorder = async function(){  // BY SELLER
        try{
          if(confirming){
            return
          }
          setconfirming(true);
          setconfirmerror(null);
         const response = await fetch(`${base_url}/confirm_order` , {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({orderid:order , userid:user?._id})
         });
         if(response.ok){
          setconfirming(false);
          setconfirmerror(null);
          const info = await response.json(); // will have purchases , sales orders , pending payments , settle orders
          const order = info.order;
          setorderobject(order);
          setsales(info.sales);
          setpurchases(info.purchases);
          setpendingpays(info.pendingpayment);
          setsettled(info.settled);
          
          socket.emit('order confirmed' , order , function(){
            console.log('order confirmation event has been received successfully');
          })
            // set it to the updated object
         }
         else{
          console.log('response not ok');
          const info =await response.json();
          setconfirming(false);
          if(String(response.status).startsWith('4')){
            setconfirmerror(info.message);
          }
          else{
            setconfirmerror('server error');
          }
          // setorderobject(null)
         }
        }catch(err){
          setconfirming(false);
          setconfirmerror('error');
          console.log('could not decline order' , err);
          throw new Error(err);
        }
      } 









       const [declining , setdeclining] = useState(false);
       const [declineerror , setdeclineerror] = useState(null);

       const declineorder = async function(){  // BY SELLER
        try{
          if(declining){
            return
          }
          setdeclining(true);
          setdeclineerror(null);
         const response = await fetch(`${base_url}/decline_order` , {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({orderid:order , userid:user?._id})
         });
         if(response.ok){
          setdeclining(false);
          setdeclineerror(null);
          const info = await response.json(); // will have purchases , sales orders , pending payments , settle orders
          const order = info.order;
          setorderobject(order);
          setsales(info.sales);
          setpurchases(info.purchases);
          setpendingpays(info.pendingpayment);
          setsettled(info.settled);
          socket.emit('order declined' , order , function(){
            console.log('order declination event has been received successfully');
          })
            // set it to the updated object
         }
         else{
          console.log('response not ok');
          const info =await response.json();
          setdeclining(false);
          if(String(response.status).startsWith('4')){
            setdeclineerror(info.message);
          }
          else{
            setdeclineerror('server error');
          }
          // setorderobject(null)
         }
        }catch(err){
          setgetting(false);
          setcancelerror('error');
          console.log('could not decline order' , err);
          throw new Error(err);
        }
      } 


       const [cancelling , setcancelling] = useState(false);
       const [cancelerror , setcancelerror] = useState(null);

       
      
       const cancel = async function(){  // FOR BUYERS , gets purchases only
        try{
          if(cancelling){
            return
          }
          setcancelling(true);
          setcancelerror(null);
         const response = await fetch(`${base_url}/cancel_order`, {
                method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({orderid:order , userid:user?._id})

         });
         if(response.ok){
          setcancelling(false);
          setcancelerror(null);
          const info = await response.json(); // will have purchases , sales orders , pending payments , settle orders
          const order = info.order;
          setorderobject(order);  // set it to the updated object
          setsales(info.sales);
          setpurchases(info.purchases);
          setpendingpays(info.pendingpayment);
          setsettled(info.settled);
          socket.emit('order cancelled' , order , function(){
            console.log('order cancellation event has been received successfully');
          })
         }
         else{
          
          console.log('order response not ok');
          console.log(response)
          console.log("Status:", response.status);
  const text = await response.text();
  console.log("Server response text:", text);
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
           setcancelling(false);
          
          setcancelerror('error');
          console.log('could not cancel order' , err);
          throw new Error(err);
        }
      } 

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white", paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0, padding: 10 }}
    >







         {getting?(
            <>
         <Spinner   mr={'auto'} ml={'auto'}        color={'blue'} alignSelf={'center'} width={'20px'} height={'20px'}         />
         <Text alignSelf={'center'}  color={'blue.600'} >{`Fetching order info....`}</Text>

         </>
         ):(
        <>
        {geterror?(
            <>
         {/* <Spinner   mr={'auto'} ml={'auto'}        color={'blue'} alignSelf={'center'} width={'20px'} height={'20px'}         /> */}
         <Text alignSelf={'center'}  color={'red.600'} >{`${geterror}`}</Text>

         </>
        ) :(

<>
{/* Item Info */}
<VStack width={'95%'} p={4} space={4} mb={4} alignSelf={'center'} alignItems="center" justifyContent={'space-between'} >
{/* IMAGE OF ITEM */}
<Image
source={{uri:`${base_url}/item_picture/${orderobject?.item?.image}`}}
alt="item"
size="xl"
borderRadius="md"
width={'95%'}
height={'200px'}
/>

<Text alignSelf={'center'} color={'blue.800'} >{`order id : ${orderobject?._id}`}</Text>
<HStack space={'10px'}  width={'90%'}  alignSelf={'center'} alignItems={'center'} justifyContent={'center'} mr={'auto'} ml={'auto'} >
<Text alignSelf={'center'} color={'blue.800'} fontWeight={'bold'}  >{`order status`}</Text>
<Button   mr={'10px'}   p={'3px'} colorScheme={orderobject?.status=='NEW'?'green':orderobject?.status=='PENDING'?'purple':orderobject?.status=='CANCELLED'?'red':orderobject?.status=='DELIVERED'?'gray':orderobject?.status=='COMPLETED'?'green':orderobject?.status=='REVERSED'?'red':orderobject?.status=='WAITING FOR REFUND'?'orange':orderobject?.status=='REFUNDED'?'orange':'purple'}  >{orderobject?.status}</Button>
</HStack>

<VStack>  
{/* OEDER ID , DATE , STATUS */}

<Text width={'100%'} fontSize="sm" fontWeight="light">{`item name : ${orderobject?.item?.name}`}</Text>
<Text width={'100%'} fontSize="sm" fontWeight="light">{`item price : ${orderobject?.item?.price}/${orderobject?.item?. price_unit}`}</Text>
<Text width={'100%'} fontSize="sm" fontWeight="light">{`quantity ordered : ${orderobject?.quantity}`}</Text>
<Text width={'100%'} fontSize="sm" fontWeight="light">{`total paid : ${(orderobject?.item?.price)*orderobject?.quantity}`}</Text>
<Button mt={2}>View item</Button>



{/* <Text fontSize="md" color="gray.500">{`Price: ${orderobject?.price} / ${orderobject?.unit}`}</Text> */}
</VStack>
</VStack>


<Divider mb={4} />

{/* Seller Info SELLER OF THE PRODUCT */}

{/* <Box mb={4}>
<Heading size="sm" mb={2}>Seller Info</Heading>
<VStack   width={'95%'} space={2} alignItems="center" bg="gray.50" p={3} borderRadius="md">
 IMAGE OF THE SHOP 
<Image
source={{uri:`${base_url}/shop_picture/${orderobject?.shop?.image}`}}
alt="shop"
size="lg"
borderRadius="md"
/>
<Text fontWeight="bold">{orderobject?.shop?.name}</Text>
<Text color="gray.500">
{` Location : ${orderobject?.shop?.county?.name} , ${orderobject?.shop?.country?.countryName}`}
</Text>
<Button mt={2}>View Shop</Button>
</VStack>
</Box> */}



{/* Action Buttons will depend on  the type of order eg NEW , CONFIRMED , CANCELED ,ETC */}

{viewingsale &&  
  <>
    {
      confirmerror &&  
      <Text alignSelf={'center'} color={'red.400'} >{confirmerror}</Text>
    }

{
      declineerror &&  
      <Text alignSelf={'center'} color={'red.400'} >{declineerror}</Text>
    }

    
    {orderobject?.status == 'NEW' &&  
    
    <HStack space={4} mb={20}>
    <Button alignItems={'center'} justifyContent={'center'}  onPress={()=>{confirmorder()}} flex={1} colorScheme="green" >
    CONFIRM ORDER
    {
      confirming &&  
      <Spinner color={'white'} alignSelf={'center'} mr={'auto'} ml={'auto'} width={'20px'} height={'20px'}  ></Spinner>
    }
    </Button>
    <Button alignItems={'center'} justifyContent={'center'}   onPress={()=>{declineorder()}} flex={1} variant="outline"  colorScheme={'red'} >
    REJECT ORDER
    {
      declining &&  
      <Spinner color={'white'} alignSelf={'center'} mr={'auto'} ml={'auto'} width={'20px'} height={'20px'}  ></Spinner>
    }
    </Button>
    </HStack>
    }

  </>
}


{viewingpurchase && 

<>
{
  cancelerror &&  
  <Text alignSelf={'center'} color={'red.400'} >{cancelerror}</Text>
}


{orderobject?.status === 'NEW'  &&  
<HStack space={4} mb={20}>
<Button alignItems={'center'} justifyContent={'center'}  onPress={()=>{cancel()}} flex={1} colorScheme="red" >
CANCEL ORDER
{
  cancelling &&  
  <Spinner color={'white'} alignSelf={'center'} mr={'auto'} ml={'auto'} width={'20px'} height={'20px'}  ></Spinner>
}
</Button>

</HStack>
}


</>

}


{viewingpendingpayment &&  
{/* <HStack space={4} mb={20}>
<Button flex={1} colorScheme="red" >
CANCEL ORDER
</Button>
<Button flex={1} variant="outline"  >
Back
</Button>
</HStack> */}

}


{viewingsettled &&  
{/* <HStack space={4} mb={20}>
<Button flex={1} colorScheme="red" >
CANCEL ORDER
</Button>
<Button flex={1} variant="outline"  >
Back
</Button>
</HStack> */}

}



</> 
        )
         
         
         }
        
        </>
         )
         
              
         }


<Button colorScheme={'blue'}  onPress={()=>{navigation.goBack()}} flex={1} variant="outline"  >
Back
</Button>
     
    </ScrollView>
  );
}




