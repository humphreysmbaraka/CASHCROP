import React, { createContext, useEffect, useRef, useState } from 'react'
const socketcontext = createContext();
// socket.js (create a separate file for socket connection)
import { io } from "socket.io-client";
import base_url from '../components/constants/baseurl';
import useNotificationsetup from '../components/functions/notifications';



function SOCKET_PROVIDER({children}) {
 
  const SOCKET_URL = `${base_url}`; // Your backend URL
  const {sendlocalnotification} = useNotificationsetup();
  const [socketref , setsocketref] = useState(null);
// Create socket connection
// const socket = io(SOCKET_URL, {
//   transports: ["websocket"], // Recommended for mobile / Render deployment
//   autoConnect: false,        // We’ll connect manually
// });


useEffect(() => {
  // Connect socket

   const  socket = io(SOCKET_URL, {
      transports: ["websocket"], // Recommended for mobile / Render deployment
      autoConnect: true,        // We’ll connect manually
    });
   

  // socket.connect();

  // Listen for connection
  socket.on("connect", () => {
    console.log("Connected to server, socket ID:", socket.id);
  });

  setsocketref(socket);
  // socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("disconnect", () => console.log("Disconnected"));
socket.on("connect_error", (err) => console.log("Connect error:",err ,  err.message));
socket.on("connect_timeout", () => console.log("Connection timeout"));

  // ORDER HAS BEEN CONFIRMED BY SELLER

   socket.on('confirmed order' ,  async function(data){
    try{
      sendlocalnotification('ORDER CONFIRMED' , `your order ${data} has been confirmed , and is now awaiting dispatch`)
    }
    catch(err){
      console.log('error occured while processing confirmed order socket  event' , err)
    }
   })

   socket.on('confirmation'   , async function(data){
    try{
      sendlocalnotification('ORDER CONFIRMED' , `you have successfully confirmed the order ${data} has been confirmed , and is now awaiting dispatch`)
    }
    catch(err){
      console.log('error occured while processing confirmation socket  event' , err)
    }
   }
)
   // ORDER HAS BEEN DECLINED BY SELLER
   socket.on('declined order'  , async function(data){
    try{
      sendlocalnotification('ORDER DECLINED' , `your order ${data} has been declined by the seller , you will be refunded in 48 hours`)
    }
    catch(err){
      console.log('error occured while processing declined order socket  event' , err)
    }
   }
 )

   socket.on('declination'   , async function(data){
    try{
      sendlocalnotification('ORDER DECLINED' , `you have successfully declined the order ${data} has been declined by the seller , you will be refunded in 48 hours`)
    }
    catch(err){
      console.log('error occured while processing declination socket  event' , err)
    }
   }
)
   // ORDER HAS BEEN CANCELLED BY BUYER
   socket.on('cancelled order'  , async function(data){
    try{
      sendlocalnotification('ORDER CANCELLED' , `the  order ${data} has been declined by the seller , you will be refunded in 48 hours`)
    }
    catch(err){
      console.log('error occured while processing cancelled order socket  event' , err)
    }
   } )

   // AFTER CANCELLING ORDER
   socket.on('cancellation'  , async function(data){
    try{
      sendlocalnotification('ORDER CANCELLED' , `you have successfully cancelled the   order ${data} has been declined by the seller , you will be refunded in 48 hours`)
    }
    catch(err){
      console.log('error occured while processing cancellation socket  event' , err)
    }
   } )


   // RESPONSE FROM TEST EVENT FROM SERVER
   socket.on('testresponse'  , async function(){
    try{
      sendlocalnotification('TEST SUCCESSFUL' , `you have successfully tested your sockets`)
    }
    catch(err){
      console.log('error occured in testresponse  event' , err)
    }
   } )


  // Cleanup on unmount
  return () => {
    socket.disconnect();
  };
}, []);


  return (
   <socketcontext.Provider  value = {{socket:socketref}} >
    {children}
   </socketcontext.Provider>
  )
}

export {SOCKET_PROVIDER , socketcontext}