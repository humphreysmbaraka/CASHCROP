import React, { useContext } from 'react'
import { authcontext } from '../../contexts/authcontext';
import base_url from '../constants/baseurl';

const useGettoken =  function(){

    const {settoken} = useContext(authcontext);

    const gettoken = async function(){
      let token;
        try{
         
           const fetchedtoken = await fetch(`${base_url}/make_token`);
          if(fetchedtoken.ok){
            const info = await fetchedtoken.json();
            token = info.token;
          }
          else{
            token = null;
            throw new Error('token was not successfully created');
           
          }
               return token;
        }
        catch(err){
          console.log('error getting token' , err);
          throw new Error(`could not get token , ${err}`);
        }
      }

      return gettoken;

}
   
     
export default useGettoken;