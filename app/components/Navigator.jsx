import React, { useContext } from 'react'
import { authcontext } from '../contexts/authcontext'
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { NavigationContainer } from '@react-navigation/native';
import Signup from './laning pages/signup';
import HomePage from './screens/home';
import ShoppingPage from './screens/shopping';
import OrdersPage from './screens/orders';
import MyShops from './screens/myshops';
import ShopView from './screens/shop';
import AddItem from './screens/additem';
import ViewItem from './screens/item';
import ViewItemPage from './screens/viewitem';
import CartPage from './screens/cart';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import CreateShop from './screens/createshop';
import Login from './laning pages/login';
import Landing from './laning pages/landing';


function Navigator() {
    const {loggedin} = useContext(authcontext);
    const Stack1 = createStackNavigator();
    const Stack2 = createStackNavigator();
    const Stack3 = createStackNavigator();
    const Stack4 = createStackNavigator();
    const Stack5 = createStackNavigator();
    const Stack6 = createStackNavigator();
    const Stack7 = createStackNavigator();
    const Stack8 = createStackNavigator();
    const Stack9 = createStackNavigator();
    const Bottom = createBottomTabNavigator();
    const Top = createMaterialTopTabNavigator();



      const Auth = function(){
        return(
           
            <Stack1.Navigator  screenOptions={{ headerShown: false }} initialRouteName='auth'>
              <Stack1.Screen   name='auth' component={Authstacks}    />
              <Stack1.Screen   name='app' component={Bottomtabs}    />
            </Stack1.Navigator>
      
        )
      }



       const Authstacks = function(){
   return(
     <Stack9.Navigator   screenOptions={{ headerShown: false }}  >
          <Stack9.Screen   name='landing' component={Landing}         />
         <Stack9.Screen   name='signup' component={Signup}         />
         <Stack9.Screen   name='login' component={Login}         />
         {/* <Stack9.Screen            /> */}
     </Stack9.Navigator>
   )
       }



      const Bottomtabs = function () {
        return (
          <Bottom.Navigator
            initialRouteName="home"
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#0ea5e9', // bright blue for active tab
              tabBarInactiveTintColor: '#94a3b8', // gray for inactive
              tabBarStyle: {
                backgroundColor: 'white',
                borderTopWidth: 0,
                elevation: 5, // shadow for Android
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
              },
            }}
          >
            <Bottom.Screen
              name="home"
              component={HomePage}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />
            <Bottom.Screen
              name="shop"
              component={Shoppingstacks}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="shopping" size={size} color={color} />
                ),
              }}
            />
            <Bottom.Screen
              name="orders"
              component={OrdersPage}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome5 name="clipboard-list" size={size} color={color} />
                ),
              }}
            />
          
           
{/* 
<Bottom.Screen
              name="clickitem"
              component={Itemstacks}
              options={{ tabBarButton: () => null ,  tabBarStyle: { display: "none" } }}
            /> */}

            <Bottom.Screen
              name="shops"
              component={Shopstacks}
              options={{ tabBarButton: () => null ,  tabBarStyle: { display: "none" } }}
            />

