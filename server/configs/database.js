const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const express = require('express');


const connect = async function(){
    try{
      await mongoose.connect(process.env.CONNECTION_STRING , {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      })
      console.log('connected to database');
    }
    catch(err){
        console.log('could not connect to database' , err);
    }   
}


module.exports = {connect};  