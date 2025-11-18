import React, { useContext, useEffect, useState } from "react";
import { Modal, Button, HStack, VStack, Text, Spinner, Select, Radio, Checkbox } from "native-base";
import { authcontext } from "../../contexts/authcontext";
import base_url from "../constants/baseurl";

export default function Paymodal({ isOpen, onClose, item, navigation }) {
  const { user } = useContext(authcontext);
  const [currentitem, setcurrentitem] = useState(null);
  const [selfpick , setselfpick] = useState(undefined);

  useEffect(() => {
    if (item) setcurrentitem(item);
  }, [item]);

  console.log('ITEM' , item);
  console.log('CURRENTITEM' , currentitem);


  const [calling, setcalling] = useState(false);
  const [callerror, setcallerror] = useState(null);

  const callpaypage = async function () {
    try {
      if (calling) return;
      setcalling(true);
      setcallerror(null);

      const response = await fetch(`${base_url}/call_checkout_page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: currentitem._id, user: user._id, quantity: item.quantity }),
      });

      if (response.ok) {
        setcalling(false);
        const info = await response.json();
        const url = info.url;
        navigation.navigate("purchase", { url });
      } else {
        setcalling(false);
        const info = await response.json();
        if (String(response.status).startsWith("4")) setcallerror(info.message);
        else setcallerror("Server error");
      }
    } catch (err) {
      setcalling(false);
      setcallerror("Error");
      console.log("Could not call pay page", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} justifyContent="center" alignItems="center">
      <Modal.Content  width={'350px'} height={'900px'} overflow={'auto'} borderRadius="15px"  alignSelf="center">
        <Modal.Body  width={'100%'} >
          <VStack space={6} alignItems="center" justifyContent="center">
            {/* Delivery Section */}
            <VStack
              bg="gray.100"
              p="4"
              width={"100%"}
              borderRadius="md"
              space={4}
              alignItems="center"
            >
              

          

             {!selfpick &&   
              <>
              <Text fontSize="md" fontWeight="bold">
                Select Delivery Destination
              </Text>

              <VStack w="100%" space={'2px'} justifyContent="center" alignItems="center" >
                <Select flex={1} width={'90%'} placeholder="Choose county">
                  <Select.Item label="Station 1" value="station1" />
                  <Select.Item label="Station 2" value="station2" />
                </Select>

                <Select flex={1} width={'90%'} placeholder="Choose pick up station">
                  <Select.Item label="Station 1" value="station1" />
                  <Select.Item label="Station 2" value="station2" />
                </Select>
              </VStack>
              </>  
             }

            
            </VStack>

            <HStack alignItems="center" space={2}>
              <Checkbox
        isChecked={selfpick}
        onChange={(val) => setselfpick(val)}
      
      >
    
      </Checkbox>

                <Text fontSize="sm">No need for transport, will pick it myself</Text>
              </HStack>

            {/* Other Charges Section */}
            <VStack
              bg="gray.100"
              p="4"
              w="100%"
              borderRadius="md"
              space={2}
              alignItems="flex-start"
            >
              <Text fontWeight="bold">Other Charges:</Text>
              <Text>{`PRODUCT: ${Number(currentitem?.item?.price) * Number(currentitem?.quantity)}`}</Text>
              <Text>{currentitem.item.shop.name}</Text>
              <Text>TRANSACTION COSTS</Text>
              <Text>Mpesa Payment</Text>
              <Text>Local Card Payment</Text>
              <Text>International Card Payment</Text>
              <Text>Disbursement: Mpesa | Bank | International Card</Text>
            </VStack>

            {/* Total Price Section */}
            <VStack w="100%" space={2} alignItems="center">
              <Text fontWeight="bold">
                Price: {currentitem?.price} | Quantity: {item.quantity}
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                TOTAL PRICE: {currentitem?.price * item?.quantity}
              </Text>
            </VStack>

            {/* Error Message */}
            {callerror && (
              <Text color="red.600" fontSize="sm" textAlign="center">
                {callerror}
              </Text>
            )}

            {/* Buttons */}
            <HStack w="100%" justifyContent="space-between" space={4}>
              <Button flex={1} colorScheme="red" onPress={onClose}>
                CANCEL
              </Button>
              <Button
                flex={1}
                colorScheme="blue"
                onPress={callpaypage}
                justifyContent="center"
                alignItems="center"
              >
                CONFIRM
                {calling && (
                  <Spinner
                    color="white"
                    size="sm"
                    ml="2"
                    alignSelf="center"
                  />
                )}
              </Button>
            </HStack>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
