import React, { useEffect, useState } from "react";
import { ScrollView, Platform, Alert } from "react-native";
import { 
  Box, VStack, Input, Select, CheckIcon, Button, Text, Avatar, Heading, TextArea, Spinner 
} from "native-base";
import Constants from "expo-constants";
import base_url from "../constants/baseurl";
import { getareas, getcounties, getcountries } from "../functions/locations";

export default function CreateShop({navigation}) {
  const [name, setName] = useState(null);
  const [type, setType] = useState(null);
  const [customType, setCustomType] = useState('');
  const [description, setdescription] = useState(null);
  const [confirmCard, setConfirmCard] = useState(false);
  const [imageuri , setimageuri] = useState(null);
  const [submiterror , setsubmiterror] = useState(null);
  const [submitting , setsubmitting]  = useState(false);
  const [counties , setcounties] = useState(null);
  const [areas , setareas] = useState(null);
  const [country , setcountry] = useState(null);
  const [county , setcounty] = useState(null);
  const [area , setarea] = useState(null);
  const [showmodal ,setshowmodal] = useState(false);
  

  
  
  useEffect(function(){

  })
       

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
        
     } ,[selectedcountry]);
   
     useEffect(function(){
       fetchareas();
        
     } ,[selectedcounty]);
  
  
  const createshop = async function(){
    try{
       if(!name || name.trim == '' || !type || type.trim == '' ||  !customType || !description|| description.trim == '' ||  !imageuri|| imageuri.trim == '' ||  !country || !county|| !area){
        setsubmiterror('either some fields have not been filled or are in the wrong format , recheck your ata');
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
        data.append('image' ,  imageuri);
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
          if(String(info.status).startsWith('4')){
          setsubmiterror(info.message);
          }
          else{
            setsubmiterror('server error');
          }
        }
       }
    }
    catch(err){
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
          <Avatar
            size="2xl"
            bg="gray.300"
            alignSelf="center"
            source={require("../../assets/gmail.jpeg")}
          />

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
            value={country}
            onChangeText={(val) => setcountry(val)}
          />
          <Input
            placeholder="County"
            value={county}
            onChangeText={(val) => setcounty(val)}
          />

           <Input
            placeholder="Area"
            value={area}
            onChangeText={(val) => setarea(val)}
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
        <CustomModal    isOpen={showmodal}  onClose={()=>{setshowmodal(false)}}  title={!selectedcountry?'COUNTRIES':(selectedcountry && !selectedcounty)?'COUNTIES':(selectedcountry && selectedcounty)?'LOCAL AREAS':''}  items={!selectedcountry?{countries}:(selectedcountry && !selectedcounty)?{counties}:(selectedcountry && selectedcounty)?{areas}:''}  setselectedcountry setselectedcounty setselectedarea     />
     }
        </VStack>
      ) : (
        <Box bg="gray.50" p={4} borderRadius="lg" shadow={1}>

            <Avatar
              size="2xl"
            bg="gray.300"
            alignSelf="center"
            source={require("../../assets/gmail.jpeg")}
          />
          <Text fontWeight="bold">{name}</Text>
          <Text>
            Products Type: {type === "other" ? customType : type}
          </Text>
          <Text>
            Location: {county}, {country}
          </Text>
          <Text mt={2}>Description: {description}</Text>

          {submiterror && 
            <Text alignSelf={'center'} color={'red.400'} >{submiterror}</Text>
          }
          {/* <Button mt={2} onPress={() =>{navigation.navigate('shop')}}> */}
          <Button mt={2} onPress={createshop}>
            Confirm
            {submitting && 
              <Spinner   width={'30px'} height={'30px'} color={'white'}             />
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
