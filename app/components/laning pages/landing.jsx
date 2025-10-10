import { Button, Image, Text, VStack, ZStack } from 'native-base'
import React from 'react'
import Constants from 'expo-constants';
import { StatusBar } from 'native-base';
import { Platform } from 'react-native';
// import {LiquidGlassButton} from 'react-native-liquid-glass';

function Landing({navigation}) {
  return (
 <ZStack  width={'100%'} flex={1} backgroundColor={'white'}  display={'flex'} flexDirection={'column'}  alignItems={'center'}  paddingTop={Platform.OS == 'android'?Constants.statusBarHeight:0 }  >
   <Image zIndex={0} source={require('../../assets/account.png')} position={'absolute'} borderColor={'green.300'} borderWidth={'1px'} width={'100%'} height={'180px'} />
    <VStack   zIndex={1} position={'absolute'} width={'100%'} height={'10000px'}  mt={'190px'}  space={'40px'} display={'flex'} flexDirection={'column'} alignItems={'center'} >
        <Text  fontSize={'xs'} color={'black'} >Already have an account?</Text>
        <Button  width={'50%'} colorScheme={'green'} onPress={()=>{navigation.navigate('login')}} >LOG_IN </Button>
        <Text>Don't  have an account yet?</Text>
        <Button width={'50%'} colorScheme={'green'} onPress={()=>{navigation.navigate('signup')}}  >SIGN_UP </Button>
      
        
    </VStack>
 </ZStack>
  )
}

export default Landing