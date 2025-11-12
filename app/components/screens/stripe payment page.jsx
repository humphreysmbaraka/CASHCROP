import React, { useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Box, Spinner, Text, Center } from 'native-base'; // Chakra UI like components in React Native

export default function StripeWebView({ route, navigation }) {
  const { paymentUrl } = route.params; // pass the URL from your backend
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef(null);

  // Optional: detect navigation changes
  const handleNavigationChange = (navState) => {
    const { url } = navState;
    console.log('Navigated to: ', url);

    // Detect success or cancel redirects
    if (url.includes('success')) {
      console.log('Payment succeeded!');
      // Navigate back or show confirmation
      navigation.replace('PaymentSuccess'); // or any screen
    } else if (url.includes('cancel')) {
      console.log('Payment cancelled!');
      navigation.replace('PaymentCancelled'); // or any screen
    }
  };

  return (
    <Box flex={1} safeArea>
      {loading && (
        <Center flex={1} bg="gray.100">
          <Spinner size="lg" color="blue.500" />
          <Text mt={2}>Loading payment...</Text>
        </Center>
      )}

      <WebView
        ref={webviewRef}
        source={{ uri: paymentUrl }}
        style={{ flex: 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
      />
    </Box>
  );
}
