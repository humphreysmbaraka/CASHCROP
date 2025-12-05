import React, { useContext } from 'react'
import { authcontext } from '../../contexts/authcontext'
import base_url from '../constants/baseurl';



export default function useVerifyToken() {

    const {user , token , settoken , loggedin , setloggedin} = useContext(authcontext);
const  verifytoken = async function() {


  try{
   
    const status = await fetch(`${base_url}/verify_token/${token}`);
    if(status.ok){
        
    }
    else{
        settoken(null);
        setloggedin(false);
        throw new Error('not authenticated');
    }
  }
  catch(err){
    console.log('could not verify token' , err);
    throw new Error(`could not verify token  ERROR :  ${err}`);
  }
}

return verifytoken;

}
// export default useVerifyToken;