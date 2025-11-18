import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { Modal, Button, HStack, VStack, Text, Image, Input, Spinner, Pressable, Select, Radio } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { authcontext } from "../../contexts/authcontext";
import base_url from "../constants/baseurl";
import AntDesign from '@expo/vector-icons/AntDesign';
import { setItem } from "expo-secure-store";


export default function AddToCartModal({ showpaymodal , isOpen, onClose ,viewfromcart , item  ,setcart , navigation }) {
  // const [quantity, setQuantity] = useState(1);

  const [adderror , setadderror] = useState(null);
  const [adding , setadding] = useState(false);
  const [added , setadded] = useState(false);
  const [creasing , setcreasing] = useState(false);
  const [creaseerror , setcreaseerror]  = useState(null)
  const {user , setuser} = useContext(authcontext);
  const price = 120;
  const [currentitem , setcurrentitem]= useState(null);

  useEffect(function(){
    if(viewfromcart){
      setcurrentitem(item?.item);
    }
    else{
      setcurrentitem(item);
    }
  } , [item])

  const decrement = async function(){
    try{
         if(creasing){
          return;
         }

         setcreasing(true);
         setcreaseerror(null)
      const response = await fetch(`${base_url}/decrement_cart_item` , {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({user:user._id , item:currentitem?._id})
      })

      if(response.ok){
        setcreasing(false);
        setcreaseerror(null)
        const info = await response.json();
        const  cart = info.cart;
        setcart(cart);

        
      }
      else{
        const info = await response.json();
         setcreasing(false);
        if(String(response.status).startsWith('4')){
          setcreaseerror(info.message);
        }
        else{
          setcreaseerror('server error')
        }
      }
    }
    catch(err){
      console.log('could not decrement');
      setcreasing(false);
      setcreaseerror('error')
    }
  }


  const increment = async function(){
    try{
         if(creasing){
          return;
         }

         setcreasing(true);
         setcreaseerror(null)
      const response = await fetch(`${base_url}/increment_cart_item` , {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({user:user._id , item:currentitem?._id})
      })

      if(response.ok){
        setcreasing(false);
        setcreaseerror(null)
        const info = await response.json();
        const  cart = info.cart;
        setcart(cart);

      }
      else{
        const info = await response.json();
         setcreasing(false);
        if(String(response.status).startsWith('4')){
          setcreaseerror(info.message);
        }
        else{
          setcreaseerror('server error')
        }
      }
    }
    catch(err){
      console.log('could not increment');
      setcreasing(false);
      setcreaseerror('error')
    }
  }

  const addtocart = async function(){
    try{
       if(adding){
        return;
       }
       else{
        setadderror(null);
        setadding(true);
        const res = await fetch(`${base_url}/add_to_cart?user=${user._id}&itemid=${currentitem?._id}` , {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          }
        });

        if(res.ok){
          setadding(false);
          setadderror(null);
          setadded(true);
          const info = await res.json();
          const account = info.user;
          onClose();

        }
        else{
          const info = await res.json();
          console.log('response not ok');
          setadding(false);
          if(String(res.status).startsWith('4')){
              setadderror(info.message);
          }
          else{
            setadderror('server error')
          }
        }
       }
    }
    catch(err){
      setadding(false);
      setadderror('could not add');
      console.log('error trying to add to cart' , err);
      return;
    }
  }











  return (
    <Modal isOpen={isOpen} onClose={onClose} maxH={'900px'} overflow={'auto'} >
      <Modal.Content maxWidth="400px">
        <Modal.Body>
          <VStack space={4} alignItems="center">
            <Image source={{uri:`${base_url}/item_picture/${currentitem?.image}`}} alt="product" size="2xl" borderRadius="md"/>
            <Text fontSize="lg" fontWeight="bold">{`Name: ${currentitem?.name}`}</Text>
            <Text fontSize="md" color="gray.500">{`Price: ${currentitem?.price}`}</Text>

            {viewfromcart &&  
            
            <VStack width={'98%'} >
              {creaseerror &&  
               <Text alignSelf={'center'} ml={'auto'} mr={'auto'} color={'red.600'} fontWeight={'light'} >{creaseerror}</Text>
              
              }
            <HStack  width={'90%'} space={5} alignItems={'center'} alignSelf={'center'} justifyContent={'space-between'} >
            <Pressable width={'50px'} height={'50px'} bg={'gray.300'} borderRadius={'5px'} justifyContent={'center'} alignItems={'center'} onPress={decrement} ><AntDesign name="minus" size={24} color="black" /></Pressable>
             {creasing ? (
                <Spinner  color={'blue'} width={'20px'} height={'20px'}   />
             ):(
              <Text>{item?.quantity}</Text>
             )}
              <Pressable   width={'50px'} height={'50px'} bg={'gray.300'} borderRadius={'5px'} justifyContent={'center'} alignItems={'center'} onPress={increment} ><AntDesign name="plus" size={24} color="black" /></Pressable>
            </HStack>

              <VStack bg={'gray.100'} width={'90%'} space={5} alignItems={'center'} alignSelf={'center'} >
              <Text fontWeight={'light'} >{`price : ${currentitem?.price}            quantity : ${item.quantity}`}</Text>
              <Text fontWeight={'light'} >{`TOTAL PRICE : ${currentitem?.price * item?.quantity}`}</Text>
               <HStack  width={'98%'} alignItems={'center'} justifyContent={'space-around'} >
               <Button onPress={()=>{navigation.navigate('see' , {screen:'view' , params:{item:currentitem}})}} colorScheme={'green'}  width={'45%'} color={'white'} alignSelf={'center'} justifyContent={'center'}  alignItems={'center'} >view</Button>
                
               <Button  onPress={()=>{
                onClose();
                showpaymodal(true);
                }} colorScheme={'green'}  width={'45%'} color={'white'} alignSelf={'center'} justifyContent={'center'}  alignItems={'center'} >BUY 
                </Button>
               </HStack>
              </VStack>

              {/* SELECT DELIVERY STATION */}

              {/* <VStack bg={'gray.100'} width={'90%'} space={5} alignItems={'center'} alignSelf={'center'} >
              <Text fontWeight={'light'} >select delivery destination</Text>
              
               <HStack  width={'98%'} alignItems={'center'} justifyContent={'space-around'} >
                  <Select>
                    <Select.Item></Select.Item>
                  </Select>
               </HStack>
               <Text>no need for transport , will pick it myself</Text>
               <Radio               />
              </VStack> */}

              {/*  OTHER CHARGES */}
              {/* <VStack bg={'gray.100'} width={'90%'} space={5} alignItems={'center'} alignSelf={'center'} >
              <Text fontWeight={'light'} >other charges</Text>
              <Text fontWeight={'light'} >{`DELIVERY : ${currentitem?.price * item?.quantity}`}</Text>
              <Text fontWeight={'light'} >{`TRANSACTION COSTS`}</Text>
              <Text fontWeight={'light'} >{`Mpesa patment`}</Text>
              <Text fontWeight={'light'} >{`local card payment`}</Text>
              <Text fontWeight={'light'} >{`international card payment`}</Text>
              <Text fontWeight={'light'} >{`disbursement : mpesa:   bank:  international card:`}</Text>






              
              </VStack> */}
               {/* {callerror &&  
                 <Text  alignSelf={'center'} mt={'5px'} color={'red.600'} fontWeight={'light'}  >{callerror}</Text>
               } */}
           </VStack>

           
            }

            {adderror  &&  
            
              <Text color={'red.600'} alignSelf={'center'}   >{adderror}</Text>
            }


{added  &&  
            
            <Text color={'green'} alignSelf={'center'}   >added successfully</Text>
          }

           {!viewfromcart &&   
           
           <Button w="100%" colorScheme="teal"  alignItems={'center'} justifyContent={'center'} onPress={() =>{added?onClose():addtocart()}}>
           {added?'OK':'ADD TO CART'}
           {adding &&  
           <Spinner  ml={'auto'} mr={'auto'} color={'white'} width={'20px'} height={'20px'}        />
           }
         </Button>
              
              }

            {/* {viewfromcart &&  
            
            <Button w="100%" colorScheme="teal" onPress={()=>{navigation.navigate('see')}}>
            view item
          </Button>
            
            } */}


          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
