import React from 'react'
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import {CameraView, useCameraPermissions} from 'expo-camera';




const useMediaFunctions = function(){
  const [MediaPermission , requestMediaPermission] = MediaLibrary.usePermissions();
  const [CameraPermission , requestCameraPermission] = useCameraPermissions();



  async function launchcamera(){
    try{
     let showcam = false;
     if(!CameraPermission.granted){
       await requestCameraPermission();
     }
   
     if(!MediaPermission.granted){
       await requestMediaPermission();
     }
   
     if(CameraPermission.granted && MediaPermission.granted){
       showcam = true;
       return showcam;
     }
     else{
       showcam = false;
       return showcam;
     }
   
    }
    catch(err){
     console.log('error accessing camera' , err);
    }
 }
 
 async function launchmedialibrary() {
      
 }
 
 async function launchimagepicker(several){
    try{
     const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: 'images',
         allowsEditing:true,
         aspect:[4,3],
         quality:1,
         allowsMultipleSelection:several?true:false,
         selectionLimit:several?5:1
     });
     if(!result.canceled){
         if(several){
          
               const uris = result.assets.map(function(item ,ind){
                 return item.uri;
             })
           return uris;
         }
         else{
             const uri = result.assets[0].uri;
             return uri;
         }
 
         
         
 
     }
     else{
         return null;
     }
    }
    catch(err){
     console.log('error launching image picker' , err);
     return null;
    }
 }
 
 
 const takepicture = async function(ref){
     try{
       // console.log('taking1')
       if(ref){
          // console.log('taking')
          const picture = await ref.takePictureAsync();
    
          const asset = await MediaLibrary.createAssetAsync(picture.uri);
          const album = await MediaLibrary.getAlbumAsync('cashcrop');
          if(album){
            await MediaLibrary.addAssetsToAlbumAsync([asset] , album ,false);
         //    setselectedimageuri(picture.uri);
                return picture.uri;
          }
          else{
            await MediaLibrary.createAlbumAsync('cashcrop' , asset , false);
         //    setselectedimageuri(picture.uri);
         return picture.uri;
          }
       }
       else{
         return null;
       }
     }
     catch(err){
       console.log('error taking picture' , err);
       return null;
     }
      }


      return {launchmedialibrary , launchimagepicker ,launchcamera , takepicture}


}


export default useMediaFunctions;


