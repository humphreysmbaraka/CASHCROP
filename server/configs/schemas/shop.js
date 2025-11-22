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
   payment_method: {
      type: {
        method: { type: String, required: true , default:null }, // [mpesa , card]
        payment_account_number: { type: String, required: true  ,  default:null }
      },
      required: true
    },
    disbursement_method: {
      type: {
        method: { type: String, required: true ,  default:null  }, // [mpesa , card]
        payment_account_number: { type: String, required: true  ,  default:null }
      },
      required: true
    },
    
    
   // role:{type:String , required:true},
   country:{type:Object , required:true},
   county:{type:Object , required:true},
   area:{type:Object , required:true},
   bank:{type:Object , required:true}, // FOR MAKING PAYMENTS
   disburse_bank:{type:Object , required:true}, // FOR RECEIVING PAYMENT
   bank_account_name:{type:String , required:true}, // FOR MAKING PAYMENTS
   disburse_account_name:{type:String , required:true}, // FOR RECEIVING PAYMENTS


    
   owner:{type:mongoose.Schema.Types.ObjectId , required:false ,ref:'user'},
   items:[{type:mongoose.Schema.Types.ObjectId , required:false ,ref:'item'}],
   orders:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'order'}],
   // fans:[{type:mongoose.Schema.Types.ObjectId , required:false , ref:'user'}]// those who liked the shop
} , {timestamps:true});

const Shop = mongoose.model('shop' , shopschema);

module.exports = Shop;