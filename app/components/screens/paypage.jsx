import React, { useEffect, useState } from "react";
import { Linking } from "react-native";
import { Box, Spinner, Center } from "native-base";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";

const PayPage = ({ route }) => {
  

  const { url } = route.params;
//   const url = 'https://humverse.dev';


  return (
    <Box flex={1}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        startInLoadingState
       
       
      />
    </Box>
  );
};

export default PayPage;
