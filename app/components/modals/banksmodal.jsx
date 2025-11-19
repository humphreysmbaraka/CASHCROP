import React, { useContext, useEffect, useState } from "react";
import { Modal, Button, HStack, VStack, Text, Spinner, Select, Radio, Checkbox, FlatList } from "native-base";
import { authcontext } from "../../contexts/authcontext";
import base_url from "../constants/baseurl";

export default function Banksmodal({ isOpen, onClose, data , getbanks , gettingbanks , bankserror , setbank }) {
  const { user } = useContext(authcontext);



  return (
    <Modal isOpen={isOpen} onClose={onClose} justifyContent="center" alignItems="center">
      <Modal.Content  width={'350px'} height={'900px'} overflow={'auto'} borderRadius="15px"  alignSelf="center">
        <Modal.Body  width={'100%'} >
         
          <VStack>
           {gettingbanks &&  
           <>
            <Spinner mr={'auto'} ml={'auto'}     alignSelf={'center'} color={'blue.600'} width={'20px'} height={'sopx'}        />
            <Text mr={'auto'} ml={'auto'}     alignSelf={'center'} color={'blue.600'} width={'20px'} height={'sopx'}  >Getting banks...</Text>
           </>
           }

           {bankserror  &&  
           <>
                       <Text mr={'auto'} ml={'auto'}     alignSelf={'center'} color={'red.600'} width={'20px'} height={'sopx'}  >{bankserror}</Text>

            <Button onPress={()=>{getbanks()}} size={'md'} alignItems={'center'} justifyContent={'center'} alignSelf={'center'} colorScheme={'blue'} color={'white'} >
            <Text mr={'auto'} ml={'auto'}     alignSelf={'center'} color={'white'} width={'20px'} height={'sopx'}  >Retry?</Text>
              {gettingbanks  &&  
                          <Spinner mr={'auto'} ml={'auto'}     alignSelf={'center'} color={'white'} width={'20px'} height={'sopx'}        />

              }
            </Button>
           </>
           }
           {banks?.length == 0 &&
                         <Text mr={'auto'} ml={'auto'}     alignSelf={'center'} color={'blue.600'} width={'20px'} height={'sopx'}  >no banks found</Text>

           }

           {(banks && banks.length > 0) &&  
                  <FlatList 
                  data={data}
                  keyExtractor={function(item , index){return index.toString()}}
                  renderItem={function({item , ind}){
   
                   return (
                     <Pressable onPress={()=>{
                       setbank(item)
                       onClose();
   
                     }} width={'98%'}  height={'40px'} bg={'white'} borderBottomColor={'black'} borderBottomWidth={'1px'} mt={'5px'} mb={'1px'} >
                      <Text color={'black'}>{`${ind}. ${item.bank_name}`}</Text>
                     </Pressable>
                   )
                  }}
                  
                  />
           }
          </VStack>

        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
