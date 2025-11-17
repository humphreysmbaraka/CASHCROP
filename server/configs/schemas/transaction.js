const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const transactionschema = new mongoose.Schema({
    
    // order:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'order' }, //ORDER IS CREATED AFTER TRANSACTION
    total:{type:Number , required:true},
    status:{type:String , required:false , default:'pending' },
    // merchantid:{type:String , required:true },
    // checkoutid:{type:String , required:true }
} , {timestamps:true});

const Transaction = mongoose.model('transaction' , transactionschema);

module.exports = Order;