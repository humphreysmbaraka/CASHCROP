import React, { useEffect, useState } from "react";
import { ScrollView, Platform, Alert, Keyboard } from "react-native";
import { 
  Box, VStack, Input, Select, CheckIcon, Button, Text, Avatar, Heading, TextArea, Spinner, Pressable 
} from "native-base";
import Constants from "expo-constants";
import base_url from "../constants/baseurl";
import { getareas, getcounties, getcountries } from "../functions/locations";
import CustomModal from "../custommodal";
import AntDesign from '@expo/vector-icons/AntDesign';
import useMediaFunctions from "../functions/mediafunctions";

export default function CreateShop({navigation}) {
  const [name, setName] = useState(null);
  const [type, setType] = useState(null);
  const [customType, setCustomType] = useState('');
  const [description, setdescription] = useState(null);
  const [confirmCard, setConfirmCard] = useState(false);
  const [imageuri , setimageuri] = useState(null);
  const [submiterror , setsubmiterror] = useState(null);
  const [submitting , setsubmitting]  = useState(false);
  const [countries , setcountries] = useState(null);
  const [counties , setcounties] = useState(null);
  const [areas , setareas] = useState(null);
  const [country , setcountry] = useState(null);
  const [county , setcounty] = useState(null);
  const [area , setarea] = useState(null);
  const [showmodal ,setshowmodal] = useState(false);
  const [modaltype  ,setmodaltype] = useState(null);
  // const [creating , setcreating] = useState(false);
  // const [createerror , setcreateerror] = useState[null]
  
 const {launchimagepicker} = useMediaFunctions();
 
  
  useEffect(function(){
   if(!confirmCard){
    setsubmiterror(null);
    setsubmitting(false);
   }
  } , [confirmCard])
       

  const fetchcountries = async function(){
    const countrieslist = await getcountries();
     setcountries(countrieslist);
   }
   
   const fetchcounties = async function(){
     const countieslist = await getcounties(country?.geonameId);
      setcounties(countieslist);
    }
   
    const fetchareas = async function(){
     const arealist = await getareas(country?.countryCode , county?.adminCode1);
      setareas(arealist);
    }
   
     useEffect(function(){
       fetchcountries();
        
     } ,[]);
   
   
     useEffect(function(){
       fetchcounties();
        
     } ,[country]);
   
     useEffect(function(){
       fetchareas();
        
     } ,[county]);
  
  
  const createshop = async function(){
    try{
       if(!name || name.trim() == '' || !type || type.trim() == ''  || !description|| description.trim() == '' ||  !imageuri|| imageuri.trim() == '' ||  !country || !county|| !area){
        setsubmiterror('either some fields have not been filled or are in the wrong format , recheck your data');
        return;
       }
       else{
        setsubmitting(true);
        setsubmiterror(null);

        const data = new FormData();
        data.append('name' , name);
        data.append('type' , type);
        data.append('customtype' , customType );
        data.append('description' , description );
       
        const filename = imageuri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image';

    data.append('image', {
      uri: imageuri,
      name: filename,
      type: fileType,
    });



        // data.append('image' ,  imageuri);
        data.append('country' , country );
        data.append('county' ,  county);
        data.append('area' , area);
         
        const create = await fetch(`${base_url}/create_shop` , {
          method:'POST',
          body:data
        })

        if(create.ok){
          setsubmitting(false);
          setsubmiterror(null);
          const info = await create.json();
          const shop = info.shop;
          navigation.navigate('shop' , {shop});
        }
        else{
          const info = await create.json();
          setsubmitting(false);
          if(String(create.status).startsWith('4')){
          setsubmiterror(info.message);
          }
          else{
            setsubmiterror('server error');
          }
        }
       }
    }
    catch(err){
          setsubmitting(false);
          setsubmiterror('could not create shop');
      console.log('could not create shop' , err);
    }
  }

  return (
    <ScrollView
      style={{ 
        flex: 1, 
        backgroundColor: "white", 
        padding: 10, 
        paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0 
      }}
    >
      <Heading size="lg" mb={4}>
        Create Shop
      </Heading>

      {!confirmCard ? (
        <VStack space={4}>
          {/* <Avatar
            size="2xl"
            bg="gray.300"
            alignSelf="center"
            source={{uri:imageuri || null}}
          >

          </Avatar> */}

<Pressable onPress={async() => {
  const uri = await  launchimagepicker();
  setimageuri(uri);
  } }>
  <Avatar
    size="2xl"
    bg="white"
    borderColor={'black'}
    borderWidth={'1px'}
    alignSelf="center"
    source={{ uri:imageuri || null}}
  >
    {/* Camera icon inside avatar */}
    <AntDesign name="picture" size={60} color="black" />
  </Avatar>
</Pressable>
<Text>select a photo for your shop</Text>

          <Input
            placeholder="Shop Name"
            value={name}
            onChangeText={(val) => setName(val.trim())}
          />

          <Select
            placeholder="Products Type"
            selectedValue={type}
            onValueChange={(val) => setType(val.trim())}
            _selectedItem={{ bg: "teal.600", endIcon: <CheckIcon size={5} /> }}
            
          >
            <Select.Item label="Cereals" value="cereals" />
            <Select.Item label="Meat" value="meat" />
            <Select.Item label="Livestock" value="livestock" />
            <Select.Item label="Vegetables" value="vegetables" />
            <Select.Item label="Other" value="other" />
          </Select>

          {type === "other" && (
            <Input
              placeholder="Specify other type of products you will sell"
              value={customType}
              onChangeText={(val) => setCustomType(val.trim())}
            />
          )}

          <Input
            placeholder="Country"
            value={country?.countryName}
            // onChangeText={(val) => setcountry(val)}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('COUNTRIES');
              Keyboard.dismiss(); // hide keyboard
            }}
          />
          <Input
            placeholder="County"
            value={county?.name}
            // onChangeText={(val) => setcounty(val)}
            isReadOnly={!country?true:false}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('COUNTIES');
              Keyboard.dismiss(); // hide keyboard
            }} 
          />

           <Input
            placeholder="Area"
            value={area?.name}
            // onChangeText={(val) => setarea(val)}
            isReadOnly={!(country && county  )?true:false}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('LOCAL AREAS');
              Keyboard.dismiss(); // hide keyboard
            }}
          />

          <TextArea
            placeholder="Shop Description"
            value={description}
            onChangeText={(val) => setdescription(val.trim())}
            autoCompleteType={false}
            h={20} // default height, will expand as user types
            _focus={{ borderColor: "teal.600" }}
          />

          <Button mb={'60px'} onPress={() => setConfirmCard(true)}>Create</Button>
          <Button mb={'60px'}  onPress={() => navigation.goBack()}>BACK</Button>

          {showmodal &&   
        // <CustomModal    isOpen={showmodal}  onClose={()=>{setshowmodal(false)}}  title={!country?'COUNTRIES':(country && !county)?'COUNTIES':(country && county)?'LOCAL AREAS':''}  items={!country?{countries}:(country && !county)?{counties}:(country && county)?{areas}:''}  setselectedcountry={setcountry} setselectedcounty={setcounty} setselectedarea={setarea}     />
        <CustomModal    isOpen={showmodal}  onClose={()=>{setshowmodal(false)}}  title={modaltype}  items={(modaltype == 'COUNTRIES')?countries:(modaltype == 'COUNTIES')?counties:(modaltype == 'LOCAL AREAS')?areas:[]}  setselectedcountry={setcountry} setselectedcounty={setcounty} setselectedarea={setarea}     />

     }
        </VStack>
      ) : (
        <Box bg="gray.50" p={4} borderRadius="lg" shadow={1}>

            <Avatar
              size="2xl"
            bg="gray.300"
            alignSelf="center"
            source={{uri:imageuri || null}}
          />
          <Text fontWeight="bold">{name}</Text>
          <Text>
            Products Type: {type === "other" ? customType : type}
          </Text>
          <Text>
            Location: {county?.name}, {country?.countryName}
          </Text>
          <Text mt={2}>Description: {description}</Text>

          {submiterror && 
            <Text alignSelf={'center'} color={'red.400'} >{submiterror}</Text>
          }
          {/* <Button mt={2} onPress={() =>{navigation.navigate('shop')}}> */}
          <Button mt={2} onPress={createshop}  alignItems={'center'} justifyContent={'center'} >
            Confirm
            {submitting && 
              <Spinner alignSelf={'center'} mr={'auto'} ml={'auto'}  width={'10px'} height={'10px'} color={'white'}             />
            }
          </Button>
          <Button mt={2} mb={'60px'} variant="ghost" onPress={() => setConfirmCard(false)}>
            Back
          </Button>
        </Box>
      )}
    </ScrollView>
  );
}
