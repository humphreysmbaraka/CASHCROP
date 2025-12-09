const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const router = express.Router();
const mongoose = require('mongoose');
const {GridFSBucket, ObjectId, Timestamp} = require('mongodb');
const fs = require('fs');
const User = require('./schemas/user');
const bcrypt = require('bcrypt');
const Shop = require('./schemas/shop');
const Item = require('./schemas/item');
const {Readable} = require('stream');
const {Expo}= require('expo-server-sdk');   // FOR SENDING EXPO PUSH NOTIFICATIONS
const Order = require('./schemas/order');
const Transaction = require('./schemas/transaction');
const Payout = require('./schemas/payout');
const Admin = require('./schemas/admin');











  // SETUP FOR EXPO PUSH NOTIFICATIONS



let expoclient = new Expo();

const sendExpoNotification = async function(receiverId, message, title) {

    try {
      const user = await User.findOne({ _id: receiverId });
      if (!user || !user.expopushtoken?.length) {
        console.log('Could not send notification, no such user or no tokens found');
        return;
      }
  
      // Filter valid tokens
      const validTokens = user?.expopushtokens.filter(Expo.isExpoPushToken);
  
      if (validTokens.length === 0) {
        console.log('No valid Expo push tokens found');
        return;
      }
  
      // Create messages
      const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body: message,
        // data: { receiverId } optional extra data
      }));
  
      // Chunk messages
      const chunks = expoclient.chunkPushNotifications(messages);
  
      // Send each chunk sequentially
      for (const chunk of chunks) {
        const receipts = await expoclient.sendPushNotificationsAsync(chunk);
        console.log('Notification receipts:', receipts);
      }
  
      console.log('Expo notifications sent successfully');
    } catch (err) {
      console.log('Error sending Expo push notification:', err);
    }
  };









          // DEFINE GRIDFS BUCKETS FOR FILE UPLOADS


const conn = mongoose.createConnection(process.env.CONNECTION_STRING);
let profilepicsbucket;
let itempicsbucket;
let shoppicsbucket;

conn.once('open' , function(){

profilepicsbucket = new GridFSBucket(conn.db , {
    bucketName:'profile pictures',
    chunkSizeBytes:1048576
})




shoppicsbucket = new GridFSBucket(conn.db , {
    bucketName:'shop pictures',
    chunkSizeBytes:1048576
})



itempicsbucket = new GridFSBucket(conn.db , {
    bucketName:'item pictures',
    chunkSizeBytes:1048576
})
})



                 //  MULTER STORAGE ALTERNATIVES


const localstorage = multer.diskStorage({
    destination :  function(req , file , cd){
      cd(null ,'../uploads' );
    },
    name : function(req , file , cb){
     cb(null , file.originalname);
    }
})

const memstorage = multer.memoryStorage();

const diskuploader = multer({storage:localstorage});
const memuploader = multer({storage:memstorage});






// token maker

// router.get(`/make_token` , async function(req , res){
//     try{
//         const payload = {
//             issuedAt: Date.now(),      // just to have some info
//             type: "generic-token",     // optional custom info
//           };
//       const token =  jwt.sign(payload , process.env.JWT_SIGN , {expiresIn:"10m"} );
//        if(token){
//         return res.status(200).json({error:false, message:'token create' , token});
//        }
//     }
//     catch(err){
//         console.log('error making token' , err);
//         return res.status(500).json({error:true , message:'server error' , problem:err});
//     }
// })


// MAKE TOKEN FOR OTHER USERS

const normaltokenmaker = async function(id){
    try{
  const token = jwt.sign({id} , process.env.JWT_SIGN , {expiresIn:'5d'});
  console.log('token created successfully');
  return token;
    }
    catch(err){
        console.log('error occured when creatingtoken' , err);
        throw new Error(err);
    }
}




// MAKE WEB BASED TOKEN FOR ADMINS

const tokenmaker = async function(id){
    try{
  const token = jwt.sign({id} , process.env.JWT_SIGN , {expiresIn:'5d'});
  console.log('token created successfully');
  return token;
    }
    catch(err){
        console.log('error occured when creatingtoken' , err);
        throw new Error(err);
    }
}




// COOKIE VALIDATION FOR WEB BASED ADMINS

const verifycookiemiddlewear = async function(req , res , next){
   try{
    const token = req.cookies[process.env.ADMIN_WEB_COOKIE_NAME];
    if(token){
  const decode = jwt.verify(token , process.env.JWT_SIGN);
  if(decode){
      const user = await Admin.findOne({_id:decode.id});
      if(user){
       req.user = user;
       next();
      }
      else{
        console.log('could not extract user info from token');
        throw new Error('could not extract user info from token');
      }
  }
  else{
    console.log('could not decode token');
    throw new Error('could not decode token');
  }
    }
    else{
        console.log('token not found');
        throw new Error('token not found');
    }
   }
   catch(err){
    console.log('error occured when varifying cookie token' , err);
    throw new Error(err);
   }
}



const verifytokenfunction = async function(req , res ){  // FOR ADMINS
    try{
     const token = req.cookies[process.env.ADMIN_WEB_COOKIE_NAME];
     if(token){
   const decode = jwt.verify(token , process.env.JWT_SIGN);
   if(decode){
       const user = await Admin.findOne({_id:decode.id});
       if(user){
        req.user = user;
        // next();
       }
       else{
         console.log('could not extract user info from token');
        //  throw new Error('could not extract user info from token');
        res.cookie(process.env.ADMIN_WEB_COOKIE_NAME, '', {
            httpOnly: true,
            secure:true,
            sameSite: 'None',
            maxAge:0
           
          });
          return res.status(400).json({error:true , message:'could not extract user info from token'})

       }
    //    return res.status(400).json({error:true , message:'could not extract user info from token'})

   }
   else{
     console.log('could not decode token');
    //  throw new Error('could not decode token');
    res.cookie(process.env.ADMIN_WEB_COOKIE_NAME, '', {
        httpOnly: true,
        secure:true,
        sameSite: 'None',
        maxAge:0
       
      });
    return res.status(400).json({error:true , message:'could not decode token'})
   }
     }
     else{
         console.log('token not found');
        //  throw new Error('token not found');
        return res.status(400).json({error:true , message:'token was not found'})

     }
    }
    catch(err){
     console.log('error occured when verifying cookie token' , err);
    //  throw new Error(err);
    return res.status(500).json({error:true , message:'server error' , problem:err})

    }
 }
 
 

