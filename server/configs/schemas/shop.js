const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const shopschema = new mongoose.Schema({
   image:{type:mongoose.Schema.Types.ObjectId , required:false},
   name:{type:String , required:true},
   // number:{type:String , required:true},
   type:{type:String , required:true},
   customtype:{type:String , required:false},
   visits:{type:Number , required:false},
   likes:{type:Number , required:false},
   description:{type:String , required:true},
   // role:{type:String , required:true},
   country:{type:Object , required:true},
   county:{type:Object , required:true},
   area:{type:Object , required:true},
   owner:{type:mongoose.Schema.Types.ObjectId , required:true ,ref:'user'},
   items:[{type:mongoose.Schema.Types.ObjectId , required:false ,ref:'item'}],
   orders:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'order'}],
   fans:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'user'}]// those who liked the shop
} , {timestamps:true});

const Shop = mongoose.model('shop' , shopschema);

module.exports = Shop;