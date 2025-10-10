import React, { useContext } from 'react'
import { authcontext } from '../../contexts/authcontext';
import base_url from '../constants/baseurl';

const useGettoken =  function(){

    const {settoken} = useContext(authcontext);

    const gettoken = async function(){
        try{
          
          const token = await fetch(`${base_url}/make_token`);
          if(token.ok){
            const info = await token.json();
            settoken(info.token);
          }
          else{
            throw new Error('token was not successfully created');
          }
        }
        catch(err){
          console.log('error getting token' , err);
          throw new Error(`could not get token , ${err}`);
        }
      }

      return gettoken;

}


export default useGettoken;