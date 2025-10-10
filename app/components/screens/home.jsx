// HomePage.jsx
import React from "react";
import { ScrollView } from "react-native";
import { VStack, Box, Image, Text, Pressable } from "native-base";
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from "@react-navigation/native";


const cards = [
  { title: "My Shops", image: require("../../assets/shops.png") },
  { title: "Orders",  image: require("../../assets/groceries.png")},
  { title: "Settings", image: require("../../assets/gears.png")},
  // { title: "Orders",  image: require("../../assets/gmail.jpeg")},
  // { title: "Settings", image: require("../../assets/gmail.jpeg")},
  // { title: "Orders",  image: require("../../assets/gmail.jpeg")},
  // { title: "Settings", image: require("../../assets/gmail.jpeg")},
];

export default function HomePage({navigation}) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" , paddingTop:Platform.OS==='android'?Constants.statusBarHeight:0 }}>
      <VStack space={4} padding={4}  pb={'40px'} >
        {cards.map((card, index) => (
          <Pressable key={index}  onPress={()=>{navigation.navigate('shops')}}  >
            <Box
              bg="white"
              shadow={2}
              borderRadius="lg"
              overflow="hidden"
              mb={2}
              
            >
              <Image
                source={card.image}
                alt={card.title}
                width="100%"
                height={150}
              />
              <Box p={4}>
                <Text fontSize="lg" fontWeight="bold" color="coolGray.800">
                  {card.title}
                </Text>
              </Box>
            </Box>
          </Pressable>
        ))}
      </VStack>
    </ScrollView>
  );
}
