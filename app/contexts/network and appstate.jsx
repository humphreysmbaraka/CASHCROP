import React, { createContext, useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
const Connection = createContext();


function NETWORK_PROVIDER({children}) {
   
    const [connected , setconnected] = useState(false);
    const [appstate , setappstate] = useState(AppState.currentState); 

  
      useEffect(function(){

        // CHECK NETWORK CONNECTION
        const unsubscribe = NetInfo.addEventListener(function(state){
            setconnected(state.isConnected)
     })

     // CHECK STATE OF PP

      const stateofapp = AppState.addEventListener('change' , function(nextstate){
        setappstate(nextstate);
      })

         return function(){
            unsubscribe();
            stateofapp.remove();
         };
      } ,[]);
  return (
      <Connection.Provider  value={{connected , setconnected , appstate , setappstate}} >
         {children}
      </Connection.Provider>
  )
}

export default NETWORK_PROVIDER