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



          // DEFINR GRIDFS BUCKETS FOR FILE UPLOADS


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

router.get(`/make_token` , async function(req , res){
    try{
        const payload = {
            issuedAt: Date.now(),      // just to have some info
            type: "generic-token",     // optional custom info
          };
      const token =  jwt.sign(payload , process.env.JWT_SIGN , {expiresIn:"10m"} );
       if(token){
        return res.status(200).json({error:false, mesage:'token create' , token});
       }
    }
    catch(err){
        console.log('error making token' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})









router.get(`/verify_token/:token` , async function(req , res){
    try{
      const token = req.params.token;
      const status = jwt.verify(token , process.env.JWT_SIGN);
    
         console.log('token validated successfully');
         return res.status(200).json({error:false , message:'validation success'});
    
      
    }
    catch(err){
        console.log('error when verifying token' , err);
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
       const shop = await Shop.findOne({_id:new ObjectId(id)});
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
        console.log('error getting shop' , err);
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
            
            const downloadstream = profilepicsbucket.openDownloadStream(id);
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
        const id = req.params.id;  // NOT THE USER I , BUT THE IMAGE FILE ID FROM THE USER OBJECT
        const file = await shoppicsbucket.find({_id:new ObjectId(id)}).toArray();
        if(file?.length > 0){
            console.log('image found'  , file)
            res.set('Content-Type', file.metadata?.type || 'image/jpeg'  );
            
            const downloadstream = shoppicsbucket.openDownloadStream(id);
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
        const id = req.params.id;  // NOT THE USER I , BUT THE IMAGE FILE ID FROM THE USER OBJECT
        const file = await itempicsbucket.find({_id:new ObjectId(id)}).toArray();
        if(file?.length > 0){
            console.log('image found'  , file)
            res.set('Content-Type', file.metadata?.type || 'image/jpeg'  );
            
            const downloadstream = itempicsbucket.openDownloadStream(id);
            downloadstream.pipe(res);
            downloadstream.on('error' , function(err){
                console.log('error streaming item picture' , err);
                return res.status(500).json({error:true , problem:err , message:'streaming error'});
            })
        }
        else{
            console.log('item picture not found');
            return res.status(400).json({error:true , message:'user has no picture'});
        }

    }
    catch(err){
        console.log('error getting profile picture' , err);
        return res.status(500).json({error:true , prolem:err ,message:'server error'})
    }
})   





                  // REAL ROUTES


                  router.get('/', (req, res) => {
                    res.send('Hello World');
                  });



router.post(`/create_account` ,diskuploader.single('image') ,  async function(req , res){
    try{
      const {email , password , username , number , role , country, county , area} = req.body;
     const upload = req.file;
      const hash = await bcrypt.hash(password , 10);
      if(upload){
        const fileupload = new promise(function(resolve , reject){
            const name = upload.originalname;
            const path = upload.path;
            const size = upload.size;
            const type = upload.mimetype;

            const uploadstream = profilepicsbucket.openUploadStream(name , {
                metadata:{
                    name:name , size  , type:type
                }
            })

            const readstream = fs.createReadStream();
            readstream.pipe(uploadstream);

            readstream.on('finish' , function(){
                   resolve(uploadstream.id);
            })


            readstream.on('error' , function(err){
                  reject(err);
            })
        })

        const image = await fileupload;
        const newuser = new User({
           image , email , hash, username , number ,role , country , county , area
        })

        newuser.save();
        return res.status(200).json({error:false , message:'user created successfully' , user:newuser})

      }
      else{
        const newuser = new User({
            image , email , hash, username , number ,role , country , county , area
         })
 
         newuser.save();
         return res.status(200).json({error:false , message:'user created successfully' , user:newuser})
      }
    }
    catch(err){
        console.log('error creating account' , err);
        return res.status(500).json({error:true , message:'server error', problem:err})
    }
})




router.post(`/verify_otp` , async function(req , res){
    try{
       const {id , otp} = req.params;
       const user = await User.findOne({_id:new ObjectId(id)});
       if(user){
           
        if(otp === user.otp){
             console.log('OTP verification successful');
             user.otp = null;
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
      const {email , password} = req.body;
      const user = await User.findOne({email:email});
      if(user){
         console.log('user found');
         const match = await bcrypt.compare(password  ,user.password);
         if(match){
            return res.status(200).json({error:false , message:'loged in successfully'});
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






router.post(`/create_shop` , diskuploader.single('image') ,  async function(req , res){
    try{
        const {name , type , customtype ,  description , county , country , area } = req.body;
        const upload = req.file;
        
         if(upload){
           const fileupload = new promise(function(resolve , reject){
               const name = upload.originalname;
               const path = upload.path;
               const size = upload.size;
               const type = upload.mimetype;
   
               const uploadstream = shoppicsbucket.openUploadStream(name , {
                   metadata:{
                       name:name , size  , type:type
                   }
               })
   
               const readstream = fs.createReadStream();
               readstream.pipe(uploadstream);
   
               readstream.on('finish' , function(){
                      resolve(uploadstream.id);
               })
   
   
               readstream.on('error' , function(err){
                     reject(err);
               })
           })
   
           const image = await fileupload;
           const newshop = new Shop({
              image , name ,type , customtype , description , country , county , area
           })
   
           newshop.save();
           return res.status(200).json({error:false , message:'user created successfully' , shop:newshop})
   
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
    }
})























router.post(`/create_item` , diskuploader.single('image') ,  async function(req , res){
    try{
        const {name , type , description , quantity , unit , price , priceunit } = req.body;
        const upload = req.file;
        
         if(upload){
           const fileupload = new promise(function(resolve , reject){
               const name = upload.originalname;
               const path = upload.path;
               const size = upload.size;
               const type = upload.mimetype;
   
               const uploadstream = itempicsbucket.openUploadStream(name , {
                   metadata:{
                       name:name , size  , type:type
                   }
               })
   
               const readstream = fs.createReadStream();
               readstream.pipe(uploadstream);
   
               readstream.on('finish' , function(){
                      resolve(uploadstream.id);
               })
   
   
               readstream.on('error' , function(err){
                     reject(err);
               })
           })
   
           const image = await fileupload;
           const newitem = new Item({
              image , name ,type , description , quantity , unit , price , price_unit
           })
   
           newshop.save();
           return res.status(200).json({error:false , message:'user created successfully' , item:newitem})
   
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



router.get(`make_token` , async function(req , res){
    try{

    }
    catch(err){
        console.log('error making token' , err);
    }
})






module.exports = router;