router.post(`/token_validation` , async function(req , res){  // FOR REGULAR CASHCROP USERS
    try{
      const {token} = req.body;
      if(token){
        const decode = jwt.verify(token , process.env.JWT_SIGN);
        if(decode){
            const user = await User.findOne({_id:decode.id});
            if(user){
             console.log('user info successfully extracted from token')
              return res.status(200).json({user})
            }
            else{
              console.log('could not extract user info from token');
              return res.status(400).json({error:true , message:'could not extract user info from token'});
            }
        }
        else{
          console.log('could not decode token');
          return res.status(400).json({error:true , message:'could not decode token'});

        }
          }
          else{
            console.log('token not found');
            return res.status(400).json({error:true , message:'token not found'});

        }
      }
     
   
      
    
    catch(err){
        console.log('error when verifying token' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})




// ADMIN COLLECTION FETCHES



router.get(`/admin_orders_fetch/:user/:page` , async function(req , res){  // SHOULD BE A PROTECTED ROUTE VIA COOKIE/TOKEN VALIDATION
    try{
    //   cons
        const {user , page} = req.params;
        const limit = 30;
        const account = await Admin.findOne({_id:new ObjectId(user)});
        if(!account){
             console.log('user not found among admins');
             return res.status(400).json({error:true , message:'user is not an admin'})


        }
       const orders = await Order.find().populate([
        {path:'buyer'},
        {path:'item' , populate:[
            {path:'shop' , populate:[
                     {path:'owner'},
                     {path:'items'}
            ]},

        ]},
        {path:'transaction'}
      ]).skip(page*limit).limit(limit);

       if(orders && orders.length !== 0){
         console.log('orders found');
         return res.status(200).json({error:false , message:'orders found' , orders:orders})
       }
       else if(orders && orders.length == 0){
        return res.status(200).json({error:false , message:'order founds' , orders:[]})

       }

       else if(!orders){
        console.log('no orders found');
        return res.status(400).json({error:true , message:'no order founds'})

       }
      
    }
    catch(err){
        console.log('error getting orders' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})





router.get(`/admin_payments_fetch` , async function(req , res){    //PAYMENTS MADE BY EMPLOYEES: SHOULD BE A PROTECTED ROUTE VIA COOKIE/TOKEN VALIDATION
    try{
    //   cons
        const {user , page} = req.body;
        const limit = 30;
        const account = await Admin.findOne({_id:new ObjectId(user)});
        if(!account){
             console.log('user not found among admins');
             return res.status(400).json({error:true , message:'user is not an admin'})


        }
       const payments = await Transaction.find().populate([
        {path:'buyer'},
        {path:'seller'},
        {path:'item'},
        
      ]).skip(page*limit).limit(limit);

       if(payments && payments.length !== 0){
         console.log('orders found');
         return res.status(200).json({error:false , message:'orders found' , payments:payments})
       }
       else if(payments && payments.length == 0){
        return res.status(200).json({error:false , payments:[]})

       }

       else if(!payments){
        console.log('no payments found');
        return res.status(400).json({error:true , message:'no payments founds'})

       }
      
    }
    catch(err){
        console.log('error getting payments' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})




router.get(`/admin_payouts_fetch/:user` , async function(req , res){  // SHOULD BE A PROTECTED ROUTE VIA COOKIE/TOKEN VALIDATION
    try{
    //   cons
        const  {user} = req.params;
        
        const account = await Admin.findOne({_id:new ObjectId(user)});
        if(!account){
             console.log('user not found among admins');
             return res.status(400).json({error:true , message:'user is not an admin'})


        }

        const payouts = account.payouts;

        if(payouts || payouts.length == 0){
            console.log('you have initiated no payouts yet');
            return res.status(200).json({error:false , message:'no payouts yet' , payouts:[]})

        }

       const payoutpromises =  payouts.map(function(val){
            return Payout.findOne({_id:new ObjectId(val)}).populate('administrator order').exec();
        })

        const payoutsobjects = await Promose.all(payoutpromises);

      
       if(payoutsobjects && payoutsobjects.length !== 0){
         console.log('payouts found');
         return res.status(200).json({error:false , message:'payouts found' , payouts:payoutsobjects})
       }


       if(payoutsobjects && payoutsobjects.length == 0){
        console.log('no payouts found');
        return res.status(200).json({error:false , message:'no payouts found' , payouts:[]})
      }
      

      
      
    }
    catch(err){
        console.log('error getting payouts' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})






                // GETTING OBJECTS



router.get(`/get_user/:id` , async function(req , res){
    try{
       const id = req.params.id;
       const user = await User.findOne({_id:new ObjectId(id)});
       if(user){
         console.log('user found');
         return res.status(200).json({error:false , message:'user found' ,user:user})
       }
       else{
        console.log('no such user found');
        return res.status(400).json({error:true , message:'no user found'})
       }
    }
    catch(err){
        console.log('error getting user' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})


router.get(`/get_shop/:id` , async function(req , res){
    try{
       const id = req.params.id;
       const shop = await Shop.findOne({_id:new ObjectId(id)}).populate('items').populate('owner');
       if(shop){
         console.log('shop found');
         return res.status(200).json({error:false , message:'shop found' , shop:shop})
       }
       else{
        console.log('no such shop found');
        return res.status(400).json({error:true , message:'no shop found'})
       }
    }
    catch(err){
        console.log('error getting shop' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})




router.get(`/get_item/:id` , async function(req , res){
    try{
       const id = req.params.id;
       const item = await Item.findOne({_id:new ObjectId(id)});
       if(item){
         console.log('item found');
         return res.status(200).json({error:false , message:'item found' , item:item})
       }
       else{
        console.log('no such item found');
        return res.status(400).json({error:true , message:'no item found'})
       }
    }
    catch(err){
        console.log('error getting item' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})


router.get(`/get_order/:id` , async function(req , res){
    try{
       const id = req.params.id;
       const order = await Order.findOne({_id:new ObjectId(id)}).populate([
        {path:'buyer'},
        {path:'item' , populate:[
            {path:'shop' , populate:[
                     {path:'owner'},
                     {path:'items'}
            ]},

        ]},
        {path:'transaction'}
      ]);

       if(order){
         console.log('order found');
         return res.status(200).json({error:false , message:'order found' , order:order})
       }
       else{
        console.log('no such order found');
        return res.status(400).json({error:true , message:'no order found'})
       }
    }
    catch(err){
        console.log('error getting order' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})



           //STREAMING IMAGES

router.get(`/profile_picture/:id` , async function(req , res){
    try{
        const id = req.params.id;  // NOT THE USER I , BUT THE IMAGE FILE ID FROM THE USER OBJECT
        const file = await profilepicsbucket.find({_id:new ObjectId(id)}).toArray();
        if(file?.length > 0){
            console.log('image found'  , file)
            res.set('Content-Type', file.metadata?.type || 'image/jpeg'  );
            
            const downloadstream = profilepicsbucket.openDownloadStream(new ObjectId(id));
            downloadstream.pipe(res);
            downloadstream.on('error' , function(err){
                console.log('error streaming profile picture' , err);
                return res.status(500).json({error:true , problem:err , message:'streaming error'});
            })
        }
        else{
            console.log('user has no profile picture');
            return res.status(400).json({error:true , message:'user has no picture'});
        }

    }
    catch(err){
        console.log('error getting profile picture' , err);
        return res.status(500).json({error:true , prolem:err ,message:'server error'})
    }
})   





router.get(`/shop_picture/:id` , async function(req , res){
    try{
        const id = req.params.id;  // NOT THE SHOP ID , BUT THE IMAGE FILE ID FROM THE SHOP OBJECT
        const file = await shoppicsbucket.find({_id:new ObjectId(id)}).toArray();
        if(file?.length > 0){
            console.log('image found'  , file)
            res.set('Content-Type', file.metadata?.type || 'image/jpeg'  );
            
            const downloadstream = shoppicsbucket.openDownloadStream(new ObjectId(id));
            downloadstream.pipe(res);
            downloadstream.on('error' , function(err){
                console.log('error streaming shop picture' , err);
                return res.status(500).json({error:true , problem:err , message:'streaming error'});
            })
        }
        else{
            console.log(' no  picture found');
            return res.status(400).json({error:true , message:'user has no picture'});
        }

    }
    catch(err){
        console.log('error getting shop picture' , err);
        return res.status(500).json({error:true , prolem:err ,message:'server error'})
    }
})  





router.get(`/item_picture/:id` , async function(req , res){
    try{
        const id = req.params.id;  // NOT THE USER ITEM ID , BUT THE IMAGE FILE ID FROM THE ITEM OBJECT
        console.log('item pic id' , id);
        const file = await itempicsbucket.find({_id:new ObjectId(id)}).toArray();
        if(file?.length > 0){
            console.log('image found'  , file)
            res.set('Content-Type', file.metadata?.type || 'image/jpeg'  );
            
            const downloadstream = itempicsbucket.openDownloadStream(new ObjectId(id));
            downloadstream.pipe(res);
            downloadstream.on('error' , function(err){
                console.log('error streaming item picture' , err);
                return res.status(500).json({error:true , problem:err , message:'streaming error'});
            })
        }
        else{
            console.log('item picture not found');
            return res.status(400).json({error:true , message:'item has no picture'});
        }

    }
    catch(err){
        console.log('error getting item picture' , err);
        return res.status(500).json({error:true , prolem:err ,message:'server error'})
    }
})   





                  // REAL ROUTES


                  router.get('/', (req, res) => {
                    res.send('Hello World');
                  });



router.post(`/create_account` ,memuploader.single('image') ,  async function(req , res){
    try{
      const { email , password , username , number , role , country, county , area , expopushtoken} = req.body;
     const upload = req.file;
      const user = await User.findOne({email:email});
      if(user){
        console.log('email already in use');
        return res.status(400).json({error:true , message:'email already exists'});

      }
      const hash = await bcrypt.hash(password , 10);
      
      if(upload){
        const fileupload = new Promise(function(resolve , reject){
            const name = upload.originalname;
            // const path = upload.path;
            const size = upload.size;
            const type = upload.mimetype;

            const uploadstream = profilepicsbucket.openUploadStream(name , {
                metadata:{
                    name:name , size  , type:type
                }
            })

            const readstream = Readable.from(upload.buffer);
            readstream.pipe(uploadstream);

            uploadstream.on('finish' , function(){
                   resolve(uploadstream.id);
            })


            uploadstream.on('error' , function(err){
                  reject(err);
            })
        })

        const image = await fileupload;
        const OTP =  Math.floor(100000 + Math.random() * 900000);
        const newuser = new User({
           image , email , password:hash, username , number ,role , country , county , area , OTP:OTP , expopushtoken
        })

        await newuser.save();
        const token = await normaltokenmaker(newuser._id);
        return res.status(200).json({error:false , token ,  message:'user created successfully' , user:newuser})

      }
      else{
        const OTP =  Math.floor(100000 + Math.random() * 900000);
        const newuser = new User({
             email , password:hash, username , number ,role , country , county , area , OTP:OTP , expopushtoken
         })
 
         await  newuser.save();
         return res.status(200).json({error:false , message:'user created successfully' , user:newuser})
      }
    }
    catch(err){
        console.log('error creating account' , err);
        return res.status(500).json({error:true , message:'server error', problem:err})
    }
})




router.post(`/create_admin_account` , async function(req , res){
    try{
      const {password , username } = req.body; // admins will need only username and password
    //  const upload = req.file; // admind do not require to send profile image
      const user = await Admin.findOne({username:username}); // username will be the admin's unique registry number
      if(user){
        console.log('admin already exists');
        return res.status(400).json({error:true , message:'Admin already exists'});

      }
      const hash = await bcrypt.hash(password , 10);
      
      
      
        
        const newadmin= new Admin({
            password:hash, username
         })
 
         await  newadmin.save();
         const token = await tokenmaker(newadmin._id);
         res.cookie(process.env.ADMIN_WEB_COOKIE_NAME , token , {
            httpOnly: true,
            secure:true,
            sameSite: 'None',
            maxAge: 3600000*120  //5 days , just like the token
         })
         return res.status(200).json({error:false , message:'admin created successfully' , admin:newadmin})
    
    }
    catch(err){
        console.log('error creating admin account' , err);
        return res.status(500).json({error:true , message:'server error', problem:err});
    }
})



router.post(`/verify_otp` , async function(req , res){
    try{
      
       const {id , otp} = req.query;
       console.log('verifying otp' , req.query);
       const user = await User.findOne({_id:new ObjectId(id)});
       if(user){
           
        if(otp === user.OTP){
             console.log('OTP verification successful');
             user.OTP = null;
             await user.save();
             return res.status(200).json({error:false , message:'otp verified successfully' , user});

        }
        else{
            console.log('OTP mismatch error');
            return res.status(400).json({error:true  ,message:'you entered the wrong OTP'});
        }
       
       }
       else{
        console.log('no such user found');
        return res.status(400).json({error:true  ,message:'no such user found'});
       }
        }
    catch(err){
        console.log('error verifying otp' , err);
        return res.status(500).json({error:true , message:'server error' ,problem:err});
    }
})







router.post(`/log_in` , async function(req , res){
    try{
      const {email , password , expopushtoken} = req.body;
      const user = await User.findOne({email:email});
      if(user){
         console.log('user found');
         const match = await bcrypt.compare(password  ,user.password);
         if(match){
            user.expopushtoken = expopushtoken;
            await user.save();
            const token = await normaltokenmaker(user._id);
            console.log('expopushtoken updated');
            return res.status(200).json({error:false , message:'loged in successfully' , user , token});
         }
         else{
            console.log('invalid password');
            return res.status(400).json({error:true , message:'you inserted wrong credentials'});
         }
       
      }
      else{
        console.log('no such user found');
        return res.status(400).json({error:true , message:'no such user found'});
      }
    }
    catch(err){
        console.log('error logging in' , err);
        return res.status(500).json({error:true , message:'server error'  , problem:err})
    }
})





router.post(`/admin_token_validation` , async function(req , res){
    try{
       console.log('verifying admin token....');
       await verifytokenfunction(req , res);
       if (!res.headersSent) {
        return res.status(200).json({ error: false, message: 'token has been validated successfully' });
      }
    //    return res.status(200).json({error:false , message:'token has been validate successfully'});

    }
    catch(err){
        console.log('error validating admin token' , err);
        return res.status(500).json({error:true , message:'server error'  , problem:err})
    }
})




router.post(`/admin_log_in` , async function(req , res){
    try{
      const {username , password} = req.body;
      const user = await Admin.findOne({username:username});
      if(user){
         console.log('account found');
         const match = await bcrypt.compare(password  ,user.password);
         if(match){
           
            const token = await tokenmaker(user._id);
            res.cookie(process.env.ADMIN_WEB_COOKIE_NAME , token , {
                httpOnly: true,
                secure:true,
                sameSite: "None",

                maxAge: 3600000*120  // 5days just like token
            })
            return res.status(200).json({error:false , message:'loged in successfully' , user});
         }
         else{
            console.log('invalid password');
            return res.status(400).json({error:true , message:'you inserted wrong credentials'});
         }
       
      }
      else{
        console.log('no such user found');
        return res.status(400).json({error:true , message:'no such user found'});
      }
    }
    catch(err){
        console.log('error logging in' , err);
        return res.status(500).json({error:true , message:'server error'  , problem:err})
    }
})



router.post(`/admin_log_out` , async function(req , res){
    try{
      
      
        
        console.log('logging out...')
      const token = req.cookies[process.env.ADMIN_WEB_COOKIE_NAME];
      if(token){
        console.log('found token');

        res.cookie(process.env.ADMIN_WEB_COOKIE_NAME, '', {
          httpOnly: true,
          secure:true,
          sameSite: 'None',
          maxAge:0
         
        });
        console.log('successfully logged out');
        return res.status(200).json({error:false , message:'logged out successfully'});
        
      }
      else{
        console.log('could not find token');
        return res.status(400).json({error:true , message:'could not find token'});

      }
           
           
           
         
        
       
      
      
    }
    catch(err){
        console.log('error logging out' , err);
        return res.status(500).json({error:true , message:'server error'  , problem:err})
    }
})



// router.get(`/get_shops/:id` , async function(req , res){
//     try{
//          const id = req.params.id;
//          const shops = await Shop.find({owner: new ObjectId(id)}).populate('items').populate('owner');
       
//          if(!shops || shops.length == 0){
//             console.log('no shops found');
//             return res.status(200).json({error:false , message:'no shops found' ,shops:[]})
//          }
//          else{
//             return res.status(200).json({error:false , message:'shops found' ,shops:shops})
//          }
//     }
//     catch(err){
//         console.log('error getting shops' , err);
//         return res.status(500).json({error:true , message:'server error' , problem:err})
//     }
// })


router.get(`/get_shops/:id` , async function(req , res){
    try{
         const id = req.params.id;
         console.log('USER ID...' ,id);
         const user = await User.findOne({_id: new ObjectId(id)});
         if(!user){
            console.log('no such user found');
            return res.status(400).json({error:true , message:'no such user found'});
         }
         const shops = user.shops;
         if(user.shops.length == 0){
            console.log('user has no shops yet');
            return res.status(200).json({error:false , shops:[]});
         }
         else{
            const shoppromises = shops.map(function(val , ind){
                return Shop.findOne({_id:new ObjectId(val)}).populate('owner').populate('items').exec();
            })

            const shopobjects = await Promise.all(shoppromises);
            return res.status(200).json({error:false , shops:shopobjects});
         }
    }
    catch(err){
        console.log('error getting shops' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})




router.get(`/get_favourite_shops/:id` , async function(req , res){
  try{
       const id = req.params.id;
       console.log('USER ID...' ,id);
       const user = await User.findOne({_id: new ObjectId(id)});
       if(!user){
          console.log('no such user found');
          return res.status(400).json({error:true , message:'no such user found'});
       }
       const shops = user.favourite_shops;
       if(user.shops.length == 0){
          console.log('user has no shops yet');
          return res.status(200).json({error:false , shops:[]});
       }
       else{
          const shoppromises = shops.map(function(val , ind){
              return Shop.findOne({_id:new ObjectId(val)}).populate('owner').populate('items').exec();
          })

          const shopobjects = await Promise.all(shoppromises);
          return res.status(200).json({error:false , shops:shopobjects});
       }
  }
  catch(err){
      console.log('error getting shops' , err);
      return res.status(500).json({error:true , message:'server error' , problem:err})
  }
})


router.get('/banks', async (req, res) => {
    try {
      const response = await fetch('https://api.intasend.com/v1/banks', {
       
        headers: {
          'Authorization': 'Bearer ' + process.env.INSTASEND_SECRET,
          'Content-Type': 'application/json'
        }
      });
  
      console.log(response);
      const data = await response.json();

     if(!response.ok){
        console.log('response from banks API is not ok' , data);
        return res.status(500).json({error:true , message:'server error' , problem:data})
     }
      res.status(200).json({
        success: true,
        banks: data  // depending on their response format
      });
  
    } catch (err) {
      console.log('Error fetching banks', err);
      res.status(500).json({error:true , problem:err , success: false, message: 'Server error' });
    }
  });
  


router.post(`/create_shop` , memuploader.single('image') ,  async function(req , res){
    try{
        const  {disbursebankaccountname , bankaccountname ,  bank , disbursebank , name , type , customtype ,  description , county , country , area , owner , payment_method , disbursement_method , payment_account , disbursement_account } = req.body;
        const upload = req.file;
      const user = await User.findOne({_id: new ObjectId(owner)});
        if(!user){
            console.log('user not found');
            return res.status(400).json({error:true , mesage:'user not found'});
        }
         if(upload){
            console.log('CREATING SHOP...' , req.body);
           const fileupload = new Promise(function(resolve , reject){
               const name = upload.originalname;
            //    const path = upload.path;
               const size = upload.size;
               const type = upload.mimetype;
   
               const uploadstream = shoppicsbucket.openUploadStream(name , {
                   metadata:{
                       name:name , size  , type:type
                   }
               })
   
               const readstream = Readable.from(upload.buffer);
               readstream.pipe(uploadstream);
   
               uploadstream.on('finish' , function(){
                      resolve(uploadstream.id);
               })
   
   
               uploadstream.on('error' , function(err){
                     reject(err);
               })
           })
   
           const image = await fileupload;
           console.log('IMAGE UPLOADED');
           const newshop = new Shop({
           bank:bank , disburse_bank:disbursebank ,   owner , image , name ,type , customtype , description , country:JSON.parse(country) , county:JSON.parse(county) , area:JSON.parse(area)  ,  bank_account_name:bankaccountname , disburse_account_name:disbursebankaccountname ,
             payment_method: {
                method: payment_method,              // <-- correct
                payment_account_number: payment_account
              },
              disbursement_method: {
                method: disbursement_method,
                payment_account_number: disbursement_account
              }
           })
   
           await newshop.save();

         const newshops = user.shops.push(newshop._id);
         await user.save();
           console.log('SHOP CREATED SUCCESSFULLY');
           return res.status(200).json({error:false , message:'shop created successfully' , shop:newshop})
   
         }
         else{
        //    const newuser = new User({
        //        image , email , hash, username , number ,role , country , county , area
        //     })
    
        //     newuser.save();
        //     return res.status(200).json({error:false , message:'user created successfully' , user:newuser})
        console.log('request did not have an image attached to it');
        return res.status(400).json({error:true , message:'attach image to the request'})
         }
    }
    catch(err){
        console.log('error creating shop' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});

    }
})


router.patch(`/edit_shop` , memuploader.single('image') ,  async function(req , res){
     const session = await mongoose.startSession();
    try{
        session.startTransaction();
        const  {shopid , disbursebankaccountname , bankaccountname ,  bank , disbursebank , name , type , customtype ,  description , county , country , area , owner , payment_method , disbursement_method , payment_account , disbursement_account } = req.body;
        const upload = req.file;

      const user = await User.findOne({_id: new ObjectId(owner)});
        if(!user){
            console.log('user not found');
            return res.status(400).json({error:true , mesage:'user not found'});
        }

        const shop = await Shop.findOne({_id: new ObjectId(shopid)});
        if(!shop){
            console.log('shop not found');
            return res.status(400).json({error:true , mesage:'shop not found'});
        }
         if(upload){
            console.log('editting SHOP...' , req.body);
           const fileupload = new Promise(function(resolve , reject){
               const name = upload.originalname;
            //    const path = upload.path;
               const size = upload.size;
               const type = upload.mimetype;
   
               const uploadstream = shoppicsbucket.openUploadStream(name , {
                   metadata:{
                       name:name , size  , type:type
                   }
               })
   
               const readstream = Readable.from(upload.buffer);
               readstream.pipe(uploadstream);
   
               uploadstream.on('finish' , function(){
                      resolve(uploadstream.id);
               })
   
   
               uploadstream.on('error' , function(err){
                     reject(err);
               })
           })
   
           const image = await fileupload;
           console.log('IMAGE UPLOADED');
        //    const newshop = new Shop({
        //    bank:bank , disburse_bank:disbursebank ,   owner , image , name ,type , customtype , description , country:JSON.parse(country) , county:JSON.parse(county) , area:JSON.parse(area)  ,  bank_account_name:bankaccountname , disburse_account_name:disbursebankaccountname ,
        //      payment_method: {
        //         method: payment_method,              // <-- correct
        //         payment_account_number: payment_account
        //       },
        //       disbursement_method: {
        //         method: disbursement_method,
        //         payment_account_number: disbursement_account
        //       }
        //    })

           const newshop = await Shop.findOneAndUpdate(
            {_id:shop._id},
            {
             $set:{bank:bank , disburse_bank:disbursebank ,   image , name ,type , customtype , description , country:JSON.parse(country) , county:JSON.parse(county) , area:JSON.parse(area)  ,  bank_account_name:bankaccountname , disburse_account_name:disbursebankaccountname ,
                payment_method: {
                    method: payment_method,              // <-- correct
                    payment_account_number: payment_account
                  },
                  disbursement_method: {
                    method: disbursement_method,
                    payment_account_number: disbursement_account
                  }
            }
            },  
            {new:true , session}
           )
   
        //    await newshop.save();
          
        //  const newshops = user.shops.push(newshop._id);
        //  await user.save();
           console.log('SHOP EDITTED SUCCESSFULLY');
           await session.commitTransaction();
           session.endSession();
           return res.status(200).json({error:false , message:'shop editted successfully' , shop:newshop})
   
         }
         else{
       
        console.log('request did not have an image attached to it');
        const newshop = await Shop.findOneAndUpdate(
            {_id:shop._id},
            {
             $set:{bank:bank , disburse_bank:disbursebank ,     name ,type , customtype , description , country:JSON.parse(country) , county:JSON.parse(county) , area:JSON.parse(area)  ,  bank_account_name:bankaccountname , disburse_account_name:disbursebankaccountname ,
                payment_method: {
                    method: payment_method,              // <-- correct
                    payment_account_number: payment_account
                  },
                  disbursement_method: {
                    method: disbursement_method,
                    payment_account_number: disbursement_account
                  }
            }
            },  
            {new:true , session}
           )

        console.log('SHOP EDITTED SUCCESSFULLY');
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({error:false , message:'shop editted successfully' , shop:newshop})

         }
    }
    catch(err){
        session.abortTransaction();
        session.endSession();
        console.log('error editting shop' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});

    }
})























router.post(`/create_item` , memuploader.single('image') ,  async function(req , res){
    try{
        const {shop , name , type , description , quantity , unit , price , priceunit } = req.body;
        const upload = req.file;
        
         if(upload){
            console.log('CREATING ITEM.....')
            const usershop = await Shop.findOne({_id: new ObjectId(shop)}).populate('items').populate('owner');
            if(!usershop){
                console.log('shop not found');
                return res.status(400).json({error:true , message:'shop not found'});
            }
           const fileupload = new Promise(function(resolve , reject){
               const name = upload.originalname;
            //    const path = upload.path;
               const size = upload.size;
               const type = upload.mimetype;
   
               const uploadstream = itempicsbucket.openUploadStream(name , {
                   metadata:{
                       name:name , size  , type:type
                   }
               })
   
               const readstream = Readable.from(upload.buffer);
               readstream.pipe(uploadstream);
   
               uploadstream.on('finish' , function(){
                      resolve(uploadstream.id);
               })
   
   
               uploadstream.on('error' , function(err){
                     reject(err);
               })
           })
   
           const image = await fileupload;
           
           const newitem = new Item({
            shop ,  image , name ,type , description , quantity , unit , price , price_unit:priceunit ,  quantity_remaining:quantity
           })
           await newitem.save();
           usershop.items.push(newitem._id);
           await usershop.save();
           await usershop.populate('items');
           await usershop.populate('owner');
           console.log(usershop);
           return res.status(200).json({error:false , message:'item created successfully' , item:newitem , shop:usershop})
   
         }
         else{
        //    const newuser = new User({
        //        image , email , hash, username , number ,role , country , county , area
        //     })
    
        //     newuser.save();
        //     return res.status(200).json({error:false , message:'user created successfully' , user:newuser})
        console.log('item did not have an image attached to it');
        return res.status(400).json({error:true , message:'attach image to the item'})
         }
    }
    catch(err){
        console.log('error creating item' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})





router.patch(`/edit_item` , memuploader.single('image') ,  async function(req , res){
     const session = await mongoose.startSession();
    try{
        session.startTransaction()
        const {name , type , description , quantity , unit , price , priceunit , id  , shop} = req.body;
        const upload = req.file;
       
         
        const item = await Item.findOne({_id:new ObjectId(id)});
        if(item){
             
            if(upload){
                const fileupload = new Promise(function(resolve , reject){
                    const name = upload.originalname;
                    // const path = upload.path;
                    const size = upload.size;
                    const type = upload.mimetype;
        
                    const uploadstream = itempicsbucket.openUploadStream(name , {
                        metadata:{
                            name:name , size  , type:type
                        }
                    })
        
                    // const readstream = fs.createReadStream(path);
                    const readstream = Readable.from(upload.buffer);
                    readstream.pipe(uploadstream);
        
                    uploadstream.on('finish' , function(){
                           resolve(uploadstream.id);
                    })
        
        
                    uploadstream.on('error' , function(err){
                          reject(err);
                    })
                })
        
                const image = await fileupload;
                const newitem = await Item.findOneAndUpdate(
                    {_id:item._id},
                    {
                        $set:{image:image , name ,type , description , quantity , unit , price , price_unit:priceunit , quantity_remaining:quantity},
                       
                    },
                    {new:true , session}
                );

                await session.commitTransaction();
                session.endSession();

                const shopobj = await Shop.findOne({_id:new ObjectId(shop)});
                if(!shopobj){
                    console.log('no such shop found');
                    return res.status(400).json({error:true , message:'no such shop found'});
                }
                // item.image = image;
                // item.name = name;
                // item.type = type;
                // item.description = description;
                // item.quantity = quantity;
                // item.unit = unit;
                // item.price = price;
                // item.price_unit = priceunit;
                // item.quantity_remaining=quantity;

               
        
                // await item.save();
               

              
                // await shopobj.save();
                await shopobj.populate('items');
                await shopobj.populate('owner');
                return res.status(200).json({error:false , message:'item edited successfully' , item:newitem , shop:shopobj})
        
              }

              else{
                console.log('no image was attached');
   
                const newitem = await Item.findOneAndUpdate(
                    {_id:item._id},
                    {
                       
                        $set:{name ,type , description , quantity , unit , price , price_unit:priceunit , quantity_remaining:quantity},

                    },
                    {new:true , session}
                );



                await session.commitTransaction();
                session.endSession();
                const shopobj = await Shop.findOne({_id:new ObjectId(shop)});
                if(!shopobj){
                    console.log('no such shop found');
                    return res.status(400).json({error:true , message:'no such shop found'});
                }
               
               

              
              
                // item.name = name;
                // item.type = type;
                // item.description = description;
                // item.quantity = quantity;
                // item.quantity_remaining=quantity;
                // item.unit = unit;
                // item.price = price;
                // item.price_unit = priceunit;
               
        
                // await item.save();
                

             
                // await shopobj.save();
                await shopobj.populate('items');
                await shopobj.populate('owner');

               
                return res.status(200).json({error:false , message:'item edited successfully' , item:newitem , shop:shopobj});
               
                 }


        }
  
         else{
       
        console.log('item not found');
        return res.status(400).json({error:true , message:'item not found'})
         }
    }
    catch(err){
        session.abortTransaction();
        session.endSession();
        console.log('error editting item' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
   
})





router.delete(`/delete_item` , async function(req , res){
    const session = await mongoose.startSession();
    try{
        session.startTransaction()
    const {shop , item} = req.query;
    const  sellingshop = await Shop.findOne({_id:new ObjectId(shop)});
    if(sellingshop){
         const comodity = await Item.findOne({_id:new ObjectId(item)});
         if(comodity){
            // const newitemslist = sellingshop.items.filter(function(val , ind){
            //     return val !== new ObjectId(item);
            // })
            // sellingshop.items = newitemslist;
           
            const newshop = await Shop.findOneAndUpdate(
                {_id:sellingshop._id},
                {
                    $pull:{items:comodity._id}
                },
                {new:true , session}
            )

            await Item.findOneAndDelete(
                { _id: comodity._id },
                { session }  
              );
              

            // sellingshop.items = sellingshop.items.filter(function(val){
            //   return  val && val.toString() !== item;
            // });
          
            await session.commitTransaction();
            session.endSession();
            // await sellingshop.save();
            await newshop.populate('items');
            await newshop.populate('owner');

            // await Item.deleteOne({_id:new ObjectId(item)});
            return res.status(200).json({error:false , shop:newshop});
         }
         else{

            console.log('no such item found');
            return res.status(400).json({error:true , message:'item not found'});
         }
    }
    else{
        console.log('no such shop found');
        return res.status(400).json({error:true , message:'shop not found'});
    }
    }
    catch(err){
        await session.abortTransaction();
        session.endSession();
        console.log('error deleting item' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});

    }
})






router.post(`/add_to_cart` , async function(req , res){
    try{
        
         const {user , itemid} = req.query;
         const account = await User.findOne({_id:new ObjectId(user)});
         if(account){
              console.log('user found');
              const item = await Item.findOne({_id:new ObjectId(itemid)});
              if(item){
                   console.log('item found');
                   
                   const alreadyincart = account.cart.some(function(val){
                    return val.item.toString() == itemid;
                   })

                   const alreadyinsaved = account.saved_items.some(function(val){
                    return val.item.toString() == itemid;
                   })

                   if(alreadyincart){
                    console.log('item is already in cart');
                    return res.status(400).json({error:true , message:'item is already in cart'})
                   }

                   if(alreadyinsaved){
                    console.log('item is already in saved items');
                    return res.status(400).json({error:true , message:'item is already in saved items'})
                   }
                   account.cart.push({
                     item:item._id , quantity:1
                   });
                   await account.save();
                   console.log('item added to cart');
                   
                   return res.status(200).json({error:false , user:account});
                   
     
              }
              else{
                 console.log('no such item found');
                 return res.status(400).json({error:true , message:'no such item found'})
              }

         }
         else{
            console.log('no such user found');
            return res.status(400).json({error:true , message:'no such user found'})
         }
       
    }
    catch(err){
        console.log('error adding item to cart' , err);
        return res.status(500).json({error:false , message:'server error' , problem:err})
    }
})



router.post(`/save_for_later/:id` , async function(req , res){
    try{
        
         const {user , itemid} = req.query;
         const account = await User.findOne({_id:new ObjectId(user)});
         if(account){
              console.log('user found');
              const item = await Item.findOne({_id:new ObjectId(itemid)});
              if(item){
                   console.log('item found');
                //    const newcart = account.cart.filter(function(val){
                //      return val.item.toString() !== item._id;
                //    })
                //    account.cart = newcart;
                   account.saved_items.push({
                    item:item._id , quantity:1
                   });
                   await account.save();
                   console.log('item added to saved items');
                   
                   return res.status(200).json({error:false , user:account});
                   
     
              }
              else{
                 console.log('no such item found');
                 return res.status(400).json({error:true , message:'no such item found'})
              }

         }
         else{
            console.log('no such user found');
            return res.status(400).json({error:true , message:'no such user found'})
         }
       
    }
    catch(err){
        console.log('error adding item to saved items' , err);
        return res.status(500).json({error:false , message:'server error' , problem:err})
    }
})


router.get(`/get_cart_items/:id` , async function(req , res){
    try{
        const id = req.params.id;
        const user = await User.findOne({_id:new ObjectId(id)}).populate({
            path:'cart.item',
            populate:{
                path:'shop',
                populate:[
                    {path:'owner'},
                    {path:'items'}
                ]
            }
        });
        if(user){
           console.log('user found for successful cart fetching');
           
           return res.status(200).json({error:false , items:user.cart});
        }
        else{
            console.log('no such user found when fetching cart objects');
            return res.status(400).json({error:true , message:'no such user found'});
        }
    }
    catch(err){
        console.log('error fetching cart items' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err })
    }
})







router.get(`/get_saved_items/:id` , async function(req , res){
    try{
        const id = req.params.id;
        const user = await User.findOne({_id:new ObjectId(id)}).populate({
            path:'saved_items.item',
            populate:{
                path:'shop',
                populate:[
                    { path:'owner'},
                    { path:'items'}
                ]
            }
        });
        if(user){
           console.log('user found for successful saved items fetching');
           return res.status(200).json({error:false , items:user.saved_items});
        }
        else{
            console.log('no such user found when fetching saved objects');
            return res.status(400).json({error:true , message:'no such user found'});
        }
    }
    catch(err){
        console.log('error fetching saved items' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err })
    }
})



router.patch(`/remove_from_cart` , async function(req , res){
    try{
        const {user , item} = req.query;
       const account = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
                const newcart = account.cart.filter(function(val ,ind){
                    return val.item.toString() !== thing._id.toString();
                })
                account.cart = newcart;
                await account.save();
                 
                const newacc = await account.populate({
                    path:'cart.item',
                    populate:{
                        path:'shop',
                        populate:[
                            {path:'items'},
                            {path:'owner'}
                        ]
                    }
                })

                return res.status(200).json({error:false , cart:newacc.cart});
          }
          else{
            console.log('no such item found');
            return res.status(400).json({message:'no such item found' , error:true});
          }
       }
       else{
        console.log('no such user found');
        return res.status(400).json({error:true ,message:'no such user found'});
       }
    }
    catch(err){
        console.log('error removing item from cart' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})






router.patch(`/remove_from_saved` , async function(req , res){
    try{
        const {user , item} = req.query;
       const account = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
                const newsaved = account.saved_items.filter(function(val ,ind){
                    return val.item.toString() !== thing._id.toString();
                })
                account.saved_items = newsaved;
                await account.save();

                const newacc = await account.populate({
                    path:'saved_items.item',
                    populate:{
                        path:'shop',
                        populate:[
                            {path:'owner'},
                            {path:'items'}
                        ]
                    }
                })


                return res.status(200).json({error:false , saved:newacc.saved_items});
          }
          else{
            console.log('no such item found');
            return res.status(400).json({message:'no such item found' , error:true});
          }
       }
       else{
        console.log('no such user found');
        return res.status(400).json({error:true ,message:'no such user found'});
       }
    }
    catch(err){
        console.log('error removing item from saved items' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})





router.patch(`/move_to_saved` , async function(req , res){
    try{
        const {user , item} = req.query;
       const account = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
            const cartitem = account.cart.find(function(val){
                return val.item.toString() == thing._id
            })

            // if(!cartitem){
            //     console.log('item not found in cart');
            //     return res.status(400).json({error:true , message:'item not found in cart'})
            // }

            const index = account.cart.findIndex(c => c.item.toString() === thing._id.toString());
            if(index === -1) return res.status(400).json({error:true, message:'Item not found in cart'});
        
            const [cartItem] = account.cart.splice(index, 1);
        
            // Add to saved_items
            account.saved_items.push(cartItem);
        
            //   })
            //     const newcart = account.cart.filter(function(val ,ind){
            //         return val.item.toString() !== thing._id;
            //     })
            //     account.cart = newcart;

                
            //  account.saved_items.push(cartitem);
                


               

                await account.save();

                const saved = await account.populate([
                    {
                    path:'cart.item',
                    populate:{
                       path:'shop' ,
                       populate:[
                        {path:'items'},
                        {path:'owner'}
                       ]
                    }
                },
                {
                    path:'saved_items.item',
                    populate:{
                       path:'shop' ,
                       populate:[
                        {path:'items'},
                        {path:'owner'}
                       ]
                    }
                }
                ]);


                return res.status(200).json({error:false , cart:saved.cart , saveditems:saved.saved_items});
          }
          else{
            console.log('no such item found');
            return res.status(400).json({message:'no such item found' , error:true});
          }
       }
       else{
        console.log('no such user found');
        return res.status(400).json({error:true ,message:'no such user found'});
       }
    }
    catch(err){
        console.log('error moving item to saved' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})








router.patch(`/move_to_cart` , async function(req , res){
    try{
        const {user , item} = req.query;
       const account = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
            //   const saveditem = account.saved_items.find(function(val){
            //     return val.item.toString() == thing._id; 
            //   })

            //   if(!saveditem){
            //     console.log('item not found in saved items');
            //     return res.status(400).json({error:true , message:'item not found in saved items'})
            //   }

            //     const newsaved = account.saved_items.filter(function(val ,ind){
            //         return val.item.toString() !== thing._id;
            //     })
            //     account.saved_items = newsaved;

                
            //     account.cart.push(saveditem);
            
            const index = account.saved_items.findIndex(c => c.item.toString() === thing._id.toString());
            if(index === -1) return res.status(400).json({error:true, message:'Item not found in saved items'});
        
            const [saveditem] = account.saved_items.splice(index, 1);
        
            // Add to saved_items
            account.cart.push(saveditem);
        
               


               

                await account.save();

                    const saved = await account.populate([
                    {
                    path:'cart.item',
                    populate:{
                       path:'shop' ,
                       populate:[
                        {path:'items'},
                        {path:'owner'}
                       ]
                    }
                },
                {
                    path:'saved_items.item',
                    populate:{
                       path:'shop' ,
                       populate:[
                        {path:'items'},
                        {path:'owner'}
                       ]
                    }
                }
                ]);


                return res.status(200).json({error:false , saved:saved.saved_items , cart:saved.cart});
          }
          else{
            console.log('no such item found');
            return res.status(400).json({message:'no such item found' , error:true});
          }
       }
       else{
        console.log('no such user found');
        return res.status(400).json({error:true ,message:'no such user found'});
       }
    }
    catch(err){
        console.log('error moving item to cart' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})



router.post(`/increment_cart_item` , async function(req , res){
    try{
     const {user , item} = req.body;
     const account = await User.findOne({_id:new ObjectId(user)});
     if(!account){
        console.log('account not found')
        return res.status(400).json({error:true , message:'account not found'});
     }
     else{
        const product = await Item.findOne({_id: new ObjectId(item)});
        if(!product){
            console.log('product not found')
        return res.status(400).json({error:true , message:'product not found'});
        }

        const incart = account.cart.find(function(val){
            return val.item.toString() == product._id;
        })

        if(!incart){
            console.log('product not in cart')
            return res.status(400).json({error:true , message:'product not in cart'});
        }

        if(incart.quantity + 1 > product.quantity_remaining){
            console.log('you cannot exceed existing stock');
            return res.status(400).json({error:true , message:'you cannot exceed existing stock'});

        }
      
        incart.quantity += 1;

        await account.save();
        await account.populate({
            path:'cart.item',
            populate:{
                path:'shop',
                populate:[
                    {path:'owner'},
                    {path:'items'}
                ]
            }
        });


        return res.status(200).json({error:false , message:'incremented successfully' , cart:account.cart});

     }
     
    }
    catch(err){
        console.log('could not increment cart item quantity');
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})




router.post(`/decrement_cart_item` , async function(req , res){
    try{
     const {user , item} = req.body;
     const account = await User.findOne({_id:new ObjectId(user)});
     if(!account){
        console.log('account not found')
        return res.status(400).json({error:true , message:'account not found'});
     }
     else{
        const product = await Item.findOne({_id: new ObjectId(item)});
        if(!product){
            console.log('product not found')
        return res.status(400).json({error:true , message:'product not found'});
        }

        const incart = account.cart.find(function(val){
            return val.item.toString() == product._id;
        })

        if(!incart){
            console.log('product not in cart')
            return res.status(400).json({error:true , message:'product not in cart'});
        }
        if((incart.quantity - 1) < 0){
            console.log('cannot decreent below 0')
            return res.status(400).json({error:true , message:'cannot decrement below 0'});
        }
        incart.quantity -= 1;

        await account.save();

        await account.populate({
            path:'cart.item',
            populate:{
                path:'shop',
                populate:[
                    {path:'owner'},
                    {path:'items'}
                ]
            }
        });


        return res.status(200).json({error:false , message:'decremented successfully' , cart:account.cart});

     }
     
    }
    catch(err){
        console.log('could not decrement cart item quantity');
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})





router.get(`/get_initial_results` , async function(req , res){
     try{
        console.log('getting initial reesults');
         const results = await Item.aggregate([
           { $sample : {size:20}}
         ])



         if(results.length === 0){
            console.log('no initial results found');
            return res.status(400).json({error:true , message:'no results found'});
         }

         else{
            console.log('results fetched');
           
            // const populatedItems = await Item.populate(results, { path: 'shop' });
            const populatedItems = await Item.populate(results, {
                path: "shop",
                model: "shop",
                populate: [
                  {
                    path: "owner",
                    model: "user"
                  },
                  {
                    path: "items",
                    model: "item"
                  }
                ]
              });
              
              
            return res.status(200).json({error:false , message:'results fetched successfully', items:populatedItems})
         }
     }
     catch(err){
        console.log('could not get results to display' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
     }
})



router.get(`/get_initial_shop_results` , async function(req , res){
  try{
     console.log('getting initial shop reesults');
      const results = await Shop.aggregate([
        { $sample : {size:20}}
      ])



      if(results.length === 0){
         console.log('no initial shop results found');
         return res.status(400).json({error:true , message:'no shop results found'});
      }

      else{
         console.log('shop results fetched');
        
         // const populatedItems = await Item.populate(results, { path: 'shop' });
         const populatedshops = await Shop.populate(results, [
          { path: "items", model: "item" },
          { path: "owner", model: "user" }
      ]);
           
           
         return res.status(200).json({error:false , message:'results fetched successfully', shops:populatedshops})
      }
  }
  catch(err){
     console.log('could not get results to display' , err);
     return res.status(500).json({error:true , message:'server error' , problem:err});
  }
})





router.get(`/get_suggestions/:query` , async function(req , res){
    try{
       const query = req.params.query;

       const recomendations = await Item.find({
        $or: [
            { name: { $regex: query, $options: "i" } },  // match by name
            // { description: { $regex: query, $options: "i" } }, // match by desc
            // { type: { $regex: query, $options: "i" } },  // match by type
          ]
       }).select('name').limit(10);

       if(!recomendations || recomendations.length == 0){
            console.log('no recomendations found');
            return res.status(200).json({error:false , message:'no recomendations found' , recomendations:[]});
       }
       else{
        console.log('some recomendations were  found');
        return res.status(200).json({error:false , message:'recomendations found' , recomendations:recomendations}); 
       }
    }
    catch(err){
        console.log('error geting recomendations' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})




router.get(`/get_shop_suggestions/:query` , async function(req , res){
  try{
     const query = req.params.query;

     const recomendations = await Shop.find({
      $or: [
          { name: { $regex: query, $options: "i" } },  // match by name
          // { description: { $regex: query, $options: "i" } }, // match by desc
          // { type: { $regex: query, $options: "i" } },  // match by type
        ]
     }).select('name').limit(10);

     if(!recomendations || recomendations.length == 0){
          console.log('no  shop recomendations found');
          return res.status(200).json({error:false , message:'no recomendations found' , recomendations:[]});
     }
     else{
      console.log('some shop  recomendations were  found');
      return res.status(200).json({error:false , message:'recomendations found' , recomendations:recomendations}); 
     }
  }
  catch(err){
      console.log('error geting shop recomendations' , err);
      return res.status(500).json({error:true , message:'server error' , problem:err});
  }
})





router.get(`/search/:query/:page` , async function(req , res){
    try{
       const {query , page} = req.params;
       const limit = 30;

       const results = await Item.find({
        $or: [
            { name: { $regex: query, $options: "i" } },  // match by name
            { description: { $regex: query, $options: "i" } }, // match by desc
            { type: { $regex: query, $options: "i" } },  // match by type
          ]
       }).populate({
        path: 'shop',  // populate the shop property
        populate: [
          { path: 'owner', model: 'user' },   // populate shop.owner
          { path: 'items', model: 'item' }    // populate shop.items
        ]
      }).limit(limit).skip(page * limit).sort({createdAt:-1});

       if(!results || results.length == 0){
            console.log('no results found');
            return res.status(200).json({error:false , message:'no results found' , results:[]});
       }
       else{
        console.log('some results were  found');
        return res.status(200).json({error:false , message:'results found' , results:results}); 
       }
    }
    catch(err){
        console.log('error geting results' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})



router.get(`/search_shop/:query/:page` , async function(req , res){
  try{
     const {query , page} = req.params;
     const limit = 30;

     const results = await Shop.find({
      $or: [
          { name: { $regex: query, $options: "i" } },  // match by name
          { description: { $regex: query, $options: "i" } }, // match by desc
          { type: { $regex: query, $options: "i" } },  // match by type
        ]
     }).populate([
      { path: 'owner', model: 'user' },   // populate shop.owner
      { path: 'items', model: 'item' }    // populate shop.items
    
     ]
       
    ).limit(limit).skip(page * limit).sort({createdAt:-1});

     if(!results || results.length == 0){
          console.log('no  shop results found');
          return res.status(200).json({error:false , message:'no shop  results found' , results:[]});
     }
     else{
      console.log('some shop results were  found');
      return res.status(200).json({error:false , message:'shops found' , results:results}); 
     }
  }
  catch(err){
      console.log('error geting results' , err);
      return res.status(500).json({error:true , message:'server error' , problem:err});
  }
})





router.get(`/like_shop/:id/:client` , async function(req , res){
  const session = await mongoose.startSession();
  try{
    session.startTransaction();
     const {id , client} = req.params;
     
     const shop = await Shop.findOne({_id:new ObjectId(id)}).populate('owner');
     if(!shop){
      console.log('shop not found');
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({error:true , message:'shop not found'});
     }
     const visitor = await User.findOne({_id:new ObjectId(client)});
     if(!visitor){
      console.log('user not found');
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({error:true , message:'user not found'});
           }
      const shopindex = visitor.favourite_shops.findIndex(function(val){
        return val.toString() === shop._id.toString();
      })

      let updatedshop
      let updateduser

      if(shopindex === -1){
              //ADD TO LIKED
              updateduser =    await User.findOneAndUpdate(
                {_id:visitor._id},
                {
                    $addToSet:{favourite_shops:shop._id}
                },
                {new:true , session}
              )
      
         // ADD TO SHOP'S  LIKES
          updatedshop =  await Shop.findOneAndUpdate(
                {_id:shop._id},
                {
                    $addToSet:{customers:visitor._id}
                },
                {new:true , session}
              )


      
      }else{
 

         // REMOVE FROM LIKED
         updateduser =  await User.findOneAndUpdate(
          {_id:visitor._id},
          {
             
              $pull:{favourite_shops:shop._id}
          },
          {new:true , session}
        )

        // remove from shop's likes
       updatedshop = await Shop.findOneAndUpdate(
          {_id:shop._id},
          {
             
              $pull:{customers:visitor._id}
          },
          {new:true , session}
        )


      
      }
      
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({error:false , message:'shop liked/unliked successfully' ,shop:updatedshop , user:updateduser})


  }

  catch(err){
    await session.abortTransaction();
    session.endSession();
      console.log('error liking shop' , err);
      return res.status(500).json({error:true , message:'server error' , problem:err});
  }
})









router.post(`/call_checkout_page` , async function(req , res){
    let createdorderid;
    let transactionid;
   
    try{
   
        console.log('calling pay page' , req.body);
      const {item , user , quantity} = req.body;
      const account = await User.findOne({_id: new ObjectId(user)});
      const product = await Item.findOne({_id: new ObjectId(item)});
      
      if(!account){
        console.log('no such user found');
        return res.status(400).json({error:true , message:'user not found'});
      }

      if(!product){
        console.log('no such item found');
        return res.status(400).json({error:true , message:'item not found'});
      }
    
      if(quantity > product.quantity_remaining){
        console.log('the quantity exceeds existing stock');
        return res.status(400).json({error:true , message:'the quantity exceeds existing stock'});

      }

     const amount = product.price * Number(quantity);

     const transaction = new Transaction({
        total:amount 
     })

     await transaction.save();
     transactionid = transaction._id;

     const order = new Order({
        buyer:account._id , item:product._id , total:amount , transaction:transaction._id , status:'NEW' , quantity:Number(quantity)
     })

     await order.save();
     createdorderid = order._id;


    const paymentmetadata =  {
         transaction_id:transaction._id,
         user:account._id,
         item:product._id,
         quantity:quantity
      }

   const payload = {
    "public_key":process.env.INSTASEND_PUBLIC_API_KEY.trim(),
    "amount": amount,
    "currency": "KES",
    "api_ref": order._id.toString(),
    "metadata":paymentmetadata,
    "redirect_url": "https://cashcrop.onrender.com/payment_success_page",
    "fail_redirect_url": "https://cashcrop.onrender.com/payment_failed_page",
    "callback_url": `https://cashcrop.onrender.com/collection_callback`
  }



  const response = await fetch('https://payment.intasend.com/api/v1/checkout/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });


  console.log('response' , response);
  const data = await response.json();
  console.log("INTASEND JSON BODY:", data);
   if(response.ok){
    console.log('successfully called pay page')

    if (data.url) {
        // Return checkout URL to frontend
        return res.status(200).json({error:false ,  url: data.url });
      } else {
        res.status(500).json({ error:true , message:"Could not generate checkout URL", problem: data });
      }
   }
   else{
    console.log('error occured while requesting for pay page');
    res.status(500).json({ error:true , message:"error occured in ISNTASEND servers , when requesting for pay page", problem: data });

   }
  
  



    }
    catch(err){
      
        if (createdorderid) {
            await Order.findByIdAndDelete(createdorderid);
        }
    
        if (transactionid) {
            await Transaction.findByIdAndDelete(transactionid);
        }
        console.log('error calling check out page' , err);
        return res.status(500).json({error:true  , message:'server error' , problem:err})
    }
})


router.get(`/payment_success_page` , async function(req , res){
    try{
       res.send('PAYMENT WAS SUCCESSFUL')
    }
    catch(err){
        console.log('error happened in error success page route' , err);
        return res.status(500).json({error:true , problem:err ,  message:'server error'})
    }
})

router.get(`/payment_failed_page` , async function(req , res){
    try{
       res.send('PAYMENT WAS NOT SUCCESSFUL')
    }
    catch(err){
        console.log('error happened in error failed page route' , err);
        return res.status(500).json({error:true , problem:err ,  message:'server error'})
    }
})



router.post(`/collection_callback` , async function(req , res){
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
         console.log('running collection callback' , req.body);
         const info = req.body;

       

         if(info.state === 'COMPLETE'){

            const order = await Order.findOne({_id: new ObjectId(info.api_ref)}).populate([
                {path:'item' , populate:[{path:'shop' , populate:[{path:'items'} , {path:'owner'}]}]},
                {path:'buyer'},
                {path:'transaction'}
                
             ]);
             if(!order){
                await session.abortTransaction();
                session.endSession();
                console.log('order not found');
                return res.status(200).json({ received: true });

            
             }
             console.log('order' , order);
             const buyerobj = await User.findOne({_id:new ObjectId(order.buyer._id)});
             const sellerobj = await User.findOne({_id: new ObjectId(order.item.shop.owner._id)});
             const shopobj = await Shop.findOne({_id:new ObjectId(order.item.shop._id)});
             const transactionobj = await Transaction.findOne({_id:new ObjectId(order.transaction._id)});
             console.log('buyer' , buyerobj , 'seller' , sellerobj , 'shop' , shopobj , 'transaction' , transactionobj  );
           
             const cart = buyerobj.cart;  // BUYER'S CART
             const items = shopobj.items; // SHOP'S ITEMS

             // LOOK FOR THE ITEM IN THE SHOP
             const item = items.find(function(val){
               return  val.toString() == order.item._id.toString();
             })
             if(!item){
                await session.abortTransaction();
                session.endSession();
                console.log('item was not found in the seller items list');
                return res.status(200).json({ received: true });

             }

             // LOOK FOR THE ITEM IN TE BUYER'S CART
    
            const cartindex = cart.findIndex(function(val){
                return val.item.toString() == order.item._id.toString();
            })

            if(cartindex == -1){
                await session.abortTransaction();
                session.endSession();
                console.log('item was not found in the cart of the buyer');
                return res.status(200).json({ received: true });

            }

            // cart.splice(cartindex, 1);   //REMOVE THE ITEM FROM BUYER'S CART

            // PAYMENT METHODS AND INFO
             const paymentmethod = info.payment_method; // CARD , M-PESA  , BANK
             const accountnumber = info.account_number; // PHONE NUMBER OR BANK ACCOUNT NUMBER
             const account_name = info.account_name; // bank account name
             const bank_code = info.bank_code // bank_code
             const phonenumber = info.phone_number; // mpesa phone number
             
             const itemobj = await Item.findOne({_id: new ObjectId(item)})

            //  itemobj.quantity_remaining -= Number(order.quantity); // REDUCE THE ITEM'S REMAINING STOCK BU THE ORDER'S QUANTITY
            //  transactionobj.status = 'COMPLETED';
            //  order.status = 'NEW';
            //  shopobj.orders.push(order._id);

             const payinfo = order.payment_method;
             if(paymentmethod == 'M-PESA'){
                  payinfo.method = 'M-PESA';
                  payinfo.account_number = phonenumber;
                  payinfo.account_name = null;
                  payinfo.bank_code = null;
                  payinfo.phone_number = phonenumber;
             }

             if(paymentmethod == 'CARD'){
                payinfo.method = 'CARD';
                payinfo.account_number = accountnumber;
                payinfo.account_name = account_name;
                payinfo.bank_code = bank_code;
                payinfo.phone_number = null;
             }

            //  await order.item.shop.save();
            // await shopobj.save();
            await Shop.findOneAndUpdate(
                {_id:shopobj._id},
                {
                    $addToSet:{orders:order._id}
                },
                {new:true ,session}
            )
            //  await order.item.save();
            // await itemobj.save();
            //  await order.save();
            // await order.save();
            //  await order.transaction.save();
            //  await transactionobj.save();

             // add order to the buyer and seller accounts

            //  const buyer = order.buyer; replace with buyerobj
            //  const  seller = order.item.shop.owner; replace with sellerobj


            //  buyerobj.orders.push(order._id); // ADD OREDER TO THE BUYER'S ORDERS LIST
            await User.findByIdAndUpdate(
                buyerobj._id,
                {
                     $push: { orders: order._id },// add orer to buyer's orders array
                     $pull:{cart:item._id} // remove item from buyer's cart
                    
                    },
               
                { new: true ,session }
              );
              
            //  sellerobj.sales_orders.push(order._id); // ADD ORDER TO SELLER'S SALES LIST
            await User.findByIdAndUpdate(
                sellerobj._id,
                { $push: { sales_orders: order._id } }, // add orer to seller's sells orers array
                { new: true , session }
              );
              
              await Item.findOneAndUpdate(
                {_id:itemobj._id},
                {
                     $inc:{quantity_remaining:-Number(order.quantity)} // DECREASE QUANTITY OF ITEM REMAINING BY THE ORDER'S QUANTITY
                },
                { new: true , session }
              )

              await Transaction.findOneAndUpdate(
                {_id:transactionobj._id},
                {
                    $set:{status:'COMPLETED'}, // SET ORDER'S TRANSACTION'S TO COMPLETED

                },
                {new:true , session}
              )


              await Order.findOneAndUpdate(
                {_id:order._id},
                {
                    $set:{status:'NEW' ,payment_method:payinfo},  // SET ORDER'S STATUS TO NEW

                },
                {new:true , session}
              )
            //  seller. pending_payments.push(order._id) // ADD ORDER TO THE SELLER'S PENDIG PAYMENTS LIST (REMOVE FROM HERE , WILL BE ADDED WHEN SELLER CONFIRMS ORDER)

            //  await buyer.save();
            // await buyerobj.save();
            //  await sellerobj.save();


            await  session.commitTransaction();
             session.endSession();
       
    
         }
         else{
            if ((['FAILED', 'DECLINED', 'EXPIRED'].includes(info.state))){
                const stat = info.status;
          console.log('transaction failed or was declined');

          const order = await Order.findOne({_id: new ObjectId(info.api_ref)}).populate([
            {path:'item' , populate:[{path:'shop' , populate:{path:'items'}}]},
            {path:'transaction'}
         ]);
         if(!order){
            await session.abortTransaction();
                session.endSession();
            console.log('order not found');
            return res.status(200).json({ received: true });

         }

         const transobj = await Transaction.findOne({_id : new ObjectId(order.transaction._id)});
         if(!transobj){
                await session.abortTransaction();
                session.endSession();
                console.log('transaction obj not found');
                return res.status(200).json({ received: true });

         }
         transobj.status = 'FAILED';
         order.status = 'FAILED';

        
         await transobj.save({ session });
         await order.save({ session });
         

           
            }
            else{
                console.log('no response status found');
                return res.status(200).json({ received: true });

            }
           
         }


         res.status(200).json({received: true});


    }
    catch(err){
       await  session.abortTransaction();
        session.endSession();
        console.log('error occured in collection callack' , err);
        return res.status(500).json({error:true ,message:'server error' , problem:err})
    }
})








router.post(`/initiate_payout` , async function(req , res){
  let payout;
    try{
        const {initiator , orderid} = req.body;
        const account = await Admin.findOne({_id:new ObjectId(initiator)});
        if(!account){
            console.log('no such admin found');
            return res.status(400).json({error:true , message:'admin not found'});

        }
        // if(!account.isadmin){
        //     console.log('initiator is not an admin');
        //     return res.status(400).json({error:true , message:'initiator is not an admin'});

        // }

      const order = await Order.findOne({_id: new ObjectId(orderid)}).populate([
        {path:'buyer'},
        {path:'item' , populate:[
            {path:'shop' , populate:[
                     {path:'owner'},
                     {path:'items'}
            ]},

        ]},
        {path:'transaction'}
      ])


       if(!order){
        console.log('order not found');
        return res.status(400).json({error:true , message:'order not found'})
       }

       if(order.status == 'SETTLED'){
        console.log('order was already settled');
        return res.status(400).json({error:true , message:'order is already settled'})
       }

       if(order.status !== 'MATURED'){
        console.log('order not yet mature for payment to be made');
        return res.status(400).json({error:true , message:'order not yet matured'})
       }
       else
       {
        const buyer = order.buyer;
        const seller = order.item.shop.owner;
        const sellingshop = order.item.shop;
        const amount = order.total;
   
        // check seller's mode of receiving payments ,  pay seller ,  (update seller's pending payments , update seller's settled payments)  , update buyer's order status (remove from pending to completed orders) , 
   
        // 1 . check seller's mode of receiving payments
   
         const receivemethod = sellingshop.disbursement_method;
         let accnumber; // account number for card if receiving via bank or phone number if receiving via mpesa
         let bankcode;  // for bank code if receiving via card
         let url = 'https://payment.intasend.com/api/v1/payouts/'
         ;  
         let payload;
         if(receivemethod.method == 'card'){
              accnumber = receivemethod.payment_account_number;
              bankcode = sellingshop.disburse_bank.bank_code;
   
              payload = {
               public_key: process.env.INSTASEND_PUBLIC_API_KEY.trim(),
               provider: "BANK",
               amount: amount,
               currency: "KES",
               account_name: "John Doe",    // WILL ADD A BANK ACCOUNT NAME FIELD IN CREATE SHOP
               account_number:accnumber,
               bank_code: bankcode,     // Equity
               // branch_code: "000",  // Sometimes required
               api_ref: order._id,
               callback_url: "https://cashcrop.onrender.com/payout_callback"
              }
         } else if(receivemethod.method == 'mpesa'){
           accnumber = receivemethod.payment_account_number;
           // bankcode = sellingshop.disburse_bank.bank_code;
            payload = {
               public_key: process.env.INSTASEND_PUBLIC_API_KEY.trim(),
               provider: "M-PESA",
               amount: amount,
               currency: "KES",
               phone_number: receivemethod.payment_account_number,
               api_ref:order._id,
               callback_url: "https://cashcrop.onrender.com/payout_callback"
            }
         }
   
         const payoutresponse = await fetch("https://api.intasend.com/api/v1/send-money/initiate/", {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json",
                       "Authorization": `Bearer ${process.env.INSTASEND_SECRET_API_KEY.trim()}`
                   },
                   body: JSON.stringify(payload)
   });
   
        const info = await payoutresponse.json();
        if(!payoutresponse.ok){
           console.log('response from payout url is not OK');
           console.log(payoutresponse);
           return res.status(400).json({error:true , message:'payout url call unsuccessful'});
   
        }
        else{
           console.log('payout api call successful');
           if(info.status !== 'success'){
               return res.status(400).json({error:true , message:'payout initiation failed'});
   
           }
           else{
   
                payout = new Payout({
                administrator:account._id ,  total:amount , status:'PENDING' , order:order._id , instasend_id:info.data.id , type:'payment'
               });
               await payout.save();
               return res.status(200).json({error:true , message:'payout initiated'});
   
           }
           
        }
       }

   
     

    
    }
    catch(err){
        console.log('error occuder in initiate payout route' , err);
        if (payout) {
          await Payout.findByIdAndDelete(payout._id);
      }
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})



router.post(`/initiate_refund` , async function(req , res){
    let payout;
  try{
        const {initiator , orderid} = req.body;
        const account = await Admin.findOne({_id:new ObjectId(initiator)});
        if(!account){
            console.log('no such admin found');
            return res.status(400).json({error:true , message:'user not an admin'});

        }
        // if(!account.isadmin){
        //     console.log('initiator is not an admin');
        //     return res.status(400).json({error:true , message:'initiator is not an admin'});

        // }

      const order = await Order.findOne({_id: new ObjectId(orderid)}).populate([
        {path:'buyer'},
        {path:'item' , populate:[
            {path:'shop' , populate:[
                     {path:'owner'},
                     {path:'items'}
            ]},

        ]},
        {path:'transaction'}
      ])


       if(!order){
        console.log('order not found');
        return res.status(400).json({error:true , message:'order not found'})
       }

       if(order.status == 'REFUNDED'){
        console.log('order was already refunded');
        return res.status(400).json({error:true , message:'order is already refunded'})
       }

       
       if(!['CANCELLED', 'DECLINED' , 'RETURNED'].includes(order.status)){
        console.log('order is not cancelled , or no refund request');
        return res.status(400).json({error:true , message:'order not cancelled or no refund request'})
       }

     const buyer = order.buyer;
     const seller = order.item.shop.owner;
     const sellingshop = order.item.shop;
     const amount = order.total;

     // check seller's mode of receiving payments ,  pay seller ,  (update seller's pending payments , update seller's settled payments)  , update buyer's order status (remove from pending to completed orders) , 

     // 1 . check buyer's mode of pay to refund by

       const paymentinfo = order.payment_method;
   
      let payload;
      if(paymentinfo.method == 'CARD'){
          let accnumber = paymentinfo.account_number;
          let  bankcode = paymentinfo.bank_code;
          let  accname = paymentinfo.account_name;

           payload = {
            public_key: process.env.INSTASEND_PUBLIC_API_KEY.trim(),
            provider: "BANK",
            amount: amount,
            currency: "KES",
            account_name:accname,    // WILL ADD A BANK ACCOUNT NAME FIELD IN CREATE SHOP
            account_number:accnumber,
            bank_code: bankcode,     // Equity
            // branch_code: "000",  // Sometimes required
            api_ref: order._id,
            callback_url: "https://cashcrop.onrender.com/refund_callback"
           }
      } else if(paymentinfo.method == 'M-PESA'){
        let accnumber = paymentinfo.phone_number;
       
         payload = {
            public_key: process.env.INSTASEND_PUBLIC_API_KEY.trim(),
            provider: "M-PESA",
            amount: amount,
            currency: "KES",
            phone_number:accnumber,
            api_ref:order._id,
            callback_url: "https://cashcrop.onrender.com/refund_callback"
         }
      }

      const payoutresponse = await fetch("https://api.intasend.com/api/v1/send-money/initiate/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.INSTASEND_SECRET_API_KEY.trim()}`
                },
                body: JSON.stringify(payload)
});

     const info = await payoutresponse.json();
     if(!payoutresponse.ok){
        console.log('response from payout url is not OK');
        console.log(payoutresponse);
        return res.status(400).json({error:true , message:'payout url call unsuccessful'});

     }
     else{
        console.log('payout api call successful');
        if(info.status !== 'success'){
            return res.status(400).json({error:true , message:'payout initiation failed'});

        }
        else{

             payout = new Payout({
              administrator:account._id ,   total:amount , status:'PENDING' , order:order._id , instasend_id:info.data.id , type:'refund'
            });
            await payout.save();
            return res.status(200).json({error:true , message:'refund initiated'});

        }
        
     }
     

    
    }
    catch(err){
        console.log('error occuder in initiate refund route' , err);
        if (payout) {
          await Payout.findByIdAndDelete(payout._id);
      }
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})



router.post(`/payout_callback` , async function(req , res){  // THIS WORKS FOR PAYMENTS 
    const session = await mongoose.startSession();

    try{
        session.startTransaction();
      console.log('running payout callback' , req.body);
      const data =req.body;
      const info = data.data;
      if(info.payout_status !== 'COMPLETED'){
        console.log('payout was unsuccessful');
        // failure logic
        const order = await Order.findOne({_id: new ObjectId(info.api_ref)}).populate([
            {path:'buyer'},
            {path:'item' , populate:[
                {path:'shop' , populate:[
                         {path:'owner'},
                         {path:'items'}
                ]},
    
            ]},
            {path:'transaction'}
          ])

          if(!order){
            console.log('order not found');
            await session.abortTransaction();
            session.endSession();
           return res.status(200).json({error:false , received:true});

          }

          const payout = await Payout.findOne({instasend_id:data.id});
          if(!payout){
            console.log('payout was not found');
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({error:false , received:true});

          }


        //   const buyer = order.buyer;
        //   const seller = order.item.shop.owner;
        //   const sellingshop = order.item.shop;
        //   const amount = order.total;
         
          payout.status = 'FAILED';

          await payout.save({session});

          await session.abortTransaction();
          session.endSession();

      }
      else{
       
        const order = await Order.findOne({_id: new ObjectId(info.api_ref)}).populate([
            {path:'buyer'},
            {path:'item' , populate:[
                {path:'shop' , populate:[
                         {path:'owner'},
                         {path:'items'}
                ]},
    
            ]},
            {path:'transaction'}
          ])

          if(!order){
            console.log('order not found');
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({error:false , received:true});

          }

          const payout = await Payout.findOne({instasend_id:data.id});
          if(!payout){
            console.log('payout was not found');
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({error:false , received:true});

          }
        //   payout.status = 'SUCCESS';

        await Payout.findOneAndUpdate(
            {_id:payout._id},
            {
             $set:{status:'SUCCESS'} 
            },
            {new:true , session}
         )

          const buyer = order.buyer;
          const seller = order.item.shop.owner;
          const sellingshop = order.item.shop;
          const amount = order.total;
          const comodity = order.item;
         

           // ACTUALLY THIS SHOULD BE IN THE CALLBACK ROUTE , AFTER THE PAYOUT IS WELL DETERMINED TO BE SUCCESSFUL (WILL MOVE THE FOLLOWING DATABASE OPERATIONS TO THE CALLBACK ROUTE)
    // 2 . // updating seller's schema
         const pendingpayment = seller.pending_payments.findIndex(function(val){
            return val.toString() ==  order._id.toString();
         })

         if(pendingpayment == -1){
            console.log('seller has no such pending payment');
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({error:false , received:true});

            // return res.status(400).json({error:true , message:'seller has no such pending payment'})
         }

        //  seller.pending_payments.splice(pendingpayment , 1); //REMOVE ORDER FORM LIST OF PENDING PAYMENTS
        //  seller.settled_orders.push(order._id);  //ADD ORER TO LIST OF SETTLED PAYMENTS
           
         await User.findOneAndUpdate(
            {_id:seller._id},
            {
              $pull:{pending_payments:order._id},
              $addToSet:{settled_orders:order._id}  
            },
            {new:true , session}
         )
          // 3. updating buyer's schema  // NO NEED , SINCE BUYER CAN JUST SEE A LIST OF ALL ORDERS THEY MADE WITH THEIR RESPECTIVE STATUS

        //   order.status = 'SETTLED';
          await Order.findOneAndUpdate(
            {_id:order._id},
            {
              $set:{status:'SETTLED'},
            
            },
            {new:true , session}
         )
        //   await payout.save()
        //   await buyer.save();
        //   await seller.save();
        //   await order.save();
          
         await session.commitTransaction();
          session.endSession();
      }

return res.status(200).json({error:false , received:true});
    }
    catch(err){
         
        await session.abortTransaction();
        session.endSession();
        console.log('error occured in payout callback' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})



router.post(`/refund_callback` , async function(req , res){  // THIS WORKS FOR REFUNDS
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
      console.log('running refund callback' , req.body);
      const data =req.body;
      const info = data.data;
      if(info.payout_status !== 'COMPLETED'){
        console.log('refund was unsuccessful');
        // failure logic
        const order = await Order.findOne({_id: new ObjectId(info.api_ref)}).populate([
            {path:'buyer'},
            {path:'item' , populate:[
                {path:'shop' , populate:[
                         {path:'owner'},
                         {path:'items'}
                ]},
    
            ]},
            {path:'transaction'}
          ])

          if(!order){
            await session.abortTransaction();
            session.endSession();
            console.log('order not found');
            return res.status(200).json({error:false , received:true});

          }

          const payout = await Payout.findOne({instasend_id:data.id});
          if(!payout){
            await session.abortTransaction();
            session.endSession();
            console.log('payout was not found');
            return res.status(200).json({error:false , received:true});

          }


        //   const buyer = order.buyer;
        //   const seller = order.item.shop.owner;
        //   const sellingshop = order.item.shop;
        //   const amount = order.total;
         
          payout.status = 'FAILED';

          await payout.save({session});

          await session.abortTransaction();
            session.endSession();

      }
      else{
       
        const order = await Order.findOne({_id: new ObjectId(info.api_ref)}).populate([
            {path:'buyer'},
            {path:'item' , populate:[
                {path:'shop' , populate:[
                         {path:'owner'},
                         {path:'items'}
                ]},
    
            ]},
            {path:'transaction'}
          ])

          if(!order){
            console.log('order not found');
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({error:false , received:true});

          }

          const payout = await Payout.findOne({instasend_id:data.id});
          if(!payout){
            console.log('payout was not found');
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({error:false , received:true});

          }
        //   payout.status = 'SUCCESS';

          await Payout.findOneAndUpdate(
            {_id:payout._id},
            {
              $set:{status:'SUCCESS'}
            },
            {new:true , session}
         )

          const buyer = order.buyer;
          const seller = order.item.shop.owner;
          const sellingshop = order.item.shop;
          const amount = order.total;
         

           // ACTUALLY THIS SHOULD BE IN THE CALLBACK ROUTE , AFTER THE PAYOUT IS WELL DETERMINED TO BE SUCCESSFUL (WILL MOVE THE FOLLOWING DATABASE OPERATIONS TO THE CALLBACK ROUTE)
    // 2 . // updating seller's schema
         const pendingpayment = seller.pending_payments.findIndex(function(val){
            return val.toString() ==  order._id.toString();
         })

         if(pendingpayment == -1){
            await session.abortTransaction();
            session.endSession();
            console.log('seller has no such pending payment');
            return res.status(200).json({error:false , received:true});

            // return res.status(400).json({error:true , message:'seller has no such pending payment'})
         }

        //  seller.pending_payments.splice(pendingpayment , 1);

         await User.findOneAndUpdate(
            {_id:seller._id},
            {
              $pull:{pending_payments:order._id}
            },
            {new:true , session}
         )
        //  seller.settled_orders.push(order._id);

          // 3. updating buyer's schema  // NO NEED , SINCE BUYER CAN JUST SEE A LIST OF ALL ORDERS THEY MADE WITH THEIR RESPECTIVE STATUS

        //   order.status = 'REFUNDED';
          
         await Order.findOneAndUpdate(
            {_id:order._id},
            {
              $set:{status:'REFUNDED'}
            },
            {new:true , session}
         )
        //   await payout.save()
        //   await buyer.save();
        //   await seller.save();
        //   await order.save();
       
             await session.commitTransaction();
             session.endSession();
      }

      return res.status(200).json({error:false , received:true});
    }
    catch(err){
             await session.abortTransaction();
            session.endSession();
        console.log('error occured in refund callback' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})

router.get(`/get_seller_orders/:id` , async function(req , res){
    try{
        
     const id = req.params;
     const account = await User.findOne({_id: new ObjectId(id)}).populate([
        {path:'orders' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
               
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} ,
        {path:'sales_orders' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} ,

        {path:'pending_payments' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} ,
        {path:'settled_orders' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} 
     ])

     if(!account){
        console.log('no such account found');
        return res.status(400).json({error:true , message:'account not found'});
     }

     console.log('account found');
     return res.status(200).json({error:false ,purchases:account.orders , sales:account.sales_orders , pendingpays:account.pending_payments , settled:account.settled_orders });
    }
    catch(err){
        console.log('error getting seller orders' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})


router.get(`/get_buyer_orders/:id` , async function(req , res){
    try{
        
     const id = req.params;
     const account = await User.findOne({_id: new ObjectId(id)}).populate([
        {path:'orders' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
               
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} ,
        {path:'sales_orders' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} ,

        {path:'pending_payments' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} ,
        {path:'settled_orders' , populate:[
            {path:'item' , populate:[
                {path:'shop' , populate:[
                    {path:'owner'}
                ]},
            ]},
            {path:'buyer'},
            {path:'transaction'},

        ]} 
     ])

     if(!account){
        console.log('no such account found');
        return res.status(400).json({error:true , message:'account not found'});
     }

     console.log('account found');
     return res.status(200).json({error:false ,orders:account.orders});
    }
    catch(err){
        console.log('error getting seller orders' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
    }
})




router.post(`/cancel_order` , async function(req , res){
    const session = await mongoose.startSession();
    try{
        session.startTransaction();

      console.log('canceling order...');
      const {userid , orderid} = req.body;
      const account = await User.findOne({_id:new ObjectId(userid)});
      const order = await Order.findOne({_id:new ObjectId(orderid)}).populate([
        {path:'buyer'},
        {path:'item' , populate:[
            {path:'shop' , populate:[
                     {path:'owner'},
                     {path:'items'}
            ]},

        ]},
        {path:'transaction'}
      ]);

      if(!account){
        console.log('no such user found');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'no such user found'});
      }

      if(!order){
        console.log('no such order found');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'no such order found'});
      }

    if(order.status == 'CANCELLED'){
        console.log('order was alreay cancelled');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'order was already cancelled'});   
    }

    if(order.status == 'DELIVERED'){
        console.log('order was alreay delivered');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'order was already delivered , initiate refund instead'});   
    }

    // if(order.status == 'SETTLED'){  // ORDERS ARE SETTLED AFTER THE RETURN/REFUND WINDOW
    //     console.log('order was already settled');
    //     return res.status(400).json({error:true , message:'order was already settled , initiate refund instead'});   
    // }

    const buyer = await User.findOne({_id:new ObjectId(order.buyer)});
    const seller = await User.findOne({_id:new ObjectId(order.item.shop.owner._id)});
    const sellershop = await Shop.findOne({_id:new ObjectId(order.item.shop._id) });
    const item = await Item.findOne({_id:new ObjectId(order.item._id)});

          //  1 . PROCESS THE BUYER'S OBJECT


    // find and remove the order form the buyer's orders array
    // const orderindex = uyer.orders.finfIndex(function(val){ // IT WILL REMAIN FOR VIEWING PURPOSES , BUT WILL HAVE A CANCELLED STATUS
    //     return val.toString() == order._id.toString()
    // })

    // if(orderindex == -1){
    //     console.log('order was not found in buyer\'s orders');
    //     return res.status(400).json({error:true, message:'order not found in your orders'});
    // }



    // 2 . PROCESS THE SELLER'S OBJECT
    
    

    // find and remove the orer from pending payments
    if(order.status == 'CONFIRMED'){
        const paymentindex = seller.sales_orders.findIndex(function(val){
            return val.toString()== order._id.toString();
        })
    
        if(paymentindex == -1){
            console.log('order was not found in seller\'s pending payments');
            await session.abortTransaction();
            session.endSession()
            return res.status(400).json({error:true, message:'order not found in seller\'s pending payments'});
        }

        // remove from pending payments
        await User.updateOne(
            { _id: seller._id },
            {
              $unset: { [`seller.sales_orders.${paymentindex}`]: 1 },
              $pull: { "seller.sales_orders": null }
              
            } , 
            {session}
          );
          
    }

    // THE ORDER WILL REMAIN IN THE SELLER'S SELLS ARRAY FOR VIEWING PURPOSES , BUT ITS STATUS WILL BECOME CANCELLED
    
    // THE ORDER WILL STILL REMAIN IN THE SHOP'S ORDERS ARRAY , FOR VIEWING PURPOSE , BUT WILL ALSO HAVE THE STATUS


    //  PROCESS THE ITEM OBJECT

     // redeem quantity and quantity remaining of the item
     await Item.updateOne(
        { _id: item._id },
        { 
          $inc: {
            quantity_remaining: order.quantity,
            quantity: order.quantity
          }
        } , 
        {session}
      );
      

      //update the order's status

     const updatedorder =  await Order.findOneAndUpdate(
        {_id:order._id},
        {$set:{status:'CANCELLED'}},
        {new:true , session} 
     
      )

      await session.commitTransaction();
      session.endSession();
      console.log('order cancelled successfully');
      const updatedaccount = await User.findOne({_id:buyer._id})

      return res.status(200).json({error:false , message:'cancelled order successfully' , order:updatedorder , purchases:updatedaccount.orders ,sales:updatedaccount.sales_orders , pendingpayment:updatedaccount.pending_payments , settled:updatedaccount.settled_orders });

    }
    catch(err){
        
        console.log('error occured when cancelling order' , err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})



router.post(`/confirm_order` , async function(req , res){
    const session = await mongoose.startSession();
     
    try{
        session.startTransaction();
      console.log('confirming order.......');
      const {userid , orderid} = req.body;
      const account = await User.findOne({_id: new ObjectId(userid)});
      const order = await Order.findOne({_id:new ObjectId(orderid)}).populate([
        {path:'buyer'},
        {path:'item' , populate:[
            {path:'shop' , populate:[
                     {path:'owner'},
                     {path:'items'}
            ]},

        ]},
        {path:'transaction'}
      ]);

      if(!account){
        console.log('no such account found');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'user not found'});
      }

      if(!order){
        console.log('no such order found');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'order not found'});
      }

      if(order.status !== 'NEW'){
        console.log('order is not new');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'this is not a new order'});   
    }

    //   const buyer = await User.findOne({_id:new ObjectId(order.buyer)});
      const seller = await User.findOne({_id:new ObjectId(order.item.shop.owner._id)});
    //   const sellershop = await Shop.findOne({_id:new ObjectId(order.item.shop._id) });
      const item = await Item.findOne({_id:new ObjectId(order.item._id)});
  
      //  update seller's object
       // add order to pending payments 
      await User.updateOne(
        {_id:seller._id},
        {
            $addToSet:{pending_payments:order._id},
        
        },
        {session}
      )



      // update item object

      await Item.updateOne(
        {_id:item._id},
        {
           $inc : {quantity:-order.quantity}    // now permanently decrease quantity
        } , 
        {session}
      )



      //update order object

      const updatedorder = await Order.findOneAndUpdate(
        {_id:order._id},
        {
            $set:{status:'CONFIRMED'}
        },
        {new:true , session}
      )

      await session.commitTransaction();
      session.endSession();
      const updatedaccount = await User.findOne({_id:userid})

      
      console.log('successfully confirmed the order');
      
      return res.status(200).json({error:false, order:updatedorder , sales:updatedaccount.sales_orders , purchases:updatedaccount.orders , pendingpayment:updatedaccount.pending_payments , settled:updatedaccount.settled_orders});






    }
    catch(err){
        await session.abortTransaction();
        session.endSession()
        console.log('error confirming the order' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
    
})



router.post(`/decline_order` , async function(req , res){
    const session = await mongoose.startSession();
     
    try{
        session.startTransaction();
      console.log('declining order.......');
      const {userid , orderid} = req.body;
      const account = await User.findOne({_id: new ObjectId(userid)});
      const order = await Order.findOne({_id:new ObjectId(orderid)}).populate([
        {path:'buyer'},
        {path:'item' , populate:[
            {path:'shop' , populate:[
                     {path:'owner'},
                     {path:'items'}
            ]},

        ]},
        {path:'transaction'}
      ]);

      if(!account){
        console.log('no such account found');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'user not found'});
      }

      if(!order){
        await session.abortTransaction();
        session.endSession()
        console.log('no such order found');
        return res.status(400).json({error:true , message:'order not found'});
      }

      if(order.status !== 'NEW'){
        console.log('order is not new');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'this is not a new order'});   
    }

    if(order.status == 'DECLINED'){
        console.log('order was already declineD');
        await session.abortTransaction();
        session.endSession()
        return res.status(400).json({error:true , message:'this order was already rejected'});   
    }

    //   const buyer = await User.findOne({_id:new ObjectId(order.buyer)});
      const seller = await User.findOne({_id:new ObjectId(order.item.shop.owner._id)});
    //   const sellershop = await Shop.findOne({_id:new ObjectId(order.item.shop._id) });
      const item = await Item.findOne({_id:new ObjectId(order.item._id)});
  
      //  update seller's object
      //the order will remain in sales orders but will have a rejected status  for viewing purposes
      

      // update item object

      await Item.updateOne(
        {_id:item._id},
        {
           $inc : {quantity_remaining:order.quantity}    // return quantity remaining to where it was
        } , 
        {session}
      )



      //update order object

      const updatedorder = await Order.findOneAndUpdate(
        {_id:order._id},
        {
            $set:{status:'DECLINED'}
        },
        {new:true , session}
      )

      await session.commitTransaction();
      session.endSession();
      const updatedaccount = await User.findOne({_id:userid})

      
      console.log('successfully declined the order');
      
      return res.status(200).json({error:false, order:updatedorder , sales:updatedaccount.sales_orders , purchases:updatedaccount.orders , pendingpayment:updatedaccount.pending_payments , settled:updatedaccount.settled_orders});






    }
    catch(err){
        await session.abortTransaction();
        session.endSession()
        console.log('error declining the order' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }

})


router.get(`make_token` , async function(req , res){
    try{

    }
    catch(err){
        console.log('error making token' , err);
    }
})



router.get(`make_token` , async function(req , res){
    try{

    }
    catch(err){
        console.log('error making token' , err);
    }
})





module.exports = router;