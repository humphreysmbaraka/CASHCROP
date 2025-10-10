const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const itemschema = new mongoose.Schema({
   image:{type:mongoose.Schema.Types.ObjectId , required:false},
   name:{type:String , required:true},
   type:{type:String , required:true},
   description:{type:String , required:true},
   quantity:{type:Number , required:true},
   quantity_remaining:{type:Number , required:false},
   unit:{type:String , required:true},
   price:{type:Number , required:true},
   price_unit:{type:String , required:true},
   shop:[{type:mongoose.Schema.Types.ObjectId , required:true , ref:'shop'}],
   orders:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'user'}]

} , {timestamps:true});

const Item = mongoose.model('item' , itemschema);

module.exports = Item;