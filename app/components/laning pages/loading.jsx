import React from 'react';
import { StatusBar } from 'react-native';
import { Box, Spinner, Text, Center } from 'native-base';

export default function LoadingScreen() {
  return (
    <Box flex={1} bg="black">
      {/* Make StatusBar translucent with light content */}
      <StatusBar translucent backgroundColor="black" barStyle="light-content" />

      {/* Center everything */}
      <Center flex={1}>
        {/* Spinner */}
        <Spinner
          size="lg"
          color="cyan.400"
          thickness="2"
          accessibilityLabel="Authenticating spinner"
        />

        {/* Spacing */}
        <Box h={4} />

        {/* Text below spinner */}
        <Text fontSize="lg" color="white" fontWeight="bold" letterSpacing={0.5}>
          Authenticating...
        </Text>
      </Center>
    </Box>
  );
}
