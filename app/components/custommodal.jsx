import React from "react";
import { Modal, Box, ScrollView, Pressable, Text } from "native-base";
import { Dimensions, FlatList } from "react-native";

const { width } = Dimensions.get("window");

const CustomModal = ({ isOpen, onClose, title, items = [] , setselectedcountry , setselectedarea , setselectedcounty }) => {
  return (
    <Modal alignSelf={'center'} width={'98%'}  maxH={'90%'} isOpen={isOpen} onClose={onClose} safeAreaTop>
      <Modal.Content
        maxWidth={width * 0.95} // almost full screen width
        borderRadius="2xl"
        bg="white"
        _scrollview={{ showsVerticalScrollIndicator: true }}
      >
        <Modal.CloseButton />
        <Modal.Header
          borderBottomWidth={1}
          borderColor="black"
          bg="white"
          _text={{ color: "black", fontSize: "lg", fontWeight: "bold" }}
        >
          {title}
        </Modal.Header>

        <Modal.Body p={0}>
          {/* <ScrollView
            showsVerticalScrollIndicator
            style={{
              maxHeight: 400, // limit height so scroll activates
            }}
            indicatorStyle="black" // thin dark scrollbar (iOS)
            persistentScrollbar={true} // ensures visible scrollbar (Android)
          > */}
            <Box width={'100%'} >
               <FlatList 
               data={items}
               keyExtractor={function(item , index){return index.toString()}}
               renderItem={function({item}){
                const flag = title=='COUNTRIES'?item?.countryName:title=='COUNTIES'?item?.name:title=='LOCAL AREAS'?item?.name:item?.name;

                return (
                  <Pressable onPress={()=>{
                    if(title==='COUNTRIES'){
                      setselectedcountry(item);
                    }
                    else if(title === 'COUNTIES'){
                      setselectedcounty(item);
                    }
                    else if(title == 'LOCAL AREAS'){
                      setselectedarea(item)
                    }

                    onClose();

                  }} width={'98%'}  height={'40px'} bg={'white'} borderBottomColor={'black'} borderBottomWidth={'1px'} mt={'5px'} mb={'1px'} >
                   <Text color={'black'}>{flag}</Text>
                  </Pressable>
                )
               }}
               
               />

              
            </Box>
          {/* </ScrollView> */}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default CustomModal;
