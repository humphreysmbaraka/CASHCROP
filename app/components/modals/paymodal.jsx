import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { Modal, Button, HStack, VStack, Text, Image, Input, Spinner, Pressable, Select, Radio } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { authcontext } from "../../contexts/authcontext";
import base_url from "../constants/baseurl";
import AntDesign from '@expo/vector-icons/AntDesign';
import { setItem } from "expo-secure-store";


export default function Paymodal({ isOpen, onClose  , item  , navigation }) {

    const [currentitem , setcurrentitem]= useState(null);

    useEffect(function(){
        
          if(item){
            setcurrentitem(item);
          }
        
      } , [item])
    
const [calling , setcalling] = useState(false);
const [callerror , setcallerror] = useState(null);

 

  const callpaypage = async function(){
    try{
      if(calling){
        return;
      }
      else{
        setcalling(true);
        setcallerror(null);

        const response = await fetch(`${base_url}/call_checkout_page` , {
          method:'POST',
          headers:{
            'Content-Type' : 'application/json'
          },
          body:JSON.stringify({item:currentitem._id , user:user._id ,quantity:item.quantity})
        })

        if(response.ok){
          setcalling(false);
          setcallerror(null);
          const info = await response.json();
          // returned info
          const url = info.url;
          navigation.navigate('purchase' , {url})

        }
        else{
          setcalling(false);
          const info = await response.json();
          if(String(response.ststus).startsWith('4')){
            setcallerror(info.message);
          }
          else{
            setcallerror('server error');
          }
        }
      }
    }
    catch(err){
      setcalling(false);
      setcallerror('error');
      console.log('could not call pay page' , err);
    }
  }


 
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxH={'900px'} overflow={'auto'} >
      <Modal.Content maxWidth="400px">
        <Modal.Body>
          <VStack space={4} alignItems="center">
            

            
            
            <VStack width={'98%'} >
           

            
              {/* SELECT DELIVERY STATION */}

              <VStack bg={'gray.100'} width={'90%'} space={5} alignItems={'center'} alignSelf={'center'} >
              <Text fontWeight={'light'} >select delivery destination</Text>
              
               <HStack  width={'98%'} alignItems={'center'} justifyContent={'space-around'} >
                  <Select>
                    <Select.Item></Select.Item>
                  </Select>
               </HStack>
               <Text>no need for transport , will pick it myself</Text>
               <Radio               />
              </VStack>

              {/*  OTHER CHARGES */}
              <VStack bg={'gray.100'} width={'90%'} space={5} alignItems={'center'} alignSelf={'center'} >
              <Text fontWeight={'light'} >other charges</Text>
              <Text fontWeight={'light'} >{`DELIVERY : ${currentitem?.price * item?.quantity}`}</Text>
              <Text fontWeight={'light'} >{`TRANSACTION COSTS`}</Text>
              <Text fontWeight={'light'} >{`Mpesa patment`}</Text>
              <Text fontWeight={'light'} >{`local card payment`}</Text>
              <Text fontWeight={'light'} >{`international card payment`}</Text>
              <Text fontWeight={'light'} >{`disbursement : mpesa:   bank:  international card:`}</Text>

              </VStack>


       {/* TOTAL PRICE */}

       <VStack bg={'gray.100'} width={'90%'} space={5} alignItems={'center'} alignSelf={'center'} >
              <Text fontWeight={'light'} >{`price : ${currentitem?.price}            quantity : ${item.quantity}`}</Text>
              <Text fontWeight={'light'} >{`TOTAL PRICE : ${currentitem?.price * item?.quantity}`}</Text>
               <HStack  width={'98%'} alignItems={'center'} justifyContent={'space-around'} >
               <Button onPress={()=>{navigation.navigate('see' , {screen:'view' , params:{item:currentitem}})}} colorScheme={'green'}  width={'45%'} color={'white'} alignSelf={'center'} justifyContent={'center'}  alignItems={'center'} >view</Button>
                
               <Button  onPress={()=>{ callpaypage()}} colorScheme={'green'}  width={'45%'} color={'white'} alignSelf={'center'} justifyContent={'center'}  alignItems={'center'} >BUY 
               {calling &&  <Spinner width={'15px'} height={'15px'} color={'white'} mr={'auto'} ml={'auto'} />} </Button>
               </HStack>
              </VStack>

                  {callerror  &&  
                  <Text color={'red.600'} fontWeight={'light'} fontSize={'sm'} alignSelf={'center'} mt={'10px'} mb={'2px'} >{callerror}</Text>
                  }
              <HStack width={'98%'} alignSelf={'center'} justifyContent={'space-around'} alignItems={'center'} p={'2px'}  >
                <Button colorScheme={'red'} color={'white'} onPress={()=>{onclose()}}  >CANCEL</Button>
                <Button  justifyContent={'center'} alignItems={'center'}  colorScheme={'blue'} color={'white'} onPress={()=>{callpaypage()}}  >
                    CONFIRM
                    {calling && <Spinner    color={'white'} width={'20px'} height={'20px'} alignSelf={'center'} mr={'auto'} ml={'auto'}                 />}
                    </Button>
              </HStack>
          
              
           </VStack>

           
            

           

          

           


          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
