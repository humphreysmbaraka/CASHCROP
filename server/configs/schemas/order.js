const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const orderschema = new mongoose.Schema({
    buyer:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'user' },
    item:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'item' },
    quantity:{type:Number , required:true},
    total:{type:Number , required:true},
    transaction:{type:mongoose.Schema.Types.ObjectId , required:false ,  ref:'transaction' },
    status:{type:String , required:false , default:'PENDING' },  // STARTS WITH PENDING , CAN GET CANCELLED , AFTER BEING DELIVERED AND NO REFUND IS INITIATED IN 2 DAYS , THEN IT BECOMES COMPLETED values =>[PENDING , CANCELLED , CONFIRMED , TRANSPORTING , DELIVERED , COMPLETED , FAILED , DONE]
    
} , {timestamps:true});

const Order = mongoose.model('order' , orderschema);

module.exports = Order;