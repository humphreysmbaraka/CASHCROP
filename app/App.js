import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View  } from 'react-native';
import React from 'react'; // MISSING - This is critical!

import {NativeBaseProvider} from 'native-base';
import Landing from './components/laning pages/landing';
import Signup from './components/laning pages/signup';
import HomePage from './components/screens/home';
import OrdersPage from './components/screens/orders';
import ShoppingPage from './components/screens/shopping';
import MyShops from './components/screens/myshops';
import ShopView from './components/screens/shop';
import CreateShop from './components/screens/createshop';
import ViewItem from './components/screens/item';
import AddItem from './components/screens/additem';
import { AuthProvider } from './contexts/authcontext';
import Navigator from './components/Navigator';
export default function App() {
  return (
    
    <SafeAreaView  style={{ width:'100%' , flex:1 , backgroundColor:'white'}}   >
      <AuthProvider>
      <NativeBaseProvider>
                    {/* <Landing/> */}
                    {/* <Signup/> */}
                    {/* <OrdersPage/> */}
                    {/* <ShoppingPage/> */}
                    {/* <MyShops/> */}
                    {/* <ShopView/> */}
                    {/* <CreateShop/> */}
                    {/* <ViewItem/> */}
                    {/* <AddItem/> */}
                    <Navigator/>
     </NativeBaseProvider>
     </AuthProvider>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
