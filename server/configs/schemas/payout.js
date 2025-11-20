const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const payoutschema = new mongoose.Schema({
    
    // order:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'order' }, //ORDER IS CREATED AFTER Payout
    total:{type:Number , required:true},
    status:{type:String , required:true , default:'PENDING' }, //[PENDING , FAILED , SUCCESS]
    instasend_id:{type:String , required:true}, 

    order:{type:mongoose.Schema.Types.ObjectId , required:false ,  ref:'order' },

    // merchantid:{type:String , required:true },
    // checkoutid:{type:String , required:true }
} , {timestamps:true});

const Payout = mongoose.model('payout' , payoutschema);

module.exports = Payout;