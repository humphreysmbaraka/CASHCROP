import React, { useContext } from 'react'
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


export default function useNotificationsetup(){


 const getpermissions = async function(){
     try{
        if(!Device.isDevice){
            console.log('notifications only work on devices');
            return false;
        }
        const getpermission = await Notifications.getPermissionsAsync();
    const stat = getpermission.status;
    if(stat !== 'granted'){
        const perm = await Notifications.requestPermissionsAsync();
        const permstatus = perm.status
         if(permstatus !== 'granted'){
            console.log('notifications permission denied');
               return null;
         }
         else{
            console.log('notifications permission granted');
            return true;
         }
    } else{
      console.log('notifications permision already granted');
      return true;
    }
     
}catch(err){
     console.log('error occured while trying to get notification permission' , err);
     throw new Error(err);
    
}
 }



// GETTING TOKEN FOR PUSH NOTIFICATIONS

const getpushtoken = async function(){
    try{
      const permission = await getpermissions();
      if(!permission){
        console.log('could not request for push token for notifications since notification permission is not granted');
        return null;
      } else{
         const token = await Notifications.getExpoPushTokenAsync();
         if(!token){
            console.log('could not get expo push token for notifications');
            return null;
         }
         else{
            return token.data;
         }
      }
    }
    catch(err){
        console.log('error occured when trying to get push token for notifications' , err);
    }
}



const extractpushtoken = async function(){  // GET IT WITHOUT REQUESTING PERMISSIONS
    try{
        if(!Device.isDevice){
            console.log('notifications only work on devices');
            return null;
        }
         const token = await Notifications.getExpoPushTokenAsync();
         if(!token){
            console.log('could not get expo push token for notifications');
            return null;
         }
         else{
           console.log('expo push token was successfully extracted')
            return token.data;
         }
      }
    
    catch(err){
        console.log('error occured when trying to get push token for notifications' , err);
    
    }
}





// LOCAL EXPO NOTIFICATIONS


Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  
  async function sendlocalnotification(title , body) {
    try{
      if(!Device.isDevice){
        console.log('notifications only work on devices');
        return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title:title,
        body:body,
        sound: true,
        // icon: require('./assets/icon.png'), // Android only
      },
      trigger: null, // null = immediately
    });
    }
    catch(err){
      console.log('error sending local notification' , err);
    }
  }






return {getpermissions , getpushtoken , extractpushtoken ,  sendlocalnotification};




    
}