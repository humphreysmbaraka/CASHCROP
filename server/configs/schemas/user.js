const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const userschema = new mongoose.Schema({
   image:{type:mongoose.Schema.Types.ObjectId , required:false},
   email:{type:String , required:true , unique:true},
   password:{type:String , required:true},
   username:{type:String , required:true},
   number:{type:String , required:true},
   OTP:{type:String , required:false , default:null},
   role:{type:String , required:true},
   country:{type:Object , required:true},
   county:{type:Object , required:true},
   area:{type:Object , required:true},
   shops:[{type:mongoose.Schema.Types.ObjectId , required:false ,ref:'shop'}],
   orders:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'order'}],
   cart:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'item'}],
   saved_items:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'item'}],
   favourite_shops:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'shop'}]
  
} , {timestamps:true});

const User = mongoose.model('user' , userschema);

module.exports = User;