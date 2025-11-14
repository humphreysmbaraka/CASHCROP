// ShoppingPage.jsx
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
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
  const [results , setresults] = useState(null);  //results after searching
  const [looking, setlooking] = useState(false);
  const [searcherror , setsearcherror] = useState(null);
  const [page , setpage] = useState(0);
  const [gettingmore , setgettingmore] = useState(false);

  // for when getting initial items to display
  const [initialresults , setinitialresults] = useState(null);
  const [gettinginit , setgettinginit] = useState(false);
  const [initerror , setiniterror] = useState(null);

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



   
   const search = async function(){
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
       setlooking(true);
       setsearcherror(null);
       setpage(function(prev){
        return prev + 1;
       })
      //  setquery(query);
      //  setcurrentquery(query);
       const res = await fetch(`${base_url}/search/${currentquery}/${page+1}`);
       if(res.ok){
        setsearcherror(false);
        setlooking(false);
         const info = await res.json();
         setresults(function(prev){
          return [...prev , ...info.results];
        })
    
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






   const handleScroll =async ({ nativeEvent }) => {
         try{
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

          // Check if user has scrolled to the bottom
          const isEnd =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
      
          if (isEnd) {
            console.log("Reached bottom!");
            await searchmore();
          }

         }
         catch(err){
         console.log('could not fetch more results' , err);
         }
  };

  

   

  return (
   
      <VStack flex={1}  bg={'white'}  paddingTop={Platform.OS==='android'?Constants.statusBarHeight:0 } pace={4} padding={4} pb={'70px'} >
        {/* Search Bar */}
        <Input
          placeholder="Search for items..."
          value={query}
          onChangeText={(val)=>{
            setquery(val.trim())}}
          size="lg"
          bg="gray.100"
          borderRadius="full"
        />

        {/* Conditional Results */}
        {(query?.length > 0 && matches) && (
          <Box mt={'5px'} bg={'black'} width={'95%'}  maxH={'300px'} alignItems={'center'} justifyContent={'center'} borderWidth={0} borderRadius={'10px'} p={'2px'} >
            
          
          <FlatList  width={'100%'}  initialNumToRender={15} maxToRenderPerBatch={20}  windowSize={5} data={matches} keyExtractor={function(item , index){return index.toString()}}     renderItem={function({item}){
            return(
              <Pressable   onPress={()=>{clickedrecomendation(item.trim())}}  width={'98%'} height={'35px'} mt={'5px'} mb={'5px'} borderBottomColor={'black'} borderBottomWidth={'1px'}            >
                <Text width={'90%'} textAlign={'left'} fontSize={'sm'} fontWeight={'bold'} color={'white'} >{item.name}</Text>
              </Pressable>
            )
          }}              />



          </Box>
        )}

        {(results && results?.length !== 0)&&
           <ScrollView style={{ flex: 1, backgroundColor: "white" , paddingTop:Platform.OS==='android'?Constants.statusBarHeight:0 }}  onScroll={handleScroll}
           scrollEventThrottle={16}   >
        <HStack  p={'4px'} alignItems={'center'} justifyContent={'center'} flexWrap={'wrap'}  >
          {results?.map(function(val , ind){
            return(
              <Pressable key={ind} onPress={()=>{navigation.navigate('clickitem' , {screen:'view' , params:{item}})}}>
              <Box
                width={140}
                bg="white"
                shadow={2}
                borderRadius="lg"
                overflow="hidden"
              >
                <Image
                  source={{uri:item.image}}
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
            )
          })}

          {gettingmore && <Spinner         color={'blue'} width={'30px'} height={'30px'} alignSelf={'center'}        />}
        </HStack>
        </ScrollView>
}

        {/* initial results , when one opens the page before doing or searching anythig */}
        {((!results) && (initialresults && initialresults.length > 0)) &&
         
            <>
           {/* <VStack   key={idx} space={2}> */}
            {/* <Text onPress={()=>{getfiltereditems(String(section))}} fontSize="md" fontWeight="bold" letterSpacing={'2px'} mt={4} mb={2}>
              {section}
            </Text> */}
              <ScrollView style={{ flex: 1, backgroundColor: "white" , paddingTop:Platform.OS==='android'?Constants.statusBarHeight:0 }}  onScroll={handleScroll}
    scrollEventThrottle={16}   >
              <HStack   width={'95%'} alignSelf={'center'} flexWrap={'wrap'}  space={3}>
                {initialresults.map((item, i) => (
                  <Pressable key={i} onPress={()=>{navigation.navigate('clickitem' , {screen:'view' , params:{item}})}}>
                    <Box
                      width={140}
                      bg="white"
                      shadow={2}
                      borderRadius="lg"
                      overflow="hidden"
                      bgColor={'black'}
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
              {gettinginit &&  
               <Spinner  color={'blue.400'} size={'20x'} alignSelf={'center'} mr={'auto'}  ml={'auto'}     />
              }
              {initerror &&  
                <Text color={'red.600'} alignSelf={'center'} mr={'auto'}  ml={'auto'}  >{initerror}</Text>
              }
            </ScrollView>
          {/* </VStack> */}
          </>
        }
      </VStack>
 
  );
}