<Bottom.Screen
              name="cart"
              component={Cartstacks}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="cart" size={size} color={color} />

                  
                ),
              }}
            />
          </Bottom.Navigator>
        );
      };
      


    //   const Bottomtabs = function(){
    //     return(
           
    //             <Bottom.Navigator   screenOptions={{ headerShown: false }}  initialRouteName='home' >
    //                 <Bottom.Screen     name='home'  component={HomePage}    />
    //                 <Bottom.Screen     name='shop'  component={ShoppingPage}    />
    //                 <Bottom.Screen     name='orders'  component={OrdersPage}    />
    //                 <Bottom.Screen        name='clickitem'   component={Itemstacks}  options={{tabBarButton:()=>{null}}}   />
    //                 <Bottom.Screen        name='cart'   component={Cartstacks}    />
    //                 <Bottom.Screen     name='shops'  component={Shopstacks}  options={{tabBarButton:()=>{null}}}   />
    //                 {/* <Bottom.Screen     name=''  component={}    /> */}
    //                 {/* <Bottom.Screen        name=''   component={}    /> */}
    //                 {/* <Bottom.Screen     name=''  component={}    /> */}
    //                 {/* <Bottom.Screen     name=''  component={}    /> */}
    //                 {/* <Bottom.Screen     name=''  component={}    /> */}
    //             </Bottom.Navigator>
           
    //     )
    //   }


      // when user clicks on shops
      const Shopstacks = function(){
        return(
        
            <Stack2.Navigator screenOptions={{ headerShown: false }}  initialRouteName='shops' >
                <Stack2.Screen              name='shops' component={MyShops}                                />
                <Stack2.Screen              name='shop' component={ShopView}                                />
                <Stack2.Screen              name='shopitem' component={Shopitemstack}                                />
                <Stack2.Screen              name='additem' component={Additemstack}  />
                <Stack2.Screen             name='visitview' component={Itemstacks}                                />
                <Stack2.Screen             name='create'    component={CreateShop}                                />

            </Stack2.Navigator>
      
        )
      }


     const Shoppingstacks = function(){
      return(
        <Stack8.Navigator screenOptions={{ headerShown: false }}  initialRouteName='shoppingpage' >
        <Stack8.Screen  name='shoppingpage'  component={ShoppingPage}    />
        <Stack8.Screen  name='clickitem'  component={Itemstacks}    />
        
        {/* <Stack8.Screen        /> */}
        </Stack8.Navigator>
      )
     }
  

      const Shopitemstack =  function(){
       return(
       
        <Stack3.Navigator screenOptions={{ headerShown: false }}  initialRouteName='overview' >
            <Stack3.Screen    name='overview' component={ViewItem}  />
            <Stack3.Screen    name='edit' component={Editshopitem}  />
            {/* <Stack3.Screen    name='delete' component={Shopstacks}  />should navigate to the shop screen */}
            {/* <Stack3.Screen    name='done' component={Shopstacks}  />  */}
        </Stack3.Navigator>
 
       )
      }


      const Additemstack = function(){
        return(
          
             <Stack4.Navigator  screenOptions={{ headerShown: false }}  initialRouteName='add' >
                 <Stack4.Screen    name='add'  component={AddItem}  />
                 {/* <Stack4.Screen    name='done'  component={Shopstacks}  /> should navigate to the shop screen */}
                 {/* <Stack4.Screen    name=''  component={}  />
                 <Stack4.Screen    name=''  component={}  /> */}
             </Stack4.Navigator>
        
        )
       }
 

      const Editshopitem = function(){
        return(
          
                 <Stack5.Navigator screenOptions={{ headerShown: false }}  initialRouteName='edit' >
                    <Stack5.Screen       name='edit'  component={AddItem}   />
                    {/* <Stack5.Screen       name='done'  component={Shopstacks}   />   should navigate to the shop screen */}
                    {/* <Stack5.Screen       name=''  component={}   />
                    <Stack5.Screen       name=''  component={}   />
                    <Stack5.Screen       name=''  component={}   /> */}
                 </Stack5.Navigator>
         
        )
      }


// when user clicks an item on the shopping page
     

const Itemstacks = function(){
        return(
            <Stack6.Navigator   screenOptions={{ headerShown: false }} >
                <Stack6.Screen    name='view'   component={ViewItemPage}   /> 
                <Stack6.Screen    name='seller'   component={Shopstacks}   /> 
                {/* <Stack6.Screen    name=''   component={}   />  */}
                {/* <Stack6.Screen    name=''   component={}   />  */}
                {/* <Stack6.Screen    name=''   component={}   />  */}

            </Stack6.Navigator>
        )
      }


      const Cartstacks = function(){
        return(
            <Stack7.Navigator  screenOptions={{ headerShown: false }}  >
                <Stack7.Screen    name='cart'   component={CartPage}      />
                <Stack7.Screen    name='see'   component={Itemstacks}      />
                {/* <Stack7.Screen    name=''   component={}      /> */}
                {/* <Stack7.Screen    name=''   component={}      /> */}
                {/* <Stack7.Screen    name=''   component={}      /> */}
            </Stack7.Navigator>
        )
      }







return (
    <NavigationContainer    screenOptions={{
      headerShown: false,
      safeAreaInsets: { top: 0, bottom: 0 }, // 🔥 Disable protection region
    }}>
        {loggedin ?
      <Bottomtabs/> :
     <Auth/>  
    }
    </NavigationContainer>
)
  
 
}

export default Navigator