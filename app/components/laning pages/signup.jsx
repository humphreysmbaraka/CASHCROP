import React, { useContext, useEffect, useState } from "react";
import Constants from 'expo-constants';
import { Keyboard, Platform } from "react-native";
// import * as MediaLibrary from 'expo-media-library';
// import * as ImagePicker from 'expo-image-picker';
import useMediaFunctions  from "../functions/mediafunctions";

import {Box,VStack,Input,Button,Text,Heading,Avatar,Icon,Select,CheckIcon,Radio,ZStack,Image, Alert, Spinner,} from "native-base";

import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authcontext } from "../../contexts/authcontext";
import CustomModal from "../custommodal";
import { getareas, getcounties, getcountries } from "../functions/locations";
import base_url from "../constants/baseurl";
import useVerifyToken from "../functions/verifytoken";
import useGettoken from "../functions/get token";

export default function Signup({navigation}) {
   const {loggedin , setloggedin ,user , setuser ,token ,settoken} = useContext(authcontext);
    const [email , setemail] = useState(null);
    const [password , setpassword] = useState(null);
    const [username , setusername] = useState(null);
    const [number , setnumber] = useState(null);
    const [role , setrole] = useState(null);
    const [otp , setotp] = useState(null);
  const [step, setStep] = useState(1);
  const [imageuri , setimageuri] = useState(null);
  const [showmodal , setshowmodal] = useState(false);
  const [modaltype , setmodaltype] = useState(null);
  const [countries , setcountries] = useState([]);
  const [counties , setcounties] = useState([]);
  const [areas , setareas] = useState([]);
  const [selectedcountry , setselectedcountry] = useState(null);
  const [selectedcounty , setselectedcounty] = useState(null);
  const [selectedarea , setselectedarea] = useState(null);
  const [sending , setsending] = useState(false);
  const [verifying , setverifying] = useState(false);
  const [submiterror , setsubmiterror] = useState(null);
  const [verificationerror , setverificationerror] = useState(null);
  const {launchimagepicker} = useMediaFunctions();

  const verifytoken = useVerifyToken();
  const gettoken = useGettoken();
 
  
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const imagepicker = async function(){
    try{
       const uri = await launchimagepicker(several=false);
       setimageuri(uri);
    }
    catch(err){
    
      console.log('could not access image picker' , err);
    }
  }
  
const fetchcountries = async function(){
 const countrieslist = await getcountries();
  setcountries(countrieslist);
}

const fetchcounties = async function(){
  const countieslist = await getcounties(selectedcountry?.geonameId);
   setcounties(countieslist);
 }

 const fetchareas = async function(){
  const arealist = await getareas(selectedcountry?.countryCode , selectedcounty?.adminCode1);
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


 



  const submit = async function(){
    try{
      if(!email || email.trim()== "" || !password || password.trim()== "" || !username || username.trim()== "" || !number || number.trim()== "" || isNaN(number) || !role|| role.trim()== "" || !selectedcountry  || !selectedcounty ||  !selectedarea ){
        setsubmiterror('either a field is missing , or is in the wrong format ,check the values you provided')
        return;
      }
      else{
        setsubmiterror(null);
        setsending(true);
        await gettoken();
        if(imageuri){
          const data = new FormData();
          data.append('email' ,email );
          data.append('password' , password );
          data.append('username' , username );
          data.append('number' , number);
          data.append('role' , role);
          data.append('image' ,imageuri );
          data.append('country' , JSON.stringify(selectedcountry) );
          data.append('county' ,JSON.stringify(selectedcounty) );
          data.append('area' ,JSON.stringify(selectedarea) );
          
          const create =await fetch(`${base_url}/create_account` , {
            method:'POST',
            body:data
          });
          if(create.ok){
            setsending(false);
            setsubmiterror(null);
            const info = await create.json();
            const user = info.user;
            setuser(user);

          }
          else{
           setsending(false);
           const info = await create.json();
           if(String(info.status).startsWith('4')){
            setsubmiterror(info.message);
           }
           else{
            setsubmiterror('server error');
           }
          }
        }
        else{
          const create =await fetch(`${base_url}/create_account` , {
            method:'POST',
            headers : {
              'Content-Type':'application/json'
            },
            body:JSON.stringify({email ,password , username , number , selectedcountry , selectedcounty ,selectedarea , role})
          });
          if(create.ok){
            setsending(false);
            setsubmiterror(null);
            const info = await create.json();
             handleNext();
          }
          else{
           setsending(false);
           const info = await create.json();
           if(String(info.status).startsWith('4')){
            setsubmiterror(info.message);
           }
           else{
            setsubmiterror('server error');
           }
          }
        }
        

      }
    }
    catch(err){
      console.log('error submitting credentials' , err);
    }
  }




  const verifyotp = async function(){
     if(!otp || otp.trim()==''){
      return;
     }
     else{
       setverifying(true);
      const verify = await fetch(`${base_url}/verify_otp?id=${user._id}&otp=${otp.trim()}`);
      if(verify.ok){
        setverifying(false);
        setverificationerror(null);
         const info = await verify.json();
         handleNext();
      }
      else{
        setverifying(false);
       
        const info = await verify.json();
        if(String(info.status).startsWith('4')){
          setverificationerror(info.message);
        }
        else{
          setverificationerror('server error');
        }

      }
     }
  }

  

const images = [
    require('../../assets/gmail.jpeg')   , require('../../assets/account.png') ,  require('../../assets/map.jpeg') ,  require('../../assets/admin2.png') , require('../../assets/verification.png') , require('../../assets/verified.png')
]


  return (
    <>
    <ZStack flex={1}   bg={'white'}   width={'100%'}  paddingTop={Platform.OS == 'android'?Constants.statusBarHeight:0 }   >
    <Box zIndex={0} width={'100%'} flex={1} bg="white"    >
    <Image  key={step} alt={step ==1?'gmail':step==2?'profile':step==3?'location':'role'}  width={'100%'}  position={'absolute'} top={0} height={'250px'} source={images[step - 1]}     />
   

       
    </Box>
    <Box flex={1}  width={'100%'} position={'absolute'}  mt={'255px'} display={'flex'} flexDirection={'column'} p={'10px'}  >
      <Heading size="lg" mb={6} textAlign="center" color="coolGray.800">
        Step {step} of 6
      </Heading>

      {/** STEP 1: Email + Password */}
      {step === 1 && (
        <VStack space={4}>
          <Input
            width={'80%'}
            placeholder="Email"
            value={email}
            onChangeText={(val) => setemail(val)}
            variant="outline"
            size="lg"
          />
          <Input
           width={'80%'}
            placeholder="Password"
            type="password"
            value={password}
            onChangeText={(val) => setpassword(val)}
            variant="outline"
            size="lg"
          />
          <Button mt={6}  onPress={handleNext} width={'50%'} alignSelf={'center'} rounded="xl">
            Next
          </Button>
        </VStack>
      )}

      {/** STEP 2: Personal Details */}
      {step === 2  && (
        <VStack space={4}>
          <TouchableOpacity
            onPress={imagepicker}
            style={{ alignSelf: "center" }}
          >
            <Avatar
              size="xl"
              bg="coolGray.300"
              source={{uri:imageuri || undefined}}
            >
             
            </Avatar>
          </TouchableOpacity>

          <Text mt={'-10px'}  alignSelf={'center'} fontWeight={'bold'}  >select profile picture</Text>

          {imageuri && 
              <>
              <Button mt={6} colorScheme={'red'} width={'30px'} height={'30px'}  borderRadius={'50%'} color={'white'} alignSelf={'center'} onPress={()=>{setimageuri(null)}} >
              X
            </Button>
           <Text mt={'10px'}  alignSelf={'center'} fontSize={'small'} fontWeight={'bold'}  >clear selected image</Text>


              </>
          }

          <Input
           width={'80%'}
            placeholder="Username"
            value={username}
            onChangeText={(val) => setusername(val.trim())}
            variant="outline"
            size="lg"
          />
          <Input
           width={'80%'}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={number}
            onChangeText={(val) => setnumber(val.trim())}
            variant="outline"
            size="lg"
          />

          <Button mt={6} onPress={handleNext}    width={'50%'} alignSelf={'center'}  rounded="xl">
            Next
          </Button>
          <Button variant="ghost"  width={'50%'} alignSelf={'center'}  onPress={handleBack}>
            Back
          </Button>
        </VStack>
      )}

      {/** STEP 3: Location */}
      {step === 3 && (
        <VStack space={4}>
          <Input
           width={'80%'}
            value={selectedcountry?.countryName}
            minWidth="200"
            placeholder="Select Country" 
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('COUNTRIES');
              Keyboard.dismiss(); // hide keyboard
            }}
         />
           
        

          <Input
           width={'80%'}
            // selectedValue={county} 
            minWidth="200"
            placeholder="Select County"
            isReadOnly={!selectedcountry?true:false}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('COUNTIES');
              Keyboard.dismiss(); // hide keyboard
            }} 
            value={selectedcounty?.name}
          />
        

        <Input
           width={'80%'}
            // selectedValue={selectedarea} 
            minWidth="200"
            placeholder="Select Area"
            // isReadOnly={true}
            isReadOnly={!(selectedcountry && selectedcounty  )?true:false}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('LOCAL AREAS');
              Keyboard.dismiss(); // hide keyboard
            }}
            value={selectedarea?.name}
          />
        

          <Button mt={6} onPress={handleNext}   width={'50%'} alignSelf={'center'}  rounded="xl">
            Next
          </Button>
          <Button variant="ghost"     width={'50%'} alignSelf={'center'} onPress={handleBack}>
            Back
          </Button>
        </VStack>
      )}

      {/** STEP 4: Roles */}
      {step === 4 && (
        <VStack space={4}>
          <Text fontSize="md" mb={2}>
            Select Your Role
          </Text>
          <Radio.Group
            name="roleGroup"
            value={role}
            onChange={(val) => setrole(val)}
          >
            <Radio value="seller" my={1}>
              Seller
            </Radio>
            <Radio value="buyer" my={1}>
              Buyer
            </Radio>

            <Radio value="later" my={1}>
              i will decide later
            </Radio>

          </Radio.Group>
            

          {submiterror &&
              <Text color={'red.600'} fontSize={'sm'} alignSelf={'center'} >{submiterror}</Text>
              }
          <Button mt={6} colorScheme="teal" rounded="xl"  justifyContent={'center'} alignItems={'center'}  width={'50%'} alignSelf={'center'}  onPress={submit}>
            Complete Setup
            {sending && 
                  <Spinner   alignSelf={'center'} ml={'auto'} mr={'auto'}   color={'white'} width={'30px'} height={'30px'}       />
                }
          </Button>
          <Button variant="ghost"    width={'50%'} alignSelf={'center'}   onPress={handleBack}>
            Back
          </Button>
        </VStack>
      )}



       {/** STEP 5: OTP Verification */}
       {step === 5 && (
            <VStack space={4}>
              <Text textAlign="center" fontSize="md">
                Enter the OTP sent to your email
              </Text>
              <Input
                width={'80%'}
                placeholder="Enter OTP"
                keyboardType="numeric"
                value={otp}
                onChangeText={(val) => setotp(val)}
                variant="outline"
                size="lg"
              />

              {verificationerror &&
              <Text color={'red.600'} fontSize={'sm'} alignSelf={'center'} >{verificationerror}</Text>
              }
              <Button mt={6} colorScheme="teal" rounded="xl" width={'50%'} alignSelf={'center'} onPress={verifyotp}>
                Verify OTP
                {verifying && 
                  <Spinner      color={'white'} width={'30px'} height={'30px'}       />
                }
              </Button>
              <Button variant="ghost" width={'50%'} alignSelf={'center'} onPress={handleBack}>
                Back
              </Button>
            </VStack>
          )}

          {/** STEP 6: Welcome Screen */}
          {step === 6 && (
            <VStack space={6} alignItems="center" justifyContent="center" flex={1}>
              <Heading size="lg" textAlign="center">
                Welcome to CashCrop
              </Heading>
              <Text fontSize="md" textAlign="center" px={4}>
                Connect with sellers and buyers across the nation to build a strong agricultural ecosystem.
              </Text>
              <Button mt={6} colorScheme="teal" rounded="xl" width={'50%'} alignSelf={'center'} onPress={()=>{setloggedin(true)}} >
                Begin
              </Button>
            </VStack>
          )}
    </Box>
     {showmodal &&   
        <CustomModal    isOpen={showmodal}  onClose={()=>{setshowmodal(false)}}  title={modaltype}  items={(modaltype == 'COUNTRIES')?countries:(modaltype == 'COUNTIES')?counties:(modaltype == 'LOCAL AREAS')?areas:[]}  setselectedcountry={setselectedcountry} setselectedcounty={setselectedcounty} setselectedarea={setselectedarea}     />
     }
    </ZStack>
        
    </>
  );
}
