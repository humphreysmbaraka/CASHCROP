import React, { useContext, useState } from "react";
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
} from "native-base";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import base_url from "../constants/baseurl";
import { authcontext } from "../../contexts/authcontext";
import useGettoken from "../functions/get token";

export default function Login({navigation}) {
    const [email , setemail] = useState(null);
    const [password , setpassword] = useState(null);
    const {loggedin , setloggedin , user , setuser} = useContext(authcontext);
    const [loginerror , setloginerror] = useState(null);
    const [sending , setsending] = useState(false);
    
    const gettoken = useGettoken();
    // const [username , setusername] = useState(null);
    // const [picture , setpicture] = useState(null);
    // const [number , setnumber] = useState(null);
    // const [country, setcountry] = useState(null);
    // const [county , setcounty] = useState(null);
    // const [role , setrole] = useState(null);
    // const [otp , setotp] = useState(null);
 
 

  // const handleNext = () => setStep((prev) => prev + 1);
  // const handleBack = () => setStep((prev) => prev - 1);
 
   const login = async function(){
    try{
        if(sending || !email || email.trim()=='' || !password || password.trim()==''){
            return;
        }
        else{
            await gettoken();
            setsending(true);
            setloginerror(null);
            const login = await fetch(`${base_url}/log_in` , {
              method : 'POST',
              headers : {'Content-Type' : 'application/json'},
              credentials:'include',
              body : JSON.stringify({email , password})
            })

            if(login.ok){
                setloginerror(null);
                setsending(false);
                console.log('login successful');
                const info = await login.json();
                setuser(info.user);
                setloggedin(true);
            }
            else{
                setsending(false);
                const info = await login.json();
                if((String(info.status)).startsWith('4')){
                   setloginerror(info.message);
                }
                else{
                     setloginerror('server error');
                }
            }
            setuser(null);
            setloggedin(false);

        }
    }
    catch(err){
        console.log('error logging in' ,err);

    }
   }

// const images = [
//     require('../../assets/gmail.jpeg')   , require('../../assets/account.png') ,  require('../../assets/map.jpeg') ,  require('../../assets/admin2.png') , require('../../assets/verification.png') , require('../../assets/verified.png')
// ]


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
          <Button mt={6} onPress={login}  width={'50%'} alignSelf={'center'} rounded="xl">
            Login  {sending && 
             <Spinner  height={'20px'} width={'20px'}  color={'white'}  />
            }
          </Button>
        </VStack>
    

    
      
    </Box>
    </ZStack>
        
    </>
  );
}
