const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const orderschema = new mongoose.Schema({
    buyer:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'user' },
    item:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'item' },
    quantity:{type:Number , required:true},
    total:{type:Number , required:true},
    transaction:{type:mongoose.Schema.Types.ObjectId , required:false ,  ref:'transaction' },
    status:{type:String , required:false , default:'PENDING' },  // STARTS WITH PENDING , CAN GET CANCELLED , REFUNDED ,  AFTER BEING DELIVERED AND NO REFUND IS INITIATED IN 2 DAYS , THEN IT BECOMES COMPLETED values =>[PENDING , CANCELLED , CONFIRMED , TRANSPORTING , DELIVERED , COMPLETED , FAILED , DONE]
    payment_method:{
        type:{
             method:{type:String , required:true}, // M-PESA OR BANK
             account_number:{type:String , required:true},  // PHONE NUMBER OR BANK ACCOUNT NUMBER
             account_name:{type:String , required:false}, // NULL FOR MPESA OR BANK ACCOUNT NUMBER
             bank_code:{type:String , required:false} ,// FOR BANK AND NULL FOR MPESA
             phone_number:{type:String , required:true} // NULL FOR BANK
        },
        required:true
    }
} , {timestamps:true});

const Order = mongoose.model('order' , orderschema);

module.exports = Order;