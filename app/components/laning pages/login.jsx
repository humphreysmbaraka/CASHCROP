import React, { useContext, useEffect, useState } from "react";
import Constants from 'expo-constants';
import { Platform } from "react-native";


import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Heading,
  Avatar,
  Icon,
  Select,
  CheckIcon,
  Radio,
  ZStack,
  Image,
  Alert,
  Spinner,
  HStack,
} from "native-base";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import base_url from "../constants/baseurl";
import { authcontext } from "../../contexts/authcontext";
// import useGettoken from "../functions/get token";
import useNotificationsetup from "../functions/notifications";

export default function Login({navigation}) {
   const {extractpushtoken , getpushtoken} = useNotificationsetup();
    const [email , setemail] = useState(null);
    const [password , setpassword] = useState(null);
    const {loggedin , setloggedin , user , setuser ,settoken , setauthinfo , removeauthinfo} = useContext(authcontext);
    const [loginerror , setloginerror] = useState(null);
    const [sending , setsending] = useState(false);
    
    // const gettoken = useGettoken();
    // const [username , setusername] = useState(null);
    // const [picture , setpicture] = useState(null);
    // const [number , setnumber] = useState(null);
    // const [country, setcountry] = useState(null);
    // const [county , setcounty] = useState(null);
    // const [role , setrole] = useState(null);
    // const [otp , setotp] = useState(null);
 
 

  // const handleNext = () => setStep((prev) => prev + 1);
  // const handleBack = () => setStep((prev) => prev - 1);

  useEffect(function(){  // TO ASK FOR NOTIFICATION PERMISSIONS
        (async function(){
         try{
          

Alert.alert(
  "NOTIFICATIONS PERMISSION REQUIRED",      // Heading / title
  "notifications permission is required for you to continue",  // Message body
  [
    {
      text: "Cancel",    // Button text
     
      style: "cancel"    // Optional: "default", "cancel", or "destructive"
    },
    {
      text: "OK",
      onPress: async function(){
    try{
    await getpushtoken();
    }
    catch(err){
      console.log('error initiating notifications permissions' , err);
    }
      }
    }
  ]
  // { cancelable: true }   // Optional: true = can dismiss by tapping outside
);

         }
         catch(err){
          console.log('culd not trigger a notifications permission prompt')
         }
        })()
  } , [])
 
   const login = async function(){
    try{
        if(sending || !email || email.trim()=='' || !password || password.trim()==''){
           
          if(sending){
            setsending(false);
          }
          return;
        }
        else{
          setsending(true);
          setloginerror(null);
           const expopushtoken = await getpushtoken();
           if(!expopushtoken){
            console.log('cannot push without notification push token');
            return;
           }
            // const fetchedtoken = await gettoken(); // GET THE JWT TOKEN FROM BACK END
          
            const login = await fetch(`${base_url}/log_in` , {
              method : 'POST',
              headers : {'Content-Type' : 'application/json'},
              credentials:'include',
              body : JSON.stringify({email , password , expopushtoken})
            })

            if(login.ok){
                setloginerror(null);
                setsending(false);
                console.log('login successful');
                const info = await login.json();
                // settoken(fetchedtoken);
                // setuser(info.user);
                console.log(info.user);
                // setloggedin(true);
                // settoken(info.token);
                setauthinfo(info.user , info.token , true);
                socket.emit('user register' , info.user , function(){
                  console.log('register event has been received successfully');
                })
               
            }
            else{
                setsending(false);
                const info = await login.json();
                if((String(login.status)).startsWith('4')){
                   setloginerror(info.message);
                }
                else{
                     setloginerror('server error');
                }

                // setuser(null);
                // setloggedin(false);
                // settoken(null);
                removeauthinfo()
    
            }
           
        }
    }
    catch(err){
        console.log('error logging in' ,err);
        setsending(false);
        setloginerror('error logging in');

    }
   }



   const forgot = async function(){
    try{
    
      
          
            const response = await fetch(`${base_url}/forgot_password`)

            if(response.ok){
               console.log('email was sent successfully');
            }
            else{
              console.log('email wsa not sent successfully')
            }
           
      
    }
    catch(err){
          console.log('could not initiate email' , err);
    }
   }


  return (
    <>
    <ZStack flex={1}   bg={'white'}   width={'100%'}  paddingTop={Platform.OS == 'android'?Constants.statusBarHeight:0 }   >
    <Box zIndex={0} width={'100%'} flex={1} bg="white"    >
    <Image width={'100%'} height={'200px'}  key={'profile image'} source={require('../../assets/gmail.jpeg')}    />
   

       
    </Box>
    <Box flex={1}  width={'100%'} position={'absolute'}  mt={'255px'} display={'flex'} flexDirection={'column'} p={'10px'}  >
      <Heading size="lg" mb={6} textAlign="center" color="coolGray.800">
        Log in to your account
      </Heading>

      
      
        <VStack space={4}>
          <Input
            width={'80%'}
            placeholder="Email"
            value={email}
            onChangeText={(val) => setemail(val.trim())}
            variant="outline"
            size="lg"
          />
          <Input
           width={'80%'}
            placeholder="Password"
            type="password"
            value={password}
            onChangeText={(val) => setpassword(val.trim())}
            variant="outline"
            size="lg"
          />
          {(loginerror) &&  
          
             <Text color={'red.300'} alignSelf={'center'} >{loginerror}</Text>
             }
          <Button  mt={6} onPress={login}  width={'50%'} alignSelf={'center'} rounded="xl"  alignItems={'center'} justifyContent={'center'} >
            <HStack alignItems={'center'} justifyContent={'center'} >
           <Text color={'white'}  fontWeight={'bold'} > Login  </Text>
            {(sending) && <Spinner  height={'10px'} width={'10px'}  color={'white'}  />}

            </HStack>
          </Button>



          {/* <Button onPress={forgot} colorScheme={'purple'} mt={6}  width={'50%'} alignSelf={'center'} rounded="xl"  alignItems={'center'} justifyContent={'center'} >
              FORGOT PASSWORD?
          </Button> */}
        </VStack>
    

    
      
    </Box>
    </ZStack>
        
    </>
  );
}
