import React, { createContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store';
import base_url from '../components/constants/baseurl';
const authcontext = createContext();


function AuthProvider({children}) {
    const [loggedin , setloggedin] = useState(false);
    const [user , setuser] = useState(null);
    const [token , settoken] = useState(null);
    const [loading , setloading] = useState(true);




  


    useEffect(function(){   // FETCH STORED VALUES ON FIRST MOUNT
      (async function(){
         const userinfo = await SecureStore.getItemAsync('user');
         const loggedininfo = await SecureStore.getItemAsync('loggedin');
         const tokeninfo = await SecureStore.getItemAsync('token');

         if(!userinfo || !loggedininfo || !tokeninfo){
          console.log('some auth info was missing in securestore')
          await SecureStore.deleteItemAsync('loggedin');
          await SecureStore.deleteItemAsync('user');
          await SecureStore.deleteItemAsync('token');
                 await removeauthinfo();
         }
         else{
          setuser(JSON.parse(userinfo));
          setloggedin(loggedininfo === 'true');
          settoken(tokeninfo);
          setloading(false)
          await tokenverification();
         }
      })()

  } , [])


    const removeauthinfo = async function(){
     try{
      setuser(null);
      settoken(null);
      setloggedin(false);
      setloading(false);

      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('loggedin');
      await SecureStore.deleteItemAsync('token');
     }catch(err){
      console.log('error removing auth info' , err);
      return
     }
    }

    const setauthinfo = async function(user , token , loggedin){
     
      try{
        setuser(user);
        settoken(String(token));
        setloggedin(loggedin);
        setloading(false);
  
        await SecureStore.setItemAsync('user' , JSON.stringify(user));
        await SecureStore.setItemAsync('loggedin' , String(loggedin));
        await SecureStore.setItemAsync('token' , String(token))
      }catch(err){
        console.log('error setting  auth info' , err);
        return;
      }
   }


    const tokenverification = async function(){   // FUNCTION TO VALIDATE TOKEN
      try{
        const token = await SecureStore.getItemAsync('token');
        if(!token){
          console.log('no token was foud in securestore');
          return;
        }
     const response  = await fetch(`${base_url}/token_validation` , {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({token})
     })

     if(response.ok){
      const info = await response.json();
      console.log('token verified successfully');
      // setuser(info.user);
      // setloggedin(true);
      // settoken(token);
      await setauthinfo(info.user , token , true );
      // await SecureStore.setItemAsync('user' , JSON.stringify(info.user));
     }
     else{
      // setloggedin(false);
      // setuser(null);
      // settoken(null);
      await removeauthinfo();

      if(String(response.status).startsWith('4')){
        console.log('token verification returned a status 400 response');
        // await SecureStore.deleteItemAsync('loggedin');
        // await SecureStore.deleteItemAsync('user');
        // await SecureStore.deleteItemAsync('token');
        
      }
      else{
        console.log('server error occured when verifying token');
        // await SecureStore.deleteItemAsync('loggedin');
        // await SecureStore.deleteItemAsync('user');
        // await SecureStore.deleteItemAsync('token');
      }
     }
      }catch(err){
        console.log('could not initiate token verification' ,err);
        throw new Error(err);
      }
    }
  







    // useEffect(() => {
    //   if (loggedin && user && token) {
    //       SecureStore.setItemAsync('loggedin', 'true');
    //       SecureStore.setItemAsync('user', JSON.stringify(user));
    //       SecureStore.setItemAsync('token', token);
    //   } else {
    //       SecureStore.deleteItemAsync('loggedin');
    //       SecureStore.deleteItemAsync('user');
    //       SecureStore.deleteItemAsync('token');
    //   }
    // }, [loggedin, user, token]);
    



















  return (
   <authcontext.Provider  value = {{loading , loggedin , setloggedin , user , setuser , token , settoken ,setauthinfo , removeauthinfo}}>
    {children}
   </authcontext.Provider>
  )
}

export  {AuthProvider ,authcontext}