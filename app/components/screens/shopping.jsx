// ShoppingPage.jsx
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import Constants from 'expo-constants';
import { Platform } from "react-native";
import {
  VStack,
  HStack,
  Box,
  Image,
  Text,
  Input,
  Pressable,
  FlatList,
  Spinner,
  Button,
} from "native-base";
import base_url from "../constants/baseurl";


export default function ShoppingPage({navigation}) {
  // const [search, setSearch] = useState("");

  // const results = items.filter((item) =>
  //   item.name.toLowerCase().includes(search.toLowerCase())
  // );


  const [query , setquery] = useState(null);
  const [currentquery , setcurrentquery] = useState(null);
  const [matches , setmatches] = useState(null);  //recomendations
  const [showsuggestionbox , setshowsuggestionbox] = useState(false);
  const [results , setresults] = useState(null);  //results after searching
  const [looking, setlooking] = useState(false);
  const [searcherror , setsearcherror] = useState(null);
  const [page , setpage] = useState(0);
  const [gettingmore , setgettingmore] = useState(false);
  const [gettingmoreerror , setgettingmoreerror] = useState(null);

  // for when getting initial items to display
  const [initialresults , setinitialresults] = useState(null);
  const [gettinginit , setgettinginit] = useState(false);
  const [initerror , setiniterror] = useState(null);
  

  const [selectedtab  ,setselectedtab] = useState('products');
  // const [] = useState();
  // const [] = useState();
  // const [] = useState();
  // const [] = useState();

  const getInitialProducts = async function(){
    try{
      if(gettinginit){
        return;
      }
      setgettinginit(true);
      setiniterror(null);

      const response = await fetch(`${base_url}/get_initial_results` , {
        method:'GET',
        headers:{
          'Content-Type':'application/json'
        }
      }) 

      const info = await response.json();
      if(response.ok){
        setgettinginit(false);
        setiniterror(null);
        console.log('initial results fetched' , info);
        setinitialresults(function(prev){
          if(prev){
            return [...prev , ...info.items];
          }
          else{
            return info.items;
          }
        });
      }
      else{
        setgettinginit(false);
        if(String(response.status).startsWith('4')){
          setiniterror(info.message);
        }
        else{
          setiniterror('server error')
        }
      }
    }
    catch(err){
      console.log('could not get initial products' ,err);
      setgettinginit(false);
      setiniterror('error')
      throw new Error(err);
    }
  }

  useEffect(function(){
        (async function(){
          try{
       await getInitialProducts();
       await getinitialshops();
          }
          catch(err){
            console.log('could not fetch initial products' , err);
          }
        })();
  } ,[])

  useEffect(function(){
   console.log('initial results change etected' ,initialresults);
  } ,[initialresults])


   const getmatches = async function(){
    try{
       setlooking(true);
       setsearcherror(null);
       const recomendations = await fetch(`${base_url}/get_suggestions/${query}`);
       if(recomendations.ok){
        setsearcherror(false);
        setlooking(false);
         const info = await recomendations.json();
         console.log('suggestion info' , info)
         setmatches(info.recomendations);
    
       }
       else{
    
        setmatches([]);
        setlooking(false);
         const info = await recomendations.json();
         if(String(info.status).startsWith('4')){
        setsearcherror(info.message);
         }
         else{
          setsearcherror('server error');
         }


       }
    }
    catch(err){
      console.log('error finding suggestions' , err);
    }
   }

 useEffect(function(){
      if(!query || query.trim()== ''){
        return;
      }
      else{
       (async function(){
        try{
         await getmatches();
        }
        catch(err){
          console.log('could not get matches' , err);
        }
       })();
      }
 } , [query]);


   const clickedrecomendation = async function(name){
    try{
      
       setlooking(true);
       setsearcherror(null);
       setpage(0);
       setquery(name);
       setcurrentquery(name);
       setshowsuggestionbox(false);
       const res = await fetch(`${base_url}/search/${name}/${0}`);
       if(res.ok){
        setsearcherror(false);
        setlooking(false);
         const info = await res.json();
         setresults(info.results);
    
       }
       else{
    
        setlooking(false);
        setresults([])
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setsearcherror(info.message);
         }
         else{
          setsearcherror('server error');
         }


       }
    }
    catch(err){
      console.log('error finding matches' , err);
    }
   }



  
   const search = async function(){  // will use when i add a search key/icon to the input
    try{
       setlooking(true);
       setsearcherror(null);
       setpage(0);
       setquery(query);
       setcurrentquery(query);
       const res = await fetch(`${base_url}/search/${query}/${0}`);
       if(res.ok){
        setsearcherror(false);
        setlooking(false);
         const info = await res.json();
         setresults(info.results)
    
       }
       else{
    
        setlooking(false);
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setsearcherror(info.message);
         }
         else{
          setsearcherror('server error');
         }


       }
    }
    catch(err){
      console.log('error finding matches' , err);
    }
   }




     
   const searchmore = async function(){
    try{
       setgettingmore(true);
       setgettingmoreerror(null);
       setpage(function(prev){
        return prev + 1;
       })
      //  setquery(query);
      //  setcurrentquery(query);
       const res = await fetch(`${base_url}/search/${currentquery}/${page+1}`);
       if(res.ok){
        setgettingmoreerror(false);
        setgettingmore(false);
         const info = await res.json();
         setresults(function(prev){
          return [...prev , ...info.results];
        })
    
       }
       else{
    
        setgettingmore(false);
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setgettingmoreerror(info.message);
         }
         else{
          setgettingmoreerror('server error');
         }


       }
    }
    catch(err){
       setgettingmore(false);
       setgettingmoreerror('error');
      console.log('error finding  results for initial display' , err);
    }
   }


   const searchmoreinit =  async function(){
    try{
       setgettingmore(true);
       setgettingmoreerror(null);
       setpage(function(prev){
        return prev + 1;
       })
      //  setquery(query);
      //  setcurrentquery(query);
       const res = await fetch(`${base_url}/get_initial_results`);
       if(res.ok){
        setgettingmoreerror(false);
        setgettingmore(false);
         const info = await res.json();
         setinitialresults(function(prev){
          return [...prev , ...info.items];
        })
    
       }
       else{
    
        setgettingmore(false);
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setgettingmoreerror(info.message);
         }
         else{
          setgettingmoreerror('server error');
         }


       }
    }
    catch(err){
       setgettingmore(false);
       setgettingmoreerror('error');
      console.log('error finding  results for initial display' , err);
    }
   }

  //  const getfiltereditems = async function(filter){
  //   try{
  //      flag = (filter=='CLOSE TO YOU')?user?.area?.name:(filter=='ALL')?null:null;
  //      setlooking(true);
  //      setsearcherror(null);
     
  //      const res = await fetch(`${base_url}/search_items/${flag}`);
  //      if(res.ok){
  //       setsearcherror(false);
  //       setlooking(false);
  //        const info = await res.json();
    
  //      }
  //      else{
    
  //       setlooking(false);
  //        const info = await res.json();
  //        if(String(info.status).startsWith('4')){
  //       setsearcherror(info.message);
  //        }
  //        else{
  //         setsearcherror('server error');
  //        }


  //      }
  //   }
  //   catch(err){
  //     console.log('error finding matches' , err);
  //   }
  //  }






   const handleScroll =async ({ nativeEvent }) => {  // for searched results
         try{
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

          // Check if user has scrolled to the bottom
          const isEnd =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
      
          if (isEnd) {
            console.log("Reached bottom!");
          if(selectedtab === 'products'){
            await searchmore();
          }else if(selectedtab == 'shops'){
            await searchmoreshops();
          }
          }

         }
         catch(err){
         console.log('could not fetch more results' , err);
         }
  };

  const handleinitScroll = async ({ nativeEvent }) => {  // for initial results
    try{
     const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

     // Check if user has scrolled to the bottom
     const isEnd =
       layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
 
     if (isEnd) {
       console.log("Reached bottom!");
       if(selectedtab === 'products'){
        await searchmoreinit();
       }else if(selectedtab === 'shops'){
        await searchmoreinitialshops();
       }
     }

    }
    catch(err){
    console.log('could not fetch more initial  results' , err);
    }
};


  useEffect(function(){
     if(!query || query.trim()==''){
       setshowsuggestionbox(false);
       return;
     }
     else{
      setshowsuggestionbox(true);
     }
  } , [query])


  
  useEffect(function(){
    if(!shopquery || shopquery.trim()==''){
      setshowshopsuggestionbox(false);
      return;
    }
    else{
     setshowshopsuggestionbox(true);
    }
 } , [shopquery])


  const [refreshKey, setRefreshKey] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    // optionally re-fetch initial products
    setresults(null);
    setquery(null);
    setcurrentquery(null);
    await getInitialProducts();
    setRefreshing(false);
  };




  // FOR SHOPS


  const [shopsrefreshing, setshopsrefreshing] = useState(false);

  const onRefreshshops = async () => {
    setshopsrefreshing(true);
    setrefreshKey(prev => prev + 1);
    // optionally re-fetch initial products
    setshopresults(null);
    setshopquery(null);
    setcurrentshopquery(null);
    await getInitialProducts();
    setshopsrefreshing(false);
  };








  // BASED ON SHOPS

  const [shopquery , setshopquery] = useState(null);
  const [currentshopquery , setcurrentshopquery] = useState(null);
  const [shopmatches , setshopmatches] = useState(null);  //recomendations
  const [showshopsuggestionbox , setshowshopsuggestionbox] = useState(false);
  const [shopresults , setshopresults] = useState(null);  //results after searching
  const [lookingforshops, setlookingforshops] = useState(false);
  const [shopsearcherror , setshopsearcherror] = useState(null);
  const [shopspage , setshopspage] = useState(0);
  const [gettingmoreshops , setgettingmoreshops] = useState(false);
  const [gettingmoreshopserror , setgettingmoreshopserror] = useState(null);

  // for when getting initial shops to display
  const [initialshopresults , setinitialshopresults] = useState(null);
  const [gettinginitialshops , setgettinginitialshops] = useState(false);
  const [initialshopserror , setinitialshopserror] = useState(null);

  // GET INITIAL SHOPS
  
  const getinitialshops = async function(){
    try{
      if(gettinginitialshops){
        return;
      }
      setgettinginitialshops(true);
      setinitialshopserror(null);

      const response = await fetch(`${base_url}/get_initial_shop_results` , {  // should be initial_shops
        method:'GET',
        headers:{
          'Content-Type':'application/json'
        }
      }) 

    
      if(response.ok){
        const info = await response.json();
        setgettinginitialshops(false);
        setinitialshopserror(null);
        console.log('initial shops fetched' , info);
        setinitialshopresults(function(prev){
          if(prev){
            return [...prev , ... info.shops];
          }
          else{
            return info.shops;
          }
        });
      }
      else{
        const info = await response.json();
        setgettinginitialshops(false);
        if(String(response.status).startsWith('4')){
          setiniterror(info.message);
        }
        else{
          setiniterror('server error')
        }
      }
    }
    catch(err){
      console.log('could not get initial shops' ,err);
      setgettinginitialshops(false);
      setinitialshopserror('error')
      throw new Error(err);
    }
  }


  // GETTING MATCHES FOR THE SHOP QUERY
  const getshopmatches = async function(){
    try{
       setlookingforshops(true);
       setshopsearcherror(null);
       const recomendations = await fetch(`${base_url}/get_shop_suggestions/${shopquery}`); // should be shop suggestions
       if(recomendations.ok){
        setshopsearcherror(false);
        setlookingforshops(false);
         const info = await recomendations.json();
         console.log('suggestion info' , info)
         setshopmatches(info.recomendations);
    
       }
       else{
    
        setshopmatches([]);
        setlookingforshops(false);
         const info = await recomendations.json();
         if(String(info.status).startsWith('4')){
        setshopsearcherror(info.message);
         }
         else{
          setshopsearcherror('server error');
         }


       }
    }
    catch(err){
      console.log('error finding shop suggestions' , err);
    }
   }


   useEffect(function(){
    if(!shopquery|| shopquery.trim()== ''){
      setshowshopsuggestionbox(false);
      return;
    }
    else{
      setshowshopsuggestionbox(true);

     (async function(){
      try{
       await getshopmatches();
      }
      catch(err){
        console.log('could not get shop matches' , err);
      }
     })();
    }
} , [shopquery]);





   const clickedshoprecomendation = async function(name){
    try{
      
       setlookingforshops(true);
       setshopsearcherror(null);
       setshopspage(0);
       setshopquery(name);
       setcurrentshopquery(name);
       setshowshopsuggestionbox(false);
       const res = await fetch(`${base_url}/search_shop/${name}/${0}`);  // should be search_shop
       if(res.ok){
        setshopsearcherror(false);
        setlookingforshops(false);
         const info = await res.json();
         setshopresults(info.results);
    
       }
       else{
    
        setlookingforshops(false);
        setshopresults([])
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setshopsearcherror(info.message);
         }
         else{
          setshopsearcherror('server error');
         }


       }
    }
    catch(err){
      console.log('error finding matches' , err);
    }
   }



   
  
   const shopsearch = async function(){  // will use when i add a search key/icon to the input
    try{
       setlookingforshops(true);
       setshopsearcherror(null);
       setshopspage(0);
       setshopquery(shopquery);
       setcurrentshopquery(shopquery);
       const res = await fetch(`${base_url}/search_shop/${shopquery}/${0}`);
       if(res.ok){
        setshopsearcherror(false);
        setlookingforshops(false);
         const info = await res.json();
         setshopresults(info.results)
    
       }
       else{
    
        setlookingforshops(false);
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setshopsearcherror(info.message);
         }
         else{
          setshopsearcherror('server error');
         }


       }
    }
    catch(err){
      console.log('error finding matches' , err);
    }
   }



   const searchmoreshops = async function(){
    try{
       setgettingmoreshops(true);
       setgettingmoreshopserror(null);
       setshopspage(function(prev){
        return prev + 1;
       })
      //  setquery(query);
      //  setcurrentquery(query);
       const res = await fetch(`${base_url}/search_shop/${currentshopquery}/${shopspage+1}`);  // should be shop_search
       if(res.ok){
        setgettingmoreshopserror(false);
        setgettingmoreshops(false);
         const info = await res.json();
         setresults(function(prev){
          return [...prev , ...info.results];
        })
    
       }
       else{
    
        setgettingmoreshops(false);
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setgettingmoreshopserror(info.message);
         }
         else{
          setgettingmoreshopserror('server error');
         }


       }
    }
    catch(err){
       setgettingmoreshops(false);
       setgettingmoreshopserror('error');
      console.log('error finding  results for initial display' , err);
    }
   }



   
   const searchmoreinitialshops =  async function(){
    try{
       setgettingmoreshops(true);
       setgettingmoreshopserror(null);
       setshopspage(function(prev){
        return prev + 1;
       })
      //  setquery(query);
      //  setcurrentquery(query);
       const res = await fetch(`${base_url}/get_initial_shop_results`);  // should be initial shops
       if(res.ok){
        setgettingmoreshopserror(false);
        setgettingmoreshops(false);
         const info = await res.json();
         setinitialshopresults(function(prev){
          return [...prev , ...info.items];
        })
    
       }
       else{
    
        setgettingmoreshops(false);
         const info = await res.json();
         if(String(info.status).startsWith('4')){
        setgettingmoreshopserror(info.message);
         }
         else{
          setgettingmoreshopserror('server error');
         }


       }
    }
    catch(err){
       setgettingmoreshops(false);
       setgettingmoreshopserror('error');
      console.log('error finding shop results for initial display' , err);
    }
   }



  return (
   
      <VStack key={refreshKey}  position={'relative'} flex={1}  bg={'white'}  paddingTop={Platform.OS==='android'?Constants.statusBarHeight:0 } pace={4} padding={4} pb={'70px'} >
      
        <HStack width={'100%'} p={'4px'}  alignSelf={'center'}  alignItems={'center'} justifyContent={'space-around'}  >
        {['products' , 'shops'].map(function(val , ind){
          return(
            <Button width={'45%'} borderRadius={'10px'} onPress={()=>{setselectedtab(val)}} colorScheme={selectedtab===val?'green':'gray'} >{val}</Button>
          )
        })}
        </HStack>
        {/* Search Bar */}
        <Input
          placeholder={selectedtab==='products'?"Search for items...":"Search for shops..."}
          value={(selectedtab ==='products')?query:shopquery}
          onChangeText={(val)=>{
            (selectedtab ==='products')?setquery(val.trim()):setshopquery(val.trim())}}
          size="lg"
          bg="gray.100"
          borderRadius="full"
          mt={'10px'}
        />

        {/* Conditional Results */}
        
        {(selectedtab == 'products' && showsuggestionbox ) && (
          <Box   position={'absolute'} zIndex={999} alignSelf={'center'} top={'85px'} mt={'5px'} bg={'white'} width={'98%'}  maxH={'300px'} alignItems={'center'} justifyContent={'center'} borderWidth={0} borderRadius={'10px'} p={'2px'} >
            
          
          <FlatList  width={'100%'}  initialNumToRender={15} maxToRenderPerBatch={20}  windowSize={5} data={matches} keyExtractor={function(item , index){return index.toString()}}     renderItem={function({item}){
            return(
              <Pressable   onPress={()=>{clickedrecomendation(item?.name.trim())}}  width={'98%'} height={'35px'} mt={'5px'} mb={'5px'}           >
                <Text width={'90%'} textAlign={'left'} fontSize={'sm'} fontWeight={'bold'} color={'black'} >{item?.name}</Text>
              </Pressable>
            )
          }}              />



          </Box>
        )}


{(selectedtab == 'shops' && showshopsuggestionbox) && (
          <Box   position={'absolute'} zIndex={999} alignSelf={'center'} top={'85px'} mt={'5px'} bg={'white'} width={'98%'}  maxH={'300px'} alignItems={'center'} justifyContent={'center'} borderWidth={0} borderRadius={'10px'} p={'2px'} >
            
          
          <FlatList  width={'100%'}  initialNumToRender={15} maxToRenderPerBatch={20}  windowSize={5} data={shopmatches} keyExtractor={function(item , index){return index.toString()}}     renderItem={function({item}){
            return(
              <Pressable   onPress={()=>{clickedshoprecomendation(item?.name.trim())}}  width={'98%'} height={'35px'} mt={'5px'} mb={'5px'}           >
                <Text width={'90%'} textAlign={'left'} fontSize={'sm'} fontWeight={'bold'} color={'black'} >{item?.name}</Text>
              </Pressable>
            )
          }}              />



          </Box>
        )}

        {/* IF SELECTED TAB S PRODUCTS */}

         {selectedtab === 'products'  &&  
         <>
           {(results && results?.length !== 0)&&
            <Box height={'100%'} width={'100%'} >
           <ScrollView style={{ marginTop:10 ,  flex:1 , backgroundColor: "white" , padding:2  }}  onScroll={handleScroll}  
           scrollEventThrottle={16}  
           refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
           >
        <HStack  p={'4px'} alignItems={'center'} justifyContent={'center'} flexWrap={'wrap'}  space={3} >
          {results?.map(function(val , ind){
            return(
              <Pressable key={ind} onPress={()=>{navigation.navigate('clickitem' , {screen:'view' , params:{item:val}})}}>
              <Box
                width={140}
                bg="white"
                shadow={2}
                borderRadius="lg"
                overflow="hidden"
                mt={'10px'}
                mb={'10px'}
              >
                <Image
                  source={{uri:`${base_url}/item_picture/${val.image}`}}
                  alt={val.name}
                  width="100%"
                  height={100}
                />
                <Box p={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    {val.name}
                  </Text>
                  <Text color="gray.500">{val.price}</Text>
                </Box>
              </Box>
            </Pressable>
            )
          })}

         
        </HStack>
        
        {gettingmore &&
           <Spinner     mt={'10px'}    color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'}        />
           }

           {gettingmoreerror &&  
             <Text  color={'red.600'} fontWeight={'light'} alignSelf={'center'} mt={'10px'}    >{gettingmoreerror}</Text>
           }
        </ScrollView>
        </Box>
}

        {/* initial results , when one opens the page before doing or searching anythig */}
        {((!results)) &&
         
            <>
           {/* <VStack   key={idx} space={2}> */}
            {/* <Text onPress={()=>{getfiltereditems(String(section))}} fontSize="md" fontWeight="bold" letterSpacing={'2px'} mt={4} mb={2}>
              {section}
            </Text> */}
              <Box height={'100%'} width={'100%'} >
              <ScrollView  style={{ height:'100%', marginTop:10 , backgroundColor: "white" }}   contentContainerStyle={{alignItems: 'center', justifyContent: 'center' }}   onScroll={handleinitScroll}
           scrollEventThrottle={16} 
           refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
           >
          {gettinginit &&  
            <VStack>
               <Text   color={'blue.600'} alignSelf={'center'} ml={'auto'} mr={'auto'}  fontWeight={'bold'} >fetching products</Text>
               <Spinner  ml={'auto'} mr={'auto'} alignSelf={'center'} width={'30px'} height={'30px'} color={'blue'} ></Spinner>
            </VStack>
          }

          {initerror  &&  
               <Text  color={'red.600'} alignSelf={'center'} ml={'auto'} mr={'auto'} fontWeight={'bold'} >{initerror}</Text>
          }
              {(initialresults && initialresults.length > 0)  &&  
              
              <HStack   width={'95%'} alignSelf={'center'} mr={'auto'} ml={'auto'} flexWrap={'wrap'}  alignItems={'center'} justifyContent={'center'} space={3}>
              {initialresults.map((item, i) => (
                <Pressable key={i} onPress={()=>{navigation.navigate('clickitem' , {screen:'view' , params:{item}})}}>
                  <Box
                    width={140}
                    bg="white"
                    shadow={2}
                    borderRadius="lg"
                    overflow="hidden"
                    mt={'10px'}
                    mb={'10px'}
                  >
                    <Image
                      source={{uri:`${base_url}/item_picture/${item.image}`}}
                      alt={item.name}
                      width="100%"
                      height={100}
                    />
                    <Box p={2}>
                      <Text fontSize="sm" fontWeight="bold">
                        {item.name}
                      </Text>
                      <Text color="gray.500">{item.price}</Text>
                    </Box>
                  </Box>
                </Pressable>
              ))}
            </HStack>

              

              }
               {gettingmore &&
           <Spinner     mt={'10px'}    color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'}        />
           }

           {gettingmoreerror &&  
             <Text  color={'red.600'} fontWeight={'light'} alignSelf={'center'} mt={'10px'}    >{gettingmoreerror}</Text>
           }
             
            </ScrollView>
              </Box>
       
          {/* </VStack> */}
          </>
        }
         </>
         
         }


     {/* SELECTED TAB IS FOR SHOPS */}
         {selectedtab === 'shops' &&  
         <>
           {(shopresults && shopresults?.length !== 0)&&
            <Box height={'100%'} width={'100%'} >
           <ScrollView style={{ marginTop:10 ,  flex:1 , backgroundColor: "white" , padding:2  }}  onScroll={handleScroll}  
           scrollEventThrottle={16}  
           refreshControl={
            <RefreshControl refreshing={shopsrefreshing} onRefresh={onRefreshshops} />
          }
           >
        <HStack  p={'4px'} alignItems={'center'} justifyContent={'center'} flexWrap={'wrap'}  space={3} >
          {shopresults?.map(function(val , ind){
            return(
              <Pressable key={ind} onPress={()=>{navigation.navigate('clickshop' , {screen:'shop' , params:{shop:val._id , client:true} })}} >
              <Box
                width={140}
                bg="white"
                shadow={2}
                borderRadius="lg"
                overflow="hidden"
                mt={'10px'}
                mb={'10px'}
              >
                <Image
                  source={{uri:`${base_url}/shop_picture/${val.image}`}}
                  alt={val.name}
                  width="100%"
                  height={100}
                />
                <Box p={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    {val.name}
                  </Text>
                  {/* <Text color="gray.500">{val.price}</Text> */}
                </Box>
              </Box>
            </Pressable>
            )
          })}

         
        </HStack>
        
        {gettingmoreshops &&
           <Spinner     mt={'10px'}    color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'}        />
           }

           {gettingmoreshopserror &&  
             <Text  color={'red.600'} fontWeight={'light'} alignSelf={'center'} mt={'10px'}    >{gettingmoreshopserror}</Text>
           }
        </ScrollView>
        </Box>
}

        {/* initial results , when one opens the page before doing or searching anythig */}
        {((!results)) &&
         
            <>
           {/* <VStack   key={idx} space={2}> */}
            {/* <Text onPress={()=>{getfiltereditems(String(section))}} fontSize="md" fontWeight="bold" letterSpacing={'2px'} mt={4} mb={2}>
              {section}
            </Text> */}
              <Box height={'100%'} width={'100%'} >
              <ScrollView  style={{ height:'100%', marginTop:10 , backgroundColor: "white" }}   contentContainerStyle={{alignItems: 'center', justifyContent: 'center' }}   onScroll={handleinitScroll}
           scrollEventThrottle={16} 
           refreshControl={
            <RefreshControl refreshing={shopsrefreshing} onRefresh={onRefreshshops} />
          }
           >
          {gettinginitialshops &&  
            <VStack>
               <Text   color={'blue.600'} alignSelf={'center'} ml={'auto'} mr={'auto'}  fontWeight={'bold'} >fetching shops</Text>
               <Spinner  ml={'auto'} mr={'auto'} alignSelf={'center'} width={'30px'} height={'30px'} color={'blue'} ></Spinner>
            </VStack>
          }

          {initialshopserror  &&  
               <Text  color={'red.600'} alignSelf={'center'} ml={'auto'} mr={'auto'} fontWeight={'bold'} >{initialshopserror}</Text>
          }
              {(initialshopresults && initialshopresults.length > 0)  &&  
              
              <HStack   width={'95%'} alignSelf={'center'} mr={'auto'} ml={'auto'} flexWrap={'wrap'}  alignItems={'center'} justifyContent={'center'} space={3}>
              {initialshopresults.map((shop, i) => (
                <Pressable key={i}  onPress={()=>{navigation.navigate('clickshop' , {screen:'shop' , params:{shop:shop._id , client:true} })}} >
                  <Box
                    width={140}
                    bg="white"
                    shadow={2}
                    borderRadius="lg"
                    overflow="hidden"
                    mt={'10px'}
                    mb={'10px'}
                  >
                    <Image
                      source={{uri:`${base_url}/shop_picture/${shop.image}`}}
                      alt={shop.name}
                      width="100%"
                      height={100}
                    />
                    <Box p={2}>
                      <Text fontSize="sm" fontWeight="bold">
                        {shop.name}
                      </Text>
                      {/* <Text color="gray.500">{item.price}</Text> */}
                    </Box>
                  </Box>
                </Pressable>
              ))}
            </HStack>

              

              }
               {gettingmoreshops &&
           <Spinner     mt={'10px'}    color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'}        />
           }

           {gettingmoreshopserror &&  
             <Text  color={'red.600'} fontWeight={'light'} alignSelf={'center'} mt={'10px'}    >{gettingmoreshopserror}</Text>
           }
             
            </ScrollView>
              </Box>
       
          {/* </VStack> */}
          </>
        }
         </>
         
         }

      </VStack>
 
  );
}
