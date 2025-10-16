import React, { useContext, useState } from "react";
import { Alert } from "react-native";
import { Modal, Button, HStack, VStack, Text, Image, Input, Spinner } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { authcontext } from "../../contexts/authcontext";


export default function AddToCartModal({ isOpen, onClose ,viewfromcart , item }) {
  // const [quantity, setQuantity] = useState(1);
  const [adderror , setadderror] = useState(null);
  const [adding , setadding] = useState(false);
  const [added , setadded] = useState(false);
  const {user} = useContext(authcontext);
  const price = 120;
//  const navigation = useNavigation();
  // const increment = () => setQuantity(q => q + 1);
  // const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));



  const addtocart = async function(){
    try{
       if(adding){
        return;
       }
       else{
        setadderror(null);
        setadding(true);
        const res = await fetch(`${base_url}/add_to_cart?user=${user._id}&itemid=${item._id}` , {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          }
        });

        if(res.ok){
          setadding(false);
          setadderror(null);
          setadded(true);
          const info = await res.json();
          const account = info.user;
          onClose();

        }
        else{
          const info = await res.json();
          console.log('response not ok');
          setadding(false);
          if(String(res.status).startsWith('4')){
              setadderror(info.message);
          }
          else{
            setadderror('server error')
          }
        }
       }
    }
    catch(err){
      setadding(false);
      setadderror('could not add');
      console.log('error trying to add to cart' , err);
      return;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.Body>
          <VStack space={4} alignItems="center">
            <Image source={require("../../assets/gmail.jpeg")} alt="product" size="2xl" borderRadius="md"/>
            <Text fontSize="lg" fontWeight="bold">{`Name: ${item?.name}`}</Text>
            <Text fontSize="md" color="gray.500">{`Price: ${item?.price}`}</Text>

            {/* <HStack space={2} alignItems="center">
              <Button onPress={decrement}>-</Button>
              <Input
                value={quantity.toString()}
                onChangeText={(val) => setQuantity(Number(val))}
                keyboardType="numeric"
                textAlign="center"
                w={16}
              />
              <Button onPress={increment}>+</Button>
            </HStack> */}

            {/* <HStack justifyContent="space-between" w="100%">
              <Text fontWeight="bold">Total:</Text>
              <Text fontWeight="bold">${price * quantity}</Text>
            </HStack> */}

            {adderror  &&  
            
              <Text color={'red'} alignSelf={'center'}   >{adderror}</Text>
            }


{added  &&  
            
            <Text color={'green'} alignSelf={'center'}   >added successfully</Text>
          }

            <Button w="100%" colorScheme="teal" onPress={() =>{addtocart}}>
              Confirm
              {adding &&  
              <Spinner  color={'white'} width={'20px'} height={'20px'}        />
              }
            </Button>

            {/* {viewfromcart &&  
            
            <Button w="100%" colorScheme="teal" onPress={()=>{navigation.navigate('see')}}>
            view item
          </Button>
            
            } */}


          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
