import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Text, Image, Button, Heading, Pressable, Spinner } from "native-base";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AddToCartModal from "./addtocartmodal";
import { authcontext } from "../../contexts/authcontext";
import base_url from "../constants/baseurl";
import Paymodal from "../modals/paymodal";
import { RefreshControl } from "react-native";


export default function CartPage({navigation}) {
  const [activeTab, setActiveTab] = useState("cart");
  const [modalOpen, setModalOpen] = useState(false);
  const {user} = useContext(authcontext);
  const [cartitems , setcartitems] = useState([]);
  const [saveditems , setsaveditems] = useState([]);
  const [selecteditem , setselecteditem] = useState(null);
  const [showpaymodal , setshowpaymodal] = useState(false);
  // removing from cart
  const [removingid , setremovingid] = useState(false);
  const [removeerror , setremoveerror] = useState(null);
  //removing from saved
  const [remerror , setremerror] = useState(null);
  const [remingid , setremingid] = useState(false);
  // save for later

  const [savingid , setsavingid] = useState(false);
  const [savingerror , setsavingerror] = useState(null);

  // move to cart

  const [movingid , setmovingid] = useState(false);
  const [moveerror , setmoveerror] = useState(null);

  // fethig cart items

  const [cartfetch , setcartfetch] = useState(false);
  const [carterr , setcarterr] = useState(null);
 

  // fethig saved items

  const [savedfetch , setsavedfetch] = useState(false);
  const [savederr , setsavederr] = useState(null);
 

  const [buying , setbuying] = useState(false);
  const [buyingerror , setbuyingerror] = useState(null);




  const select = async function(item){
    try{
   setselecteditem(item);
   setModalOpen(true);
    }
    catch(err){
      console.log('could not selece item' , err);
    }
  }


useEffect(function(){
  console.log('CART ITEMS' , cartitems);
  console.log('SAVED ITEMS' , saveditems);
} , [cartitems , saveditems])

   const getcartitems = async function(){
    try{   
      if(cartfetch){
        return
      }
           setcartfetch(true);
           setcarterr(null);
           const cartitems = await fetch(`${base_url}/get_cart_items/${user._id}`);
           if(cartitems.ok){
            setcartfetch(false);
            setcarterr(null);
            const info = await cartitems.json();
            console.log('CART ITEMS...' ,info.items)
            setcartitems(info.items);
           }
           else{
            setcartfetch(false);
            const info = await cartitems.json();
            setcartitems([]);
            if(String(cartitems.status).startsWith('4')){
              setcarterr(info.message);
            }
            else{
              setcarterr('server error');
            }
           }
    }
    catch(err){
      setcartfetch(false);
      setcarterr('could not fetch cart items');
      console.log('could not fetch cart items' ,err);
      setcartitems([]);
      throw new Error(err);
      return;
    }
   }


   const getsaveditems = async function(){
    try{   
         if(savedfetch){
          return
         }
            setsavedfetch(true);
            setsavederr(null);
           const saveditems = await fetch(`${base_url}/get_saved_items/${user._id}`);
           if(saveditems.ok){
            setsavedfetch(false);
            setsavederr(null);
            const info = await saveditems.json();
            setsaveditems(info.items);
           }
           else{
            setsavedfetch(false);
           
            const info = await cartitems.json();
            setsaveditems([]);
            if(String(saveditems.status).startsWith('4')){
              setsavederr(info.message);
            }
            else{
              setsavederr('server error');
            }
           }
    }
    catch(err){
       setsavedfetch(false);
       setsavederr('could not fetch saved items')
      console.log('could not fetch saved items' , err);
      setsaveditems([]);
      throw new Error(err);

     
    }
   }


initiatecartdelete = async function(val){
    Alert.alert(
      'DELETE ITEM',
      'PROCEEd !',

      [
        {
          style:'cancel',
          text:'DELETE',
          onPress: async function(){
            await removefromcart(val);
          }
          
        },
        {

          text:'CANCEL',
          onPress:  function(){
          
          },
          style:'default'
           
        }
      ]
    )
}



initiatesaveddelete = async function(val){
  Alert.alert(
    'DELETE ITEM',
    'PROCEEd !',

    [
      {
        style:'cancel',
        text:'DELETE',
        onPress: async function(){
          await removefromsaved(val);
        }
        
      },
      {

        text:'CANCEL',
        onPress:  function(){
        
        },
        style:'default'
         
      }
    ]
  )
}

 const removefromcart = async function(val){
  try{
      if(removingid){
        return;
      }
      else{
        setremovingid(val._id);
        setremoveerror(null);
        const res = await fetch(`${base_url}/remove_from_cart?user=${user?._id}&item=${val?.item?._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setremovingid(false);
         setremoveerror(null);
         const info = await res.json();
         const newcart = info.cart;
         setcartitems(newcart);
        }
        else{
          const info = await res.json();
          setremovingid(false);
          if(String(res.status).startsWith('4')){
           setremoveerror(res.message);
          }
          else{
            setremoveerror('server error')
          }
        }
      }
      
  }
  catch(err){
    setremovingid(false);
    setremoveerror('error')
    console.log('error removing from cart')
    throw new Error(err);
  }   
 }

  
 

 const removefromsaved = async function(val){
  try{
      if(remingid){
        return;
      }
      else{
        setremingid(val._id);
        setremerror(null);
        const res = await fetch(`${base_url}/remove_from_saved?user=${user?._id}&item=${val?.item?._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setremingid(false);
         setremerror(null);
         const info = await res.json();
         const newsaved = info.saved;
         setsaveditems(newsaved);
        }
        else{
          const info = await res.json();
          setremingid(false);
          if(String(res.status).startsWith('4')){
           setremerror(res.message);
          }
          else{
            setremerror('server error')
          }
        }
      }
      
  }
  catch(err){
    setremingid(false);
    setremerror('error')
    console.log('error removing from saved' , err)
  }
 }






 const movetosaved = async function(val){
  try{
      if(savingid){
        return;
      }
      else{
        setsavingid(val._id);
        setsavingerror(null);
        const res = await fetch(`${base_url}/move_to_saved?user=${user?._id}&item=${val?.item?._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setsavingid(false);
         setsavingerror(null);
         const info = await res.json();
         const newcart = info.cart;
         const newsavedlist = info.saveditems;
         setcartitems(newcart);
         setsaveditems(newsavedlist);
        
        }
        else{
          const info = await res.json();
          setsavingid(false);
          if(String(res.status).startsWith('4')){
           setsavingerror(res.message);
          }
          else{
            setremerror('server error')
          }
        }
      }
      
  }
  catch(err){
    setsavingid(false);
    setsavingerror('error')
    console.log('error moving to saved' , err);
  }
 }




 const movetocart = async function(val){
  try{
      if(movingid){
        return;
      }
      else{
        setmovingid(val._id);
        setmoveerror(null);
        const res = await fetch(`${base_url}/move_to_cart?user=${user?._id}&item=${val?.item?._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setmovingid(false);
         setmoveerror(null);
         const info = await res.json();
         const newsaved = info.saved;
         const newcartlist = info.cart;
         setsaveditems(newsaved);
         setcartitems(newcartlist);
        }
        else{
          const info = await res.json();
          setmovingid(false);
          if(String(res.status).startsWith('4')){
           setmoveerror(res.message);
          }
          else{
            setmoveerror('server error')
          }
        }
      }
      
  }
  catch(err){
    setmovingid(false);
    setmoveerror('error')
    console.log('error moving to cart')
  }
 }







   useEffect(function(){
          const getitems = async function(){
            try{
                await getcartitems();
                await getsaveditems();
            }
            catch(err){
              console.log('error fetching items' , err);
            }
          }

          getitems();
   } , [])

   const [refreshKey, setRefreshKey] = useState(0);

   const [refreshing, setRefreshing] = useState(false);




const onRefresh = async () => {
  setRefreshing(true);
  setRefreshKey(prev => prev + 1);
  await getcartitems();
  await getsaveditems();
  setRefreshing(false);
};
  return (
    <ScrollView key={refreshKey}  style={{ flex: 1, backgroundColor: "white", padding: 10, paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0 , marginBottom:'20px' }}  
    
    refreshControl={
     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    >
      {/* Tabs */}
      <HStack space={4} mb={4} mt={'40px'} >
        <Button flex={1} colorScheme={activeTab === "cart" ? "teal" : "gray"} onPress={() => setActiveTab("cart")}>
          Cart
        </Button>
        <Button flex={1} colorScheme={activeTab === "saved" ? "teal" : "gray"} onPress={() => setActiveTab("saved")}>
          Saved for Later
        </Button>
      </HStack>

      <VStack space={4}  pb={'10px'} >
        {/* Sample Product */}

      {activeTab == 'cart'  ?(


<>

    {cartfetch  &&   
      <VStack mt={'10px'} alignSelf={'center'} mr={'auto'} ml={'auto'} >
        <Spinner color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'} mr={'auto'} ml={'auto'} ></Spinner>
        <Text color={'blue.300'} fontWeight={'light'} alignSelf={'center'} mt={'10px'} mr={'auto'} ml={'auto'} >fetching cart items....</Text>
      </VStack>
    
    }

    {carterr  &&   
             <VStack mt={'10px'} alignSelf={'center'} mr={'auto'} ml={'auto'} >
             {/* <Spinner color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'} mr={'auto'} ml={'auto'} ></Spinner> */}
             <Text color={'red.300'} fontWeight={'light'} alignSelf={'center'} mt={'10px'} mr={'auto'} ml={'auto'} >{carterr}</Text>
             <Button colorScheme="teal" onPress={() => getcartitems()}>Retry</Button>
           </VStack>
    }

        {(!cartitems || cartitems?.length == 0  ) &&  
        
              <Text alignSelf={'center'} mt={'10px'} >no items in your cart yet</Text>
        }

       {cartitems?.map(function(val , ind){
            return (
              <Pressable onPress={() => select(val)} key={val._id} mb={'5px'} >
              <HStack space={4} alignItems="center" bg="gray.50" p={3} borderRadius="md">
                <Image  source={{uri:`${base_url}/item_picture/${val?.item?.image}`}} alt="img" size="lg" borderRadius="md"/>
                <VStack space={'4px'} width={'55%'} flex={1}>
                  <Text width={'90%'} isTruncated={true} fontWeight="bold">{val.item.name}</Text>
                  <Text>{`Price : ${val?.item?.price}    quntity : ${val?.quantity}`}</Text>
                  <Text>{`total : ${val?.item?.price * val?.quantity}`}</Text>
                  {activeTab === "cart" ? (
                    <>
                       {(removeerror && removingid == val._id) && <Text color={'red.500'} fontSize={'xs'} alignSelf={'center'} >{removeerror}</Text>}
                      <Button alignItems={'center'} justifyContent={'center'} colorScheme="red" onPress={()=>{initiatecartdelete(val)}}>DELETE  {(removingid == val._id) && <Spinner  alignSelf={'center'} mr={'auto'} ml={'auto'} color={'white'}  width={'20px'} height={'20px'}       />  }</Button>
                      {(savingerror && savingid == val._id) && <Text color={'red.500'} fontSize={'xs'} alignSelf={'center'} >{savingerror}</Text>}
                      <Button colorScheme="gray"  alignItems={'center'} justifyContent={'center'} onPress={() => movetosaved(val)}>Save for later  {(savingid == val._id)&& <Spinner alignSelf={'center'} mr={'auto'} ml={'auto'} color={'white'}  width={'20px'} height={'20px'}       />  }</Button>
                    </>
                  ) : (
                    <>
                      <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>DELETE</Button>
                      <Button colorScheme="teal" onPress={() => Alert.alert("Move to cart")}>Move to Cart</Button>
                    </>
                  )}
                </VStack>
                {/* <Button colorScheme={'green'} color={'white'} alignSelf={'center'} justifyContent={'center'} alignItems={'center'} >BUY</Button> */}
                {/* <HStack space={2}>
                  {activeTab === "cart" ? (
                    <>
                      <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                      <Button colorScheme="gray" onPress={() => Alert.alert("Save for later")}>Save</Button>
                    </>
                  ) : (
                    <>
                      <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                      <Button colorScheme="teal" onPress={() => Alert.alert("Move to cart")}>Move to Cart</Button>
                    </>
                  )}
                </HStack> */}
              </HStack>
              </Pressable>
            )
         })
        }
</>
      ):(

<>


{savedfetch  &&   
      <VStack mt={'10px'} alignSelf={'center'} mr={'auto'} ml={'auto'} >
        <Spinner color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'} mr={'auto'} ml={'auto'} ></Spinner>
        <Text color={'blue.300'} fontWeight={'light'} alignSelf={'center'} mt={'10px'} mr={'auto'} ml={'auto'} >fetching saved items....</Text>
      </VStack>
    
    }

    {savederr  &&   
             <VStack mt={'10px'} alignSelf={'center'} mr={'auto'} ml={'auto'} >
             {/* <Spinner color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'} mr={'auto'} ml={'auto'} ></Spinner> */}
             <Text color={'red.300'} fontWeight={'light'} alignSelf={'center'} mt={'10px'} mr={'auto'} ml={'auto'} >{savederr}</Text>
             <Button colorScheme="teal" onPress={() => getsaveditems()}>Retry</Button>
           </VStack>
    }
        
        {(!saveditems || saveditems?.length == 0 ) &&  
        
              <Text alignSelf={'center'} mt={'10px'} >you do not have saved items yet</Text>
        }
     { saveditems?.map(function(val , ind){
        return(
          <Pressable onPress={() => select(val)}>
          <HStack space={4} alignItems="center" bg="gray.50" p={3} borderRadius="md">
            <Image source={{uri:`${base_url}/item_picture/${val?.item?.image}`}} alt="product" size="lg" borderRadius="md"/>
            <VStack space={'4px'} width={'70%'} flex={1}>
              <Text width={'90%'} isTruncated={true} fontWeight="bold">{val?.item?.name}</Text>
              <Text>{`Total: ${val?.item?.price}`}</Text>
              {activeTab === "cart" ? (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>DELETE</Button>
                  <Button colorScheme="gray" onPress={() => Alert.alert("Save for later")}>Save for later</Button>
                </>
              ) : (
                <>
                {(remerror && remingid== val._id ) &&  <Text color={'red'} fontSize={'xs'} alignSelf={'center'} >{remerror}</Text>}
                  <Button colorScheme="red"  alignItems={'center'} justifyContent={'center'} onPress={() =>{initiatesaveddelete(val)}}>DELETE  {(remingid == val._id) && <Spinner  alignSelf={'center'} mr={'auto'} ml={'auto'} color={'white'}  width={'20px'} height={'20px'}       />  }</Button>
                  {(moveerror && movingid == val._id) &&  <Text color={'red'} fontSize={'xs'} alignSelf={'center'} >{moveerror}</Text>}
                  <Button justifyContent={'center'} alignItems={'center'} colorScheme="teal" onPress={() => movetocart(val)}>Move to Cart  {(movingid == val._id) && <Spinner  alignSelf={'center'} mr={'auto'} ml={'auto'} color={'white'}  width={'20px'} height={'20px'}       />  }  </Button>
                </>
              )}
            </VStack>
            {/* <HStack space={2}>
              {activeTab === "cart" ? (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="gray" onPress={() => Alert.alert("Save for later")}>Save</Button>
                </>
              ) : (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="teal" onPress={() => Alert.alert("Move to cart")}>Move to Cart</Button>
                </>
              )}
            </HStack> */}
          </HStack>
          </Pressable>
        )
     })
    }

</>

      )}











          {/* INITIAL SETUP */}
        {/* <Pressable onPress={() => setModalOpen(true)}>
          <HStack space={4} alignItems="center" bg="gray.50" p={3} borderRadius="md">
            <Image source={require("../../assets/gmail.jpeg")} alt="product" size="lg" borderRadius="md"/>
            <VStack space={'4px'} width={'70%'} flex={1}>
              <Text width={'90%'} isTruncated={true} fontWeight="bold">Item Name</Text>
              <Text>Total: $120</Text>
              {activeTab === "cart" ? (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="gray" onPress={() => Alert.alert("Save for later")}>Save for later</Button>
                </>
              ) : (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>Remove</Button>
                  <Button colorScheme="teal" onPress={() => Alert.alert("Move to cart")}>Move to Cart</Button>
                </>
              )}
            </VStack>
           
          </HStack>
        </Pressable> */}
      </VStack>

     {/* {(activeTab=='cart') && 
     
     <Button mt={6} colorScheme="teal" w="100%" onPress={() => Alert.alert("Checkout pressed")}>
     Checkout
   </Button>}

      <AddToCartModal viewfromcart={true} isOpen={modalOpen} onClose={() => setModalOpen(false)} item={selecteditem} /> */}

      {modalOpen   &&  
            <AddToCartModal setcart={setcartitems} showpaymodal={setshowpaymodal}  navigation={navigation} viewfromcart={true} isOpen={modalOpen} onClose={() => setModalOpen(false)} item={cartitems?.find(function(val , ind){
               return val.item._id.toString() == selecteditem?.item._id;
            })} /> 

      }

{showpaymodal  &&  
          <Paymodal     navigation={navigation}    isOpen={showpaymodal} onClose={function(){setshowpaymodal(false)}}           item={cartitems?.find(function(val , ind){
            return val.item._id.toString() == selecteditem?.item._id;
         })}                                  />

      }
    </ScrollView>
  );
}
