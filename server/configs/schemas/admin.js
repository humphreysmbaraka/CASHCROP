const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const adminschema = new mongoose.Schema({
  
   password:{type:String , required:true},
   username:{type:String , required:true},
   payouts:[{type:mongoose.Schema.Types.ObjectId , required:false ,  ref:'payout'}]
  
} , {timestamps:true});

const Admin = mongoose.model('admin' , adminschema);

module.exports = Admin;