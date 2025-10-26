import React, { createContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store';
const authcontext = createContext();


function AuthProvider({children}) {
    const [loggedin , setloggedin] = useState(false);
    const [user , setuser] = useState(null);
    const [token , settoken] = useState(null);




    useEffect(function(){
      const react = async function(){
       try{
         const storeduser = await SecureStore.getItemAsync('user');
         const storedloggedin = await SecureStore.getItemAsync('loggedin');
         const storedtoken = await SecureStore.getItemAsync('token');
    
         if(storeduser)setuser(JSON.parse(storeduser));
        if(storedloggedin) setloggedin(JSON.parse(storedloggedin));
         if(storedtoken)settoken(storedtoken);
       }
       catch(err){
        console.log('error fetching auth variables in ' , err);
       }
        }
        react();
    } , []);


   useEffect(function(){
        const react = async function(){
         try{
          if(loggedin){
            await SecureStore.setItemAsync('loggedin' , String(true));
           }
           else if (user){
            await SecureStore.setItemAsync('user' , JSON.stringify(user));
           }
           else if(token){
            await SecureStore.setItemAsync('token' , token);
           }

           console.log('values found loggedin , user , token' , loggedin , user ,token);
         }
         catch(err){
          console.log('error reacting to changes in auth variables' , err)
         }
          }

          react();

   } , [user , loggedin , token]);




   useEffect(function(){
    const react = async function(){
     try{
      if(!loggedin){
        await SecureStore.deleteItemAsync('loggedin');
       }
       else if (!user){
        await SecureStore.deleteItemAsync('user');
       }
       else if(!token){
        await SecureStore.deleteItemAsync('token');
       }
     }
     catch(err){
      console.log('error reacting to changes in auth variables' , err)
     }
      }
      react();
} , [user , loggedin , token])



















  return (
   <authcontext.Provider  value = {{loggedin , setloggedin , user , setuser , token , settoken}}>
    {children}
   </authcontext.Provider>
  )
}

export  {AuthProvider ,authcontext}