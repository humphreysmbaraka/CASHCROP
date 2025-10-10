import React from 'react'

async function getcountries() {
   try{
     const countries = await fetch(`http://api.geonames.org/countryInfoJSON?username=humphreeze`);
     if(countries.ok){
        
       const list = await countries.json();
       return list.geonames;
     }
     else{
        console.log('error getting countries');
        return null;
     }
 

   }
   catch(err){
    console.log('error getting countries' , err);
    return null;
   }
}

async function getcounties(code) {
    try{
        const counties = await fetch(`http://api.geonames.org/childrenJSON?geonameId=${code}&username=humphreeze`);
        if(counties.ok){
           
          const list = await counties.json();
          return list.geonames;
        }
        else{
           console.log('error getting counties');
           return null;
        }
    
    }
    catch(err){
     console.log('error getting counties' , err);
     return null;
    }
}


async function getareas(code1 , code2) {
    try{
        const areas = await fetch(`http://api.geonames.org/searchJSON?country=${county.countryCode}&adminCode1=${county.adminCode1}&featureClass=P&maxRows=1000&username=humphreeze`);
        if(areas.ok){
           
          const list = await areas.json();
          return list.geonames;
        }
        else{
           console.log('error getting areas');
           return null;
        }
    
    }
    catch(err){
     console.log('error getting areas' , err);
     return null;
    }
}
export {getcountries , getcounties , getareas};