import React, { useState } from "react";
import { Alert } from "react-native";
import { Modal, Button, HStack, VStack, Text, Image, Input } from "native-base";
import { useNavigation } from "@react-navigation/native";


export default function AddToCartModal({ isOpen, onClose ,viewfromcart }) {
  const [quantity, setQuantity] = useState(1);
  const price = 120;
 const navigation = useNavigation();
  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.Body>
          <VStack space={4} alignItems="center">
            <Image source={require("../../assets/gmail.jpeg")} alt="product" size="2xl" borderRadius="md"/>
            <Text fontSize="lg" fontWeight="bold">Item Name</Text>
            <Text fontSize="md" color="gray.500">Price: ${price}</Text>

            <HStack space={2} alignItems="center">
              <Button onPress={decrement}>-</Button>
              <Input
                value={quantity.toString()}
                onChangeText={(val) => setQuantity(Number(val))}
                keyboardType="numeric"
                textAlign="center"
                w={16}
              />
              <Button onPress={increment}>+</Button>
            </HStack>

            <HStack justifyContent="space-between" w="100%">
              <Text fontWeight="bold">Total:</Text>
              <Text fontWeight="bold">${price * quantity}</Text>
            </HStack>

            <Button w="100%" colorScheme="teal" onPress={() => Alert.alert("Confirm")}>
              Confirm
            </Button>

            {viewfromcart &&  
            
            <Button w="100%" colorScheme="teal" onPress={()=>{navigation.navigate('see')}}>
            view item
          </Button>
            
            }


          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
