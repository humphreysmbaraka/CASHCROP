import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Platform, Alert, Keyboard, ImageBackground } from "react-native";
import { 
  Box, VStack, Input, Select, CheckIcon, Button, Text, Avatar, Heading, TextArea, Spinner, Pressable, FlatList, Radio, HStack, Image 
} from "native-base";
import Constants from "expo-constants";
import base_url from "../constants/baseurl";
import { getareas, getcounties, getcountries } from "../functions/locations";
import CustomModal from "../custommodal";
import AntDesign from '@expo/vector-icons/AntDesign';
import useMediaFunctions from "../functions/mediafunctions";
import { authcontext } from "../../contexts/authcontext";
import Banksmodal from "../modals/banksmodal";


export default function shopProfile({navigation , route}) {
    const {shopid , handlereturn} = route.params || null;
    const [shop , setshop] = useState(null);
     
    console.log('SHOP PROFILE INFO' , route)
  const [name, setName] = useState(!editmode?shop?.name:shop?.name);
  const [type, setType] = useState(!editmode?shop?.type:shop?.type);
  const [customType, setCustomType] = useState(!editmode?shop?.customtype:shop?.customtype);
  const [description, setdescription] = useState(!editmode?shop?.description:shop?.description);
  const [confirmCard, setConfirmCard] = useState(false);
  const [imageuri , setimageuri] = useState(null);
  const [submiterror , setsubmiterror] = useState(null);
  const [submitting , setsubmitting]  = useState(false);
  const [countries , setcountries] = useState(null);
  const [counties , setcounties] = useState(null);
  const [areas , setareas] = useState(null);
  const [country , setcountry] = useState(!editmode?shop?.country:shop?.country);
  const [county , setcounty] = useState(!editmode?shop?.county:shop?.county);
  const [area , setarea] = useState(!editmode?shop?.area:shop?.area);
  const [showmodal ,setshowmodal] = useState(false);
  const [modaltype  ,setmodaltype] = useState(null);
  // PAYMENT AND SISBURSEMENT METHODS AND ACCOUNTS
  const [paymentmethod , setpaymentmethod] = useState(!editmode?shop?.payment_method?.method:shop?.payment_method?.method); // FOR PAYING SHOP RENT (mpesa/card)
  const [payaccount1 , setpayaccount1] = useState(!editmode?shop?.payment_method?.payment_account_number:shop?.payment_method?.payment_account_number); //MPESA NUMBER OR BANK ACCOUNT NUMBER
  const [payaccount2 , setpayaccount2] = useState(!editmode?shop?.payment_method?.payment_account_number:shop?.payment_method?.payment_account_number);
  const [disbursementmethod , setdisbursementmethod] = useState(!editmode?shop?.disbursement_method?.method:shop?.disbursement_method?.method); // FOR RECEIVING PAYMENT
  const [disburseaccount1 , setdisburseaccount1] = useState(!editmode?shop?.disbursement_method?.payment_account_number:shop?.disbursement_method?.payment_account_number); // MPESA NUMBER OR BANK ACCOUNT NUMBER
  const [disburseaccount2 , setdisburseaccount2] = useState(!editmode?shop?.disbursement_method?.payment_account_number:shop?.disbursement_method?.payment_account_number);
  const [showbanksmodal , setshowbanksmodal] = useState(false);
  const [gettingbanks , setgettingbanks] = useState(false);
  const [bankserror , setbankserror] = useState(null);
  const [banks , setbanks] = useState(null);
  const [bank , setbank] = useState(!editmode?shop?.bank:shop?.bank); // FPR PAYING SHOP RENT
  const [disbursebank , setdisbursebank] = useState(!editmode?shop?.disburse_bank:shop?.disburse_bank); // FOR RECEIVING PAYMENTS
  const [disburementbankselect ,setdisburementbankselect] = useState(false); // etermines what benk we are selecting from the modal
  // const [creating , setcreating] = useState(false);
  // const [createerror , setcreateerror] = useState[null]
  const [bankaccountname1 , setbankaccountname1] = useState(!editmode?shop?.bank_account_name:shop?.bank_account_name); // for paying rent
  const [bankaccountname2 , setbankaccountname2] = useState(!editmode?shop?.bank_account_name:shop?.bank_account_name);
  
  const [disburseaccountname1 , setdisburseaccountname1] = useState(!editmode?shop?.disburse_account_name:shop?.disburse_account_name); // for receiving payments
  const [disburseaccountname2 , setdisburseaccountname2] = useState(!editmode?shop?.disburse_account_name:shop?.disburse_account_name);
  
  const {user} = useContext(authcontext);
  
 const {launchimagepicker} = useMediaFunctions();
 
 const [editting , seteditting] = useState(false);
 const [editerror , setediterror] = useState(null);
 const [editmode , seteditmode] = useState(false);


 const [gettingshop , setgettingshop] = useState(false);
 const [getshoperror , setgetshoperror] = useState(null);

 const getshop = async function(){
     try{
        if(gettingshop){
            return;
         }
         setgettingshop(true),
         setgetshoperror(null);
        const response = await fetch(`${base_url}/get_shop/${shopid}`);
        if(response.ok){
            setgettingshop(false),
         setgetshoperror(null);
        const info = await response.json();
        console.log('SHOP INFO FETCHED' , info);
        setshop(info.shop);
        }
        else{
            const info = await response.json();
            setgettingshop(false);
            if(String(response.status).startsWith('4')){
                setgetshoperror(info.message);
            }
            else{
                setgetshoperror('server error');
            }
        }
     }catch(err){
        console.log('could not get shop' , err);
        setgettingshop(false),
        setgetshoperror('could not get shop');
        throw new Error(err);
        
     }
 }

 useEffect(function(){
   (async function(){
     try{
       await getshop();
     }
     catch(err){
        console.log('error occured when trying to fetch shop' , err);
     }
   })()
 } , [])

 useEffect(() => {
    if (shop) {
      setName(shop.name || '');
      setType(shop.type || '');
      setCustomType(shop.customtype || '');
      setdescription(shop.description || '');

      setcountry(shop.country || null);
      setcounty(shop.county || null);
      setarea(shop.area || null);

      setpaymentmethod(shop.payment_method?.method);
      setpayaccount1(shop.payment_method?.payment_account_number);
      setpayaccount2(shop.payment_method?.payment_account_number);

      setdisbursementmethod(shop.disbursement_method?.method);
      setdisburseaccount1(shop.disbursement_method?.payment_account_number);
      setdisburseaccount2(shop.disbursement_method?.payment_account_number);

      setbank(shop.bank);
      setdisbursebank(shop.disburse_bank);

      setbankaccountname1(shop.bank_account_name);
      setbankaccountname2(shop.bank_account_name);

      setdisburseaccountname1(shop.disburse_account_name);
      setdisburseaccountname2(shop.disburse_account_name);

      // etc.
    }
  }, [shop]);
  
  
 useEffect(function(){
    console.log('pay method changed' , paymentmethod);
 } , [paymentmethod])

 useEffect(function(){
  console.log('disburse method changed' , disbursementmethod)
} , [disbursementmethod])
  
  useEffect(function(){
   if(!confirmCard){
    setsubmiterror(null);
    setsubmitting(false);
   }
  } , [confirmCard])
       

  const getbanks = async function(){
 try{
  if(gettingbanks){
    return
  }
  setgettingbanks(true);
  setbankserror(null);
   const banks = await fetch(`https://api.intasend.com/api/v1/send-money/bank-codes/${country.countryCode}/` , {
    method:'GET',
    headers:{
      'Content-Type':'application/json'
    }
   });
   if(banks.ok){
    setgettingbanks(false);
    setbankserror(null);
    const info = await banks.json()
  console.log('anks fetched successfully' ,info );
   setbanks(info);

   }
   else{
    const info = await banks.json()

    setgettingbanks(false);
     if(String(banks.status).startsWith('4')){
      setbankserror(info.message);
     }
     else{
      setbankserror('server error');

     }
    console.log('could not get banks');
    setbanks([])

   }
 }
 catch(err){
  setgettingbanks(false);
  setbankserror('error');
   console.log('could not fetch banks' , err);
   setbanks([]);
   throw new Error(err)
 }
  }

  useEffect(function(){
    (async function(){
   try{
  await getbanks();
   }
   catch(err){
    console.log('coul not get banks list' , err)
   }
    })()

  } , [])



  const fetchcountries = async function(){
    const countrieslist = await getcountries();
     setcountries(countrieslist);
   }
   
   const fetchcounties = async function(){
     const countieslist = await getcounties(country?.geonameId);
      setcounties(countieslist);
    }
   
    const fetchareas = async function(){
     const arealist = await getareas(country?.countryCode , county?.adminCode1);
      setareas(arealist);
    }
   
     useEffect(function(){
       fetchcountries();
        
     } ,[]);
   
   
     useEffect(function(){
       fetchcounties();
        
     } ,[country]);
   
     useEffect(function(){
       fetchareas();
        
     } ,[county]);
  
  
  const editshop = async function(){
    try{
       if((paymentmethod=='card' && (!bankaccountname1 || bankaccountname1.trim()=='' || bankaccountname1 !== bankaccountname2)) || (disbursementmethod=='card' && (!disburseaccountname1 || disburseaccountname1.trim()=='' || disburseaccountname1 !== disburseaccountname2)) || !paymentmethod || !disbursementmethod || !payaccount1 || payaccount1.trim()=='' || payaccount1 !== payaccount2 || !disburseaccount1 || disburseaccount1.trim()=='' || disburseaccount1 !== disburseaccount2 || !name || name.trim() == '' || !type || type.trim() == ''  || !description|| description.trim() == '' ||  !imageuri|| imageuri.trim() == '' ||  !country || !county|| !area  ){
        setsubmiterror('either some fields have not been filled or are in the wrong format , recheck your data and also confirm thea account numbers match');
        return;
       }
       else{
        console.log('creating shop....');
        seteditting(true);
        setediterror(null);

        const data = new FormData();
        data.append('name' , name);
        data.append('type' , type);
        data.append('country' ,JSON.stringify( country));
        data.append('county' , JSON.stringify(county));
        data.append('area' , JSON.stringify(area));
        data.append('customtype' , customType );
        data.append('description' , description );
        data.append('owner' , user?._id);
        data.append('payment_method' , paymentmethod);
        data.append('disbursement_method' , disbursementmethod);
        data.append('payment_account' , payaccount1);
        data.append('disbursement_account' , disburseaccount1);
        data.append('bank' , JSON.stringify(bank));
        data.append('disbursebank' , JSON.stringify(disbursebank));
        data.append('disbursebankaccountname' , disburseaccountname1);
        data.append('bankaccountname' , bankaccountname1);
        data.append('shopid' , shop?._id);
        if(imageuri){
            const filename = imageuri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const fileType = match ? `image/${match[1]}` : 'image';
    
            console.log('image details' , filename , match , fileType);
    
        data.append('image', {
          uri: imageuri,
          name: filename,
          type: fileType,
        });
        }



        // data.append('image' ,  imageuri);
        // data.append('country' , country );
        // data.append('county' ,  county);
        // data.append('area' , area);
         
        const create = await fetch(`${base_url}/edit_shop` , {
          method:'PATCH',
          body:data
        })

        if(create.ok){
          seteditting(false);
          setediterror(null);
          const info = await create.json();
          const shop = info.shop;
          navigation.replace('shop' , {shop});
        }
        else{
          const info = await create.json();
          seteditting(false);
          if(String(create.status).startsWith('4')){
          setediterror(info.message);
          }
          else{
            setediterror('server error');
          }
        }
       }
    }
    catch(err){
          seteditting(false);
          setediterror('could not edit shop');
          console.log('could not edit  shop' , err);
    }
  }

  return (
    <ScrollView
      style={{ 
        flex: 1, 
        backgroundColor: "white", 
        padding: 10, 
        paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0 
      }}
    >
        {gettingshop?(
 <>
 <Text color={'blue'}   fontWeight={'light'} fontSize={'sm'} alignSelf={'center'} mt={'10px'}    >Fetching shop info.....</Text>
 <Spinner color={'blue'}  alignSelf={'center'} mr={'auto'} ml={'auto'} width={'20px'} height={'20px'}  ></Spinner>
</>
        ) :(
            getshoperror?(
                <>
                <Text color={'red.600'}   fontWeight={'light'} fontSize={'sm'} alignSelf={'center'} mt={'10px'}    >{getshoperror}</Text>
                <Button colorScheme={'blue'} borderRadius={'10px'} alignSelf={'center'} mr={'auto'} ml={'auto'} onPress={()=>{getshop()}} >RETRY</Button>
               </>
            ):(
              <>
               <Heading size="lg" mb={4}>
        Shop Profile
      </Heading>
      <Text>{shop?.name}</Text>

      {!confirmCard ? (
        <VStack space={4}>
          {/* <Avatar
            size="2xl"
            bg="gray.300"
            alignSelf="center"
            source={{uri:imageuri || null}}
          >

          </Avatar> */}


  <Image
    
        width={'90%'}
        height={'200px'}
        mt={'10px'}
        bg={"white"}
        borderRadius={'10px'}
        alignSelf={"center"}
        // position:'relative'
    
    source={{ uri:imageuri || `${base_url}/shop_picture/${shop?.image}`}}
  >
   
    
  </Image>

{editmode &&  
<>

<Text color={'blue.600'} fontWeight={'light'} alignSelf={'center'} >change  your shop's image</Text>
<Pressable width={'55px'} height={'55px'} borderRadius={'50%'} alignSelf={'center'} bg={'gray.300'} alignItems={'center'} justifyContent={'center'} onPress={async() => {
  const uri = await  launchimagepicker();
  setimageuri(uri);
  } }>
     {/* Camera icon inside pressable */}
<AntDesign name="picture" size={24} color="black" />
</Pressable>
</>
}

          <Input
            placeholder="Shop Name"
            value={name}
            onChangeText={(val) => setName(val.trim())}
            isReadOnly={!editmode}
          />

       {shop?.customtype == '' &&  
           <>
           <Select
           placeholder="Products Type"
           selectedValue={type}
           onValueChange={(val) => setType(val.trim())}
           _selectedItem={{ bg: "teal.600", endIcon: <CheckIcon size={5} /> }}
           isDisabled={!editmode}
         >
           <Select.Item label="Cereals" value="cereals" />
           <Select.Item label="Meat" value="meat" />
           <Select.Item label="Livestock" value="livestock" />
           <Select.Item label="Vegetables" value="vegetables" />
           <Select.Item label="Farm equipment" value="Farm equipment" />
           <Select.Item label="Other" value="other" />
         </Select>
           </>
       
       }

          {shop?.customtype !== ""  && (
            <Input
              placeholder="Specify other type of products you will sell"
              value={customType}
              onChangeText={(val) => setCustomType(val.trim())}
              isReadOnly={!editmode}
            />
          )}

          <Input
            placeholder="Country"
            value={country?.countryName}
            // onChangeText={(val) => setcountry(val)}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('COUNTRIES');
              Keyboard.dismiss(); // hide keyboard
            }}
            isReadOnly={!editmode}
          />
          <Input
            // isReadOnly={!editmode}
            placeholder="County"
            value={county?.name}
            // onChangeText={(val) => setcounty(val)}
            isDisabled={!country?true:false}
            isReadOnly={!editmode}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('COUNTIES');
              Keyboard.dismiss(); // hide keyboard

            }} 
          />

           <Input
             readOnly={!editmode}
            placeholder="Area"
            value={area?.name}
            // onChangeText={(val) => setarea(val)}
            isDisabled={!(country && county  )?true:false}
            isReadOnly={!editmode}
            onFocus={() => {
              setshowmodal(true);
              setmodaltype('LOCAL AREAS');
              Keyboard.dismiss(); // hide keyboard
            }}
          />

          <TextArea
              readOnly={!editmode}
            placeholder="Shop Description"
            value={description}
            onChangeText={(val) => setdescription(val.trim())}
            autoCompleteType={false}
            h={20} // default height, will expand as user types
            _focus={{ borderColor: "teal.600" }}
          />
     
        {editmode &&  
        <>
             {country &&  
        
        <>
        
<Text>select payment method(how will you be paying for this shop)</Text>

{/* <HStack alignItems={'center'} justifyContent={'space-around'} width={'100%'} p={'2px'} >
          <Button width={'40%'} onPress={()=>{
             setpaymentmethod('mpesa');
          }}  colorScheme={!paymentmethod?'gray':paymentmethod == 'mpesa'?'blue':'white'}   borderRadius={'10px'}  >M-PESA</Button>

        <Button width={'40%'} onPress={()=>{
             setpaymentmethod('card');
          }}  colorScheme={!paymentmethod?'gray':paymentmethod !== 'mpesa'?'blue':'white'}  borderRadius={'10px'}  >BANK CARD</Button>

        </HStack> */}

<HStack alignItems={'center'} justifyContent={'space-around'} width={'100%'} p={'2px'}>
  <Button 
    width={'40%'} 
    onPress={() => setpaymentmethod('mpesa')}  
    colorScheme={paymentmethod === 'mpesa' ? 'blue' : 'gray'} 
    borderRadius={'10px'}
  >
    M-PESA
  </Button>

  <Button 
    width={'40%'} 
    onPress={() => setpaymentmethod('card')}  
    colorScheme={paymentmethod === 'card' ? 'blue' : 'gray'} 
    borderRadius={'10px'}
  >
    BANK CARD
  </Button>
</HStack>

     
     {/* <Radio.Group
          name="paymentMethod"
          value={paymentmethod}
          onChange={(val) => {
            if(val == paymentmethod){
              setpaymentmethod(null);
            }
            else{
              setpaymentmethod(val);
            }
           
          }}
        >
          <Radio value="mpesa" my={1}>
            M-Pesa
          </Radio>

          <Radio value="card" my={1}>
            Bank Card
          </Radio>

         
        </Radio.Group> */}

        {paymentmethod &&  
        
        <>
     {(paymentmethod == 'card') &&  
        
      <>
          <Pressable  
           onPress={() => {
            Keyboard.dismiss(); // hide keyboard
            setdisburementbankselect(false);
            setshowbanksmodal(true);
           
          }}
          >
          <Input
            placeholder="select bank "
            value={bank?.bank_name}
            isReadOnly={true}
           
          />
          </Pressable>



       {bank &&  
       
      <>
      
      < Input
       placeholder={'enter bank account name'}
       value={bankaccountname1}
       onChangeText={(val) => setbankaccountname1(val)}
       isReadOnly={!editmode}
     />

     <Input
       placeholder='confirm account name'
       value={bankaccountname2}
       onChangeText={(val) => setbankaccountname2(val)}
       isReadOnly={!editmode}

     />
      </>
       }
      
      </>
     
     }

            <Input
        placeholder={(paymentmethod == 'mpesa')?'enter mpesa number':'enter bank account number'}
        value={payaccount1}
        onChangeText={(val) => setpayaccount1(val)}
        isReadOnly={!editmode}

      />

      <Input
        placeholder='confirm number'
        value={payaccount2}
        onChangeText={(val) => setpayaccount2(val)}
        isReadOnly={!editmode}

      /> 
        </>
        
        }

        </>
        
        }

        

        {country && 
        
        <>
        
        <Text>select disbursement method(how will you be receiving payment in this shop )</Text>

        {/* <HStack alignItems={'center'} justifyContent={'space-around'} width={'100%'} p={'2px'} >
          <Button width={'40%'} onPress={()=>{
             setdisbursementmethod('mpesa');
          }}  colorScheme={!disbursementmethod?'gray':disbursementmethod == 'mpesa'?'blue':'white'}   borderRadius={'10px'}  >M-PESA</Button>

        <Button width={'40%'} onPress={()=>{
             setdisbursementmethod('card');
          }}  colorScheme={!disbursementmethod?'gray':disbursementmethod !== 'mpesa'?'blue':'white'}  borderRadius={'10px'}  >BANK CARD</Button>

        </HStack> */}

<HStack alignItems={'center'} justifyContent={'space-around'} width={'100%'} p={'2px'}>
  <Button 
    width={'40%'} 
    onPress={() => setdisbursementmethod('mpesa')}  
    colorScheme={disbursementmethod === 'mpesa' ? 'blue' : 'gray'} 
    borderRadius={'10px'}
  >
    M-PESA
  </Button>

  <Button 
    width={'40%'} 
    onPress={() => setdisbursementmethod('card')}  
    colorScheme={disbursementmethod === 'card' ? 'blue' : 'gray'} 
    borderRadius={'10px'}
  >
    BANK CARD
  </Button>
</HStack>
{/*      
     <Radio.Group
          name="disbursemethod"
          value={disbursementmethod}
          onChange={(val) => {
             if(val == disbursementmethod){
              setdisbursementmethod(null)
             }else{
              setdisbursementmethod(val);
             }
          
          }}
        >
          <Radio value="mpesa" my={1}>
            M-Pesa
          </Radio>

          <Radio value="card" my={1}>
            Bank Card
          </Radio>

         
        </Radio.Group> */}

        
        {disbursementmethod &&  

        
        
        <>

{(disbursementmethod == 'card') &&  
        
        <>
           <Pressable 
            onPress={() => {
              setdisburementbankselect(true);
              setshowbanksmodal(true);
              Keyboard.dismiss(); // hide keyboard
            }}
           >
           <Input
              placeholder="select bank "
              value={bank}
              isReadOnly={true}
             
            />
           </Pressable>
        

        {disbursebank &&  
       
       <>
       
       < Input
        placeholder={'enter bank account name'}
        value={disburseaccountname1}
        onChangeText={(val) => setdisburseaccountname1(val)}
        isReadOnly={!editmode}

        
      />
 
      <Input
        placeholder='confirm account name'
        value={disburseaccountname2}
        onChangeText={(val) =>setdisburseaccountname2(val)}
        isReadOnly={!editmode}

        
      />
       </>
        }

        </>
       
       }


            <Input
        placeholder={(disbursementmethod == 'mpesa')?'enter mpesa number':'enter bank account number'}
        value={disburseaccount1}
        onChangeText={(val) => setdisburseaccount1(val)}
        isReadOnly={!editmode}

        
      />

      <Input
        placeholder='confirm number'
        value={disburseaccount2}
        onChangeText={(val) => setdisburseaccount2(val)}
        isReadOnly={!editmode}

        
      /> 
  

      
        </>
        
        }

        
        </>

        }
        </>
        
        }

          {!editmode  &&  
          <Button mb={'60px'} onPress={()=>{seteditmode(true)}}>EDIT PROFILE</Button>
          }
          <Button mb={'60px'}  onPress={() => {editmode?seteditmode(false):navigation.goBack()}}>{editmode?'CANCEL':'BACK'}</Button>

          {showmodal &&   
        // <CustomModal    isOpen={showmodal}  onClose={()=>{setshowmodal(false)}}  title={!country?'COUNTRIES':(country && !county)?'COUNTIES':(country && county)?'LOCAL AREAS':''}  items={!country?{countries}:(country && !county)?{counties}:(country && county)?{areas}:''}  setselectedcountry={setcountry} setselectedcounty={setcounty} setselectedarea={setarea}     />
        <CustomModal    isOpen={showmodal}  onClose={()=>{setshowmodal(false)}}  title={modaltype}  items={(modaltype == 'COUNTRIES')?countries:(modaltype == 'COUNTIES')?counties:(modaltype == 'LOCAL AREAS')?areas:[]}  setselectedcountry={setcountry} setselectedcounty={setcounty} setselectedarea={setarea}     />

     }
     

        </VStack>
      ) : (
        <Box bg="gray.50" p={4} borderRadius="lg" shadow={1}>

            <Avatar
              size="2xl"
            bg="gray.300"
            alignSelf="center"
            source={{uri:imageuri || `${base_url}/shop_picture/${shop?.image}`}}
          />
          <Text fontWeight="bold">{name}</Text>
          <Text>
            Products Type: {type === "other" ? customType : type}
          </Text>
          <Text>
            Location: {county?.name}, {country?.countryName}
          </Text>
          <Text mt={2}>Description: {description}</Text>

          {editerror && 
            <Text alignSelf={'center'} color={'red.400'} >{editerror}</Text>
          }
          {/* <Button mt={2} onPress={() =>{navigation.navigate('shop')}}> */}
          <Button mt={2}  alignItems={'center'} justifyContent={'center'} >
            CONFIRM
            {editting && 
              <Spinner alignSelf={'center'} mr={'auto'} ml={'auto'}  width={'10px'} height={'10px'} color={'white'}             />
            }
          </Button>
          <Button mt={2} mb={'60px'} variant="ghost" onPress={() => setConfirmCard(false)}>
            Back
          </Button>
        </Box>
      )}
      {showbanksmodal &&  
       <Banksmodal disbursementbankselect={disburementbankselect}  setdisbursebank={setdisbursebank}  data={banks} getbanks={getbanks} gettingbanks={gettingbanks} bankserror={bankserror}  setbank={setbank}   isOpen={showbanksmodal} onClose={function(){
        if(disburementbankselect){
          setdisburementbankselect(false);
        }
        setshowbanksmodal(false);
      }}                          />
      }
              </>  
            )
          
        )
       
        }

       
     
    </ScrollView>
  );
}
