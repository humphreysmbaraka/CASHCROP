import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Text, Image, Button, Heading, Pressable, Spinner } from "native-base";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AddToCartModal from "./addtocartmodal";
import { authcontext } from "../../contexts/authcontext";
import base_url from "../constants/baseurl";


export default function CartPage() {
  const [activeTab, setActiveTab] = useState("cart");
  const [modalOpen, setModalOpen] = useState(false);
  const {user} = useContext(authcontext);
  const [cartitems , setcartitems] = useState([]);
  const [saveditems , setsaveditems] = useState([]);
  const [selecteditem , setselecteditem] = useState(null);
  // removing from cart
  const [removing , setremoving] = useState(false);
  const [removeerror , setremoveerror] = useState(null);
  //removing from saved
  const [remerror , setremerror] = useState(null);
  const [reming , setreming] = useState(false);
  // save for later

  const [saving , setsaving] = useState(false);
  const [savingerror , setsavingerror] = useState(null);

  // move to cart

  const [moving , setmoving] = useState(false);
  const [moveerror , setmoveerror] = useState(null);

  // fethig cart items

  const [cartfetch , setcartfetch] = useState(false);
  const [carterr , setcarterr] = useState(null);
 

  // fethig saved items

  const [savedfetch , setsavedfetch] = useState(false);
  const [savederr , setsavederr] = useState(null);
 

  const [buying , setbuying] = useState(false);
  const [buyingerror , setbuyingerror] = useState(null);
  const initiatepurchase = async function(){
    try{
    setbuying(true);
    setbuyingerror(null);

    const response = await fetch(`${base_url}/make_stk_pusk` , {
      method:'POST',
      body: JSON.stringify({userid:user._id , item:selecteditem._id ,quantity })
    })

    if(response.ok){
      setbuying(false);
      setbuyingerror(null);
      const info = await response.json();
    }
    else{
      const info = await response.json();
      setbuying(false);
      if(String(response.status).startsWith('4')){
           setbuyingerror(info.message);
      }
      else{
          setbuyingerror('server error');
      }
    }
    }
    catch(err){
      console.log('could not initiae payment');
      setbuying(false);
      setbuyingerror('error');
    }
  }

  const select = async function(item){
    try{
   setselecteditem(item);
   setModalOpen(true);
    }
    catch(err){
      console.log('could not selece item' , err);
    }
  }




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





 const removefromcart = async function(val){
  try{
      if(removing){
        return;
      }
      else{
        setremoving(true);
        setremoveerror(null);
        const res = await fetch(`${base_url}/remove_from_cart?user=${user?._id}&item=${val._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setremoving(false);
         setremoveerror(null);
         const info = await res.json();
         const newcart = info.cart;
         setcartitems(newcart);
        }
        else{
          const info = await res.json();
          setremoving(false);
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
    setremoving(false);
    setremoveerror('error')
    console.log('error removing from cart')
  }
 }


 

 const removefromsaved = async function(val){
  try{
      if(reming){
        return;
      }
      else{
        setreming(true);
        setremerror(null);
        const res = await fetch(`${base_url}/remove_from_saved?user=${user?._id}&item=${val._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setreming(false);
         setremerror(null);
         const info = await res.json();
         const newsaved = info.saved;
         setsaveditems(newsaved);
        }
        else{
          const info = await res.json();
          setreming(false);
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
    setreming(false);
    setremerror('error')
    console.log('error removing from saved')
  }
 }






 const movetosaved = async function(val){
  try{
      if(saving){
        return;
      }
      else{
        setsaving(true);
        setsavingerror(null);
        const res = await fetch(`${base_url}/save_for_later?user=${user?._id}&item=${val._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setsaving(false);
         setsavingerror(null);
         const info = await res.json();
         const newcart = info.cart;
         setcartitems(newcart);
        }
        else{
          const info = await res.json();
          setsaving(false);
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
    setsaving(false);
    setsavingerror('error')
    console.log('error moving to saved')
  }
 }




 const movetocart = async function(val){
  try{
      if(moving){
        return;
      }
      else{
        setmoving(true);
        setmoveerror(null);
        const res = await fetch(`${base_url}/move_to_cart?user=${user?._id}&item=${val._id}` , {
          method:'PATCH',
          headers:{
            'Content-Type': 'application/json'
          }
        })
  
        if(res.ok){
         setmoving(false);
         setmoveerror(null);
         const info = await res.json();
         const newsaved = info.saved;
         setsaveditems(newsaved);
        }
        else{
          const info = await res.json();
          setmoving(false);
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
    setmoving(false);
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10, paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0 }}>
      {/* Tabs */}
      <HStack space={4} mb={4} mt={'40px'} >
        <Button flex={1} colorScheme={activeTab === "cart" ? "teal" : "gray"} onPress={() => setActiveTab("cart")}>
          Cart
        </Button>
        <Button flex={1} colorScheme={activeTab === "saved" ? "teal" : "gray"} onPress={() => setActiveTab("saved")}>
          Saved for Later
        </Button>
      </HStack>

      <VStack space={4}>
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
              <Pressable onPress={() => select(val)} key={val._id} >
              <HStack space={4} alignItems="center" bg="gray.50" p={3} borderRadius="md">
                <Image  source={{uri:`${base_url}/item_picture/${val.item.image}`}} alt="img" size="lg" borderRadius="md"/>
                <VStack space={'4px'} width={'55%'} flex={1}>
                  <Text width={'90%'} isTruncated={true} fontWeight="bold">val.item.name</Text>
                  <Text>{`Price : ${val.item.price}`}</Text>
                  {activeTab === "cart" ? (
                    <>
                       {removeerror && <Text color={'red.500'} fontSize={'xs'} alignSelf={'center'} >{removeerror}</Text>}
                      <Button alignItems={'center'} justifyContent={'center'} colorScheme="red" onPress={()=>{removefromcart(val)}}>DELETE  {removing && <Spinner  color={'white'}  width={'20px'} height={'20px'}       />  }</Button>
                      {savingerror && <Text color={'red.500'} fontSize={'xs'} alignSelf={'center'} >{savingerror}</Text>}
                      <Button colorScheme="gray" onPress={() => movetosaved(val)}>Save for later  {saving && <Spinner  color={'white'}  width={'20px'} height={'20px'}       />  }</Button>
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
          <Pressable onPress={() => setModalOpen(true)}>
          <HStack space={4} alignItems="center" bg="gray.50" p={3} borderRadius="md">
            <Image source={{uri:`${base_url}/item_picture/`}} alt="product" size="lg" borderRadius="md"/>
            <VStack space={'4px'} width={'70%'} flex={1}>
              <Text width={'90%'} isTruncated={true} fontWeight="bold">Item Name</Text>
              <Text>Total: $120</Text>
              {activeTab === "cart" ? (
                <>
                  <Button colorScheme="red" onPress={() => Alert.alert("Remove clicked")}>DELETE</Button>
                  <Button colorScheme="gray" onPress={() => Alert.alert("Save for later")}>Save for later</Button>
                </>
              ) : (
                <>
                {remerror &&  <Text color={'red'} fontSize={'xs'} alignSelf={'center'} >{remerror}</Text>}
                  <Button colorScheme="red" onPress={() =>{removefromsaved(val)}}>DELETE  {reming && <Spinner  color={'white'}  width={'20px'} height={'20px'}       />  }</Button>
                  {moveerror &&  <Text color={'red'} fontSize={'xs'} alignSelf={'center'} >{moveerror}</Text>}
                  <Button colorScheme="teal" onPress={() => movetocart(val)}>Move to Cart  {moving && <Spinner  color={'white'}  width={'20px'} height={'20px'}       />  }  </Button>
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
            <AddToCartModal setcart={setcartitems} viewfromcart={true} isOpen={modalOpen} onClose={() => setModalOpen(false)} item={cartitems?.find(function(val , ind){
               return val.item._id.toString() == selecteditem?.item._id;
            })} /> 

      }
    </ScrollView>
  );
}
