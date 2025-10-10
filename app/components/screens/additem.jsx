import React, { useRef, useState } from "react";
import { ScrollView, Alert , Platform } from "react-native";
import { Box, VStack, Input, Button, Avatar, Select, CheckIcon, Text, Heading, TextArea, Spinner, HStack , Pressable  } from "native-base";
import Constants from 'expo-constants'
import base_url from "../constants/baseurl";
import { MaterialIcons , Entypo } from "@expo/vector-icons";
import useMediaFunctions  from "../functions/mediafunctions";
import {CameraView} from 'expo-camera';




export default function AddItem({navigation}) {
    const [imageuri , setimageuri] = useState(null);
    const [name ,setname] = useState(null);
    const [type ,settype] = useState(null);
    const [description ,setdescription] = useState(null);
    const [quantity ,setquantity] = useState(null);
    const [unit ,setunit] = useState(null);
    const [price ,setprice] = useState(null);
    const [priceunit ,setpriceunit] = useState(null);
    const [creating , setcreating] = useState(null);
    const [createerror , setcreateerror] = useState(null);
    const [showcam , setshowcam] = useState(false);
    const camref = useRef(null);
    const [camdirection , setcamdirection] = useState('front');
    const [camflash , setcamflash] = useState('off');
   
  const [confirmCard, setConfirmCard] = useState(false);
  const {launchcamera ,launchimagepicker , takepicture} = useMediaFunctions();






  const accessgallery = async function(){
    try{
      const image = await launchimagepicker();
      setimageuri(image);
    }
    catch(err){
      console.log('could not launch gallery' , err);
    }
  }


  const accesscam = async function(){
    try{
     const camaccess = await launchcamera();
     setshowcam(camaccess);
    }
    catch(err){
      console.log('error accessing camera' , err)
    }
  }


   const capture = async function(){
     const image = await takepicture(camref?.current);
     setimageuri(image);

   }
  


  const createitem = async function(){
    try{
      if(!imageuri || !name || name.trim()=='' || !description|| description.trim()=='' || !quantity || quantity.trim()=='' || isNaN(quantity) || !unit || unit.trim()=='' || !price || price.trim()=='' || isNaN(price) || !priceunit || priceunit.trim()==''){
        setcreateerror('check the data you provided , some could be missing , or in the wrong format');
        return;
      }
      setcreating(true);
      setcreateerror(null);
      const data = new FormData();
      data.append("name" ,name );
      data.append("type" ,type );
      data.append("description" ,description );
      data.append("quantity" ,quantity );
      data.append("unit" ,unit );
      data.append("price" ,price );
      data.append("priceunit" ,priceunit );
      data.append("image" ,imageuri );
      // data.append("" , );


      const create = await fetch(`${base_url}/add_item` , {
        method:'POST',
        body:data
      })
      if(create.ok){
        setcreating(false);
        setcreateerror(null);
        const info = await create.json();
      }
      else{
        setcreating(false);
        const info = await create.json();
        if(String(info.status).startsWith('4')){
     setcreateerror(info.message);
        }
        else{
 setcreateerror('server error');
        }
      }
    }
    catch(err){
      console.log('could not add item' , err);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10  , paddingTop:Platform.OS=='android'?Constants.statusBarHeight:0}}>
      <Heading size="lg" mb={4}>Add Item</Heading>

      {!confirmCard ? (
        <VStack space={4}>
          <Avatar size="2xl" bg="gray.300" alignSelf="center" source={{uri:imageuri || undefined}} />
          <Text mt={'10px'} alignSelf={'center'}   >provide an image for the product</Text>

          {imageuri &&  
            <>
             <Button  onPress={()=>{setimageuri(null)}}  colorScheme={'red'} alignSelf={'center'} width={'35px'} height={'35px'} borderRadius={'50%'} alignItems={'center'} justifyContent={'center'}  padding={'2px'} >
              X
            </Button>

           <Text mt={'10px'} alignSelf={'center'} fontWeight={'thin'}  >clear selected image</Text>
            </>

           }





    <HStack   space={8} alignItems="center" justifyContent="center" mt={4} alignSelf={'center'} width={'90%'} >
      {/* Camera Icon */}
      <Pressable  onPress ={accesscam}>
        {({ isPressed }) => (
          <MaterialIcons
            name="photo-camera"
            size={32}
            color={isPressed ? "#3b82f6" : "#374151"} // blue.500 : gray.700
          />
        )}
      </Pressable>

      {/* Gallery Icon */}
      <Pressable onPress={accessgallery}>
        {({ isPressed }) => (
          <MaterialIcons
            name="photo-library"
            size={32}
            color={isPressed ? "#3b82f6" : "#374151"}
          />
        )}
      </Pressable>
    </HStack>
  



   {showcam    &&   
    <CameraView  ref={camref}  flashMode={camflash} style={{width:'90%' , alignSelf:'center' ,height:'500px' , borderRadius:'10px' , borderWidth:0 , position:'relative'}}  >
       <HStack position={'absolute'} top={0}  alignSelf={'center'} alignItems={'center'} space={'20px'}  width={'100%'} height={'35px'} borderWidth={0} background={'none'}   >
                            <Pressable onPress={()=>{
                              setcamdirection(function(prev){
                                 if(prev == 'front'){
                                  return 'back'
                                 }
                                 else{
                                  return 'front'
                                 }
                              })
                            }} bg={'transparent'}  ><MaterialIcons size={30} color={'white'} name={'cameraswitch'} /></Pressable>
                           <Pressable  onPress={()=>{
                             setcamflash(function(prev){
                              if(prev == 'off'){
                                return 'on';
                              }
                              else{
                                return 'off';
                              }
                             })
                           }} bg={'transparent'}  ><Entypo size={30} color={'white'} name={'flash'} /></Pressable>
       </HStack>


       <HStack  position={'absolute'} bottom={0}   alignSelf={'center'} alignItems={'center'} space={'20px'}  width={'100%'} height={'50px'} borderWidth={0} background={'none'}   >
       <Pressable onPress={capture} bg={'transparent'}  ><MaterialIcons size={40} color={'white'} name={'camera'} /></Pressable>
       </HStack>

    </CameraView>
   
   
   
   }






          <Input placeholder="Product Name" value={name} onChangeText={(val) => setname(val.trim())} />
          <Input placeholder="Product Category eg cerial,beverage,livestock,machine etc" value={type} onChangeText={(val) => settype(val.trim())} />

          {/* <Input placeholder="Description" value={item.description} onChangeText={(val) => setItem({ ...item, description: val })} /> */}
          <TextArea
            placeholder="item Description"
            value={description}
            onChangeText={(val) => setdescription(val.trim())}
            autoCompleteType={false}
            h={20} // default height, will expand as user types
            _focus={{ borderColor: "teal.600" }}
          />
          <Input placeholder="Quantity" value={quantity} onChangeText={(val) => setquantity(val.trim())} />
          <Input placeholder="Unit (kg, number, etc)" value={unit} onChangeText={(val) => setunit(val)} />
          <Input placeholder="Price" value={price} onChangeText={(val) => setprice(val.trim())} />
          <Input placeholder="Price per (kg, number, etc)" value={priceunit} onChangeText={(val) => setpriceunit(val.trim())} />

          <Button mb={'60px'} onPress={() => setConfirmCard(true)}>Add Item</Button>
        </VStack>
      ) : (
        <Box bg="gray.50" p={4} borderRadius="lg" shadow={1}>
           <Avatar size="2xl" bg="gray.300" alignSelf="center" source={{uri:imageuri || undefined}} />
          <Text fontWeight="bold">{name}</Text>
          <Text>Description: {description}</Text>
          <Text>Qty: {quantity} {unit}</Text>
          <Text>Price: {price}</Text>
          <Text>Price per: {priceunit}</Text>
           
             {createerror && 
             <Text color={'red'} alignSelf={'center'}  fontSize={'sm'}  >{createerror}</Text>
             }
          {/* <Button mt={2} onPress={() => {navigation.navigate('shopstacks' , {screen:'shop'})}}>Confirm
          {creating &&  
            <Spinner        color={'white'} width={'30px'} height={'30px'}                  />
           }

          </Button> */}
           <Button mt={2} onPress={() => {createitem}}>Confirm
          {creating &&  
            <Spinner        color={'white'} width={'30px'} height={'30px'}                  />
           }

          </Button>
          <Button mt={2} mb={'60px'} onPress={() => setConfirmCard(false)}>Back</Button>
        </Box>
      )}
    </ScrollView>
  );
}
