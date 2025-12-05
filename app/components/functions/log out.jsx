import React, { useContext } from 'react'
import { authcontext } from '../../contexts/authcontext'
import base_url from '../constants/baseurl';
// import base_url from '../../contexts/baseurl';

function useLogout(){
    const {user , loggedin , token} = useContext(authcontext);
    const logout = async function(){
         try{
           const logout = await fetch(`${base_url}/log_out/${token}`);
           
         }
         catch(err){
            console.log('could not trigger a log out' ,err);
            throw new Error(`could not trigger a log out : ${err}`);
         }
    }
}


export default useLogout