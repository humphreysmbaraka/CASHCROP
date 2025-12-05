import React, { createContext, useContext } from 'react'
import { authcontext } from './authcontext';
const searchquerries = createContext();
function SEARCH_QUERRIES_PROVIDER({children}) {
   const {user} = useContext(authcontext);



  return (
     <searchquerries.Provider>
         {children}
     </searchquerries.Provider>
  )
}

export default SEARCH_QUERRIES_PROVIDER