const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const orderschema = new mongoose.Schema({
    buyer:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'user' },
    item:{type:mongoose.Schema.Types.ObjectId , required:true ,  ref:'item' },
    quantity:{type:Number , required:true},
    total:{type:Number , required:true},
    transaction:{type:mongoose.Schema.Types.ObjectId , required:false ,  ref:'transaction' },
    // status:{type:String , required:false , default:'NEW' },  [NEW , CONFIRMED , DECLINED , CANCELLED , DELIVERED , COMPLETED , REVERSED , RETURNED , REFUNDED , MATURED , SETTLED]
    payment_method:{
        type:{
             method:{type:String , required:false}, // M-PESA OR BANK
             account_number:{type:String , required:false},  // PHONE NUMBER OR BANK ACCOUNT NUMBER
             account_name:{type:String , required:false}, // NULL FOR MPESA OR BANK ACCOUNT NUMBER
             bank_code:{type:String , required:false} ,// FOR BANK AND NULL FOR MPESA
             phone_number:{type:String , required:false} // NULL FOR BANK
        },
        required:false
    },
    isopenedbyadmin:{
        type:{
            status:{type:Boolean , default:false , required:false},
            adminstrator:{type:mongoose.Schema.Types.ObjectId , default:null , required:false}
        }, 
        required:false
    }
} , {timestamps:true});

const Order = mongoose.model('order' , orderschema);

module.exports = Order;