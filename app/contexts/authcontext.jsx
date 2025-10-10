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
         const user = await SecureStore.getItemAsync('user');
         const loggedin = await SecureStore.getItemAsync('loggedin');
         const token = await SecureStore.getItemAsync('token');
    
         setuser(user);
         setloggedin(loggedin);
         settoken(token);
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
            await SecureStore.setItemAsync('loggedin' , true);
           }
           else if (user){
            await SecureStore.setItemAsync('user' , user);
           }
           else if(token){
            await SecureStore.setItemAsync('token' , token);
           }
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
        await SecureStore.setItemAsync('loggedin' , false);
       }
       else if (!user){
        await SecureStore.setItemAsync('user' , null);
       }
       else if(!token){
        await SecureStore.setItemAsync('token' , null);
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