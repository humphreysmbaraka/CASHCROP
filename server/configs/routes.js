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
      const validTokens = user?.expopushtoken.filter(Expo.isExpoPushToken);
  
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

router.get(`/make_token` , async function(req , res){
    try{
        const payload = {
            issuedAt: Date.now(),      // just to have some info
            type: "generic-token",     // optional custom info
          };
      const token =  jwt.sign(payload , process.env.JWT_SIGN , {expiresIn:"10m"} );
       if(token){
        return res.status(200).json({error:false, message:'token create' , token});
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
            return res.status(400).json({error:true , message:'user has no picture'});
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
        return res.status(200).json({error:false , message:'user created successfully' , user:newuser})

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
            console.log('expopushtoken updated');
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




router.post(`/create_shop` , memuploader.single('image') ,  async function(req , res){
    try{
        const {name , type , customtype ,  description , county , country , area , owner } = req.body;
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
             owner , image , name ,type , customtype , description , country:JSON.parse(country) , county:JSON.parse(county) , area:JSON.parse(area)
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
            shop ,  image , name ,type , description , quantity , unit , price , price_unit:priceunit
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
    try{
        const {name , type , description , quantity , unit , price , priceunit , id  , shop} = req.body;
        const upload = req.file;
        const shopobj = await Shop.findOne({_id:new ObjectId(shop)});
        if(!shopobj){
            console.log('no such shop found');
            return res.status(400).json({error:true , message:'no such shop found'});
        }
         
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
                item.image = image;
                item.name = name;
                item.type = type;
                item.description = description;
                item.quantity = quantity;
                item.unit = unit;
                item.price = price;
                item.price_unit = priceunit;
               
        
                await item.save();
               

              
                await shopobj.save();
                await shopobj.populate('items');
                await shopobj.populate('owner');
                return res.status(200).json({error:false , message:'item edited successfully' , item:item , shop:shopobj})
        
              }

              else{
                console.log('no image was attached');

              
                item.name = name;
                item.type = type;
                item.description = description;
                item.quantity = quantity;
                item.unit = unit;
                item.price = price;
                item.price_unit = priceunit;
               
        
                await item.save();
                

             
                await shopobj.save();
                await shopobj.populate('items');
                await shopobj.populate('owner');
                return res.status(200).json({error:false , message:'item edited successfully' , item:item , shop:shopobj})
               
                 }


        }
  
         else{
       
        console.log('item not found');
        return res.status(400).json({error:true , message:'item not found'})
         }
    }
    catch(err){
        console.log('error editting item' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})





router.delete(`/delete_item` , async function(req , res){
    
    try{
    const {shop , item} = req.query;
    const  sellingshop = await Shop.findOne({_id:new ObjectId(shop)});
    if(sellingshop){
         const comodity = await Item.findOne({_id:new ObjectId(item)});
         if(comodity){
            // const newitemslist = sellingshop.items.filter(function(val , ind){
            //     return val !== new ObjectId(item);
            // })
            // sellingshop.items = newitemslist;

            sellingshop.items = sellingshop.items.filter(function(val){
              return  val && val.toString() !== item;
            });
          
        
            await sellingshop.save();
            await sellingshop.populate('items');
            await sellingshop.populate('owner');

            await Item.deleteOne({_id:new ObjectId(item)});
            return res.status(200).json({eror:false , shop:sellingshop});
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
                   if(alreadyincart){
                    console.log('item is already in cart');
                    return res.status(400).json({error:true , message:'item is already in cart'})
                   }
                   account.cart.push(item._id);
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
                   account.saved.push(item._id);
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


router.get(`/cart_items/:id` , async function(req , res){
    try{
        const id = req.params.id;
        const user = await User.findOne({_id:new ObjectId(id)}).populate({
            path:'cart',
            populate:{
                path:'shop'
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







router.get(`/saved_items/:id` , async function(req , res){
    try{
        const id = req.params.id;
        const user = await User.findOne({_id:new ObjectId(id)}).populate({
            path:'saved',
            populate:{
                path:'shop'
            }
        });
        if(user){
           console.log('user found for successful saved items fetching');
           return res.status(200).json({error:false , items:user.saved});
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
       const acount = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
                const newcart = account.cart.filter(function(val ,ind){
                    return val !== item;
                })
                account.cart = newcart;
                await account.save();
                 
                const newacc = await account.populate({
                    path:'cart',
                    populate:{
                        path:'shop'
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
       const acount = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
                const newsaved = account.saved.filter(function(val ,ind){
                    return val !== item._id;
                })
                account.saved = newsaved;
                await account.save();

                const newacc = await account.populate({
                    path:'saved',
                    populate:{
                        path:'shop'
                    }
                })


                return res.status(200).json({error:false , saved:newacc.saved});
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
       const acount = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
                const newcart = account.cart.filter(function(val ,ind){
                    return val !== item._id;
                })
                account.cart = newcart;

                
                const newsaved = account.saved.push(item._id);
                account.saved = newsaved;


               

                await account.save();

                const saved = await account.populate({
                    path:'cart',
                    populate:{
                       path:'shop' 
                    }
                });


                return res.status(200).json({error:false , cart:saved.cart});
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
       const acount = await User.findOne({_id:new ObjectId(user)});
       if(account){
          const thing = await Item.findOne({_id:new ObjectId(item)});
          if(thing){
                const newsaved = account.saved.filter(function(val ,ind){
                    return val !== item._id;
                })
                account.saved = newsaved;

                
                const newcart = account.cart.push(item._id);
                account.saved = newsaved;


               

                await account.save();

                const saved = await account.populate({
                    path:'saved',
                    populate:{
                       path:'shop' 
                    }
                });


                return res.status(200).json({error:false , saved:saved.saved});
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
            return val.item.toString() == item;
        })

        if(!incart){
            console.log('product not in cart')
            return res.status(400).json({error:true , message:'product not in cart'});
        }
      
        incart.quantity += 1;

        await account.save();

        return res.status(200).json({error:false , message:'incremented successfully'});

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
            return val.item.toString() == item;
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

        return res.status(200).json({error:false , message:'decremented successfully'});

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



         if(!results){
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
        return res.status(200).json({error:false , message:'recomendations found' , results:results}); 
       }
    }
    catch(err){
        console.log('error geting results' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err});
    }
})











router.post(`make_an_stk_push` , async function(req , res){
    try{
       
       const {userid , item , quantity} = req.body;
     let {number} = req.body;
       // NUMBER CONVERSIONS , NORMALIZATION AND VERIFICATION
       let cleanednumber = number.replace(/\D/g, '');
       if(!cleanednumber.startsWith('254')){
          if(cleanednumber.startsWith('0')){
            cleanednumber = '254' + cleanednumber.slice(1);
          }
          else if(cleanednumber.startsWith('+254')){
            cleanednumber = '254' + cleanednumber.slice(4);
          }
          else{
            cleanednumber = 'invalid'
          }
        
       }
  
       const prefixes = ['25470','25471','25472','25474','254757','254758','254759','25479'];
       const correctformat = prefixes.some(function(val , ind){
         return  cleanednumber.startsWith(val);
       })
       if(cleanednumber =='invalid' || cleanednumber.length !== 12  || !correctformat){
        console.log('provided number is not is valid format');
        return res.status(400).json({error:true , message:'invalid number format'});
       }




       const user = await User.findOne({_id:new ObjectId(userid)});
       if(!user){
        console.log('no such user found');
        return res.status(400).json({error:true , message:'no such user found'});
       }
       else{

        const product = await Item.findOne({_id:item});
        if(!product){
         console.log('product not found');
         return res.status(400).json({error:true , message:'product not found' });
        }
 
        if(product.out_of_stock){
         console.log('product out of stock');
         return res.status(400).json({error:true , message:'product out of stock' });
        }
 
        if(quantity > product.quantity_remaining){
         console.log('demand exceeds available stock');
         return res.status(400).json({error:true , message:'demand exceeds stock' });
        }

        const total_price = (quantity * product.price);

        // USE THIS IF DOING A CHECK OUT ON CARTS WHERE THE USER PAYS FOR ALL PRODUCTS AT ONCE
    //     const products = user.cart.map(function(val , ind){
    //         return Item.findOne({_id:new ObjectId(val.item)}).exec();
    //     })

    //    const products_list = await Promise.all(products);

    //   products_list.forEach(function(val){
    //      const cart_match = user.cart.filter(function(cartitem){
    //         return cartitem.item == val._id;
    //      })
    //      if(cart_match.length ==0){
    //         console.log('product not found in the cart');
    //         throw new Error('product not found in cart');
    //      }
    //      else{
    //         total_price +=  (val.price * cart_match[0].quantity);
    //      }
    //   })


      // SENDING THE STK PUSH


      const consumerkey = process.env.CONSUMER_KEY.trim();
      const consumersecret = process.env.CONSUMER_SECRET.trim();
      const shortcode = process.env.SHORTCODE;
      const passkey = process.env.PASSKEY.trim();
      const callbackurl = process.env.CALLBACK_URL.trim();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g , '').slice(0,14);
      const authkey = new Buffer.from(`${consumerkey}:${consumersecret}`).toString('base64');
      const password = new Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

      console.log('fetching auth token');
      const authtoken = await fetch(`${process.env.LIVE_AUTH_URL}` , {
       headers: {
         'Authorization' : `Basic ${authkey}`,
         'Content-Type' : 'application/json'
       },
       method:'GET'
      })

      if(authtoken.ok){
       const tokeninfo = await authtoken.json();
       const token = tokeninfo.access_token;
       console.log('auth token successfully retrieved' , tokeninfo , token);

       

       const stkpayload = {
         BusinessShortCode:shortcode,
         Password:password,
         Timestamp:timestamp,
         TransactionType : 'CustomerPayBillOnline',
         Amount :total_price,
         PartyA:number,
         PartyB:shortcode,
         PhoneNumber:number,
         CallBackURL:callbackurl,
         AccountReference :process.env.ACCOUNT_REF,
         TransactionDesc:'joinin'

       }

       const response = await fetch(process.env.LIVE_LNM_URL.trim() , {
         headers:{
           'Authorization' : `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         
         method:'POST',
         body:JSON.stringify(stkpayload)
       });

       console.log('sending payload' , JSON.stringify(stkpayload));
     
       if(response.ok){
         console.log('stk pushed successfully');
         const responseinfo = await response.json();
         console.log('TOKEN PUSH INFO' , responseinfo);
           return res.status(200).json({error:false , message:'stk pushed successfully' , info:responseinfo});
       }
       else{
         console.log('failed to  push stk');
         const responseinfo = await response.json();
         console.log(response , responseinfo);
         return res.status(500).json({error:true , message:'error pushing stk' })
       }
       
      }
      else{
       console.log('error getting auth token (from auth URL)');
       return res.status(500).json({error:true , message:'server error getting auth token'});
      }





       }
    }
    catch(err){
        console.log('error pushing an STK push' , err);
        return res.status(500).json({error:true , message:'server error' , problem:err})
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