const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const orderschema = new mongoose.Schema({
    buyer:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'user' },
    // seller:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'shop' },
    item:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'item' },
    quantity:{type:Number , required:true},
    total:{type:Number , required:true},
    transaction:{type:mongoose.Schema.Types.ObjectId , required:false ,  ref:'transaction' },
    status:{type:String , required:false , default:'pending' },
   
//     image:{type:mongoose.Schema.Types.ObjectId , required:false},
//    name:{type:String , required:true},
//    type:{type:String , required:true},
//    description:{type:String , required:true},
//    quantity:{type:Number , required:true},
//    quantity_remaining:{type:Number , required:false},
//    unit:{type:String , required:true},
//    price:{type:Number , required:true},
//    price_unit:{type:String , required:true},
//    shop:[{type:mongooe.Schema.Types.ObjectId , required:true , ref:'shop'}],
//    orders:[{type:mongooe.Schema.Types.ObjectId , required:false , ref:'user'}]

} , {timestamps:true});

const Order = mongoose.model('order' , orderschema);

module.exports = Order;