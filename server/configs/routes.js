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



router.post(`/create_account` ,memuploader.single('image') ,  async function(req , res){
    try{
      const {email , password , username , number , role , country, county , area} = req.body;
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
           image , email , password:hash, username , number ,role , country , county , area , OTP:OTP
        })

        await newuser.save();
        return res.status(200).json({error:false , message:'user created successfully' , user:newuser})

      }
      else{
        const OTP =  Math.floor(100000 + Math.random() * 900000);
        const newuser = new User({
             email , password:hash, username , number ,role , country , county , area , OTP:OTP
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





router.get(`/get_shops/:id` , async function(req , res){
    try{
         const id = req.params.id;
         const shops = await Shop.find({owner: new ObjectId(id)}).populate('items');
         if(!shops || shops.length == 0){
            console.log('no shops found');
            return res.status(200).json({error:false , message:'no shops found' ,shops:[]})
         }
         else{
            return res.status(200).json({error:false , message:'shops found' ,shops:shops})
         }
    }
    catch(err){
        console.log('error getting shops' , err);
        return res.status(500).status({error:true , message:'server error' , problem:err})
    }
})





router.post(`/create_shop` , memuploader.single('image') ,  async function(req , res){
    try{
        const {name , type , customtype ,  description , county , country , area } = req.body;
        const upload = req.file;
        
         if(upload){
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
    }
})























router.post(`/create_item` , diskuploader.single('image') ,  async function(req , res){
    try{
        const {name , type , description , quantity , unit , price , priceunit } = req.body;
        const upload = req.file;
        
         if(upload){
           const fileupload = new Promise(function(resolve , reject){
               const name = upload.originalname;
               const path = upload.path;
               const size = upload.size;
               const type = upload.mimetype;
   
               const uploadstream = itempicsbucket.openUploadStream(name , {
                   metadata:{
                       name:name , size  , type:type
                   }
               })
   
               const readstream = fs.createReadStream(path);
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
           return res.status(200).json({error:false , message:'item created successfully' , item:newitem})
   
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





router.patch(`/edit_item` , diskuploader.single('image') ,  async function(req , res){
    try{
        const {name , type , description , quantity , unit , price , priceunit , id } = req.body;
        const upload = req.file;
        const item = await Item.findOne({_id:new ObjectId(id)});
        if(item){
           
            if(upload){
                const fileupload = new Promise(function(resolve , reject){
                    const name = upload.originalname;
                    const path = upload.path;
                    const size = upload.size;
                    const type = upload.mimetype;
        
                    const uploadstream = itempicsbucket.openUploadStream(name , {
                        metadata:{
                            name:name , size  , type:type
                        }
                    })
        
                    const readstream = fs.createReadStream(path);
                    readstream.pipe(uploadstream);
        
                    readstream.on('finish' , function(){
                           resolve(uploadstream.id);
                    })
        
        
                    readstream.on('error' , function(err){
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
                item.price_unit = price_unit;
               
        
                await item.save();
                return res.status(200).json({error:false , message:'item edited successfully' , item:newitem})
        
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
    const  sellingshop = await Shop.findOne({_id:new ObjectId(id)});
    if(sellingshop){
         const comodity = await Item.findOne({_id:new ObjectId(item)});
         if(comodity){
            const newitemslist = sellingshop.items.filter(function(val , ind){
                return val !== item;
            })

            sellingshop.items = newitemslist;
            await sellingshop.save();
            await Item.deleteOne({_id:new ObjectId(item)});
            return res.status(200).status({eror:false , shop:sellingshop});
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






router.post(`/add_to_cart/:id` , async function(req , res){
    try{
        
         const {user , itemid} = req.query;
         const account = await User.fondOne({_id:new ObjectId(user)});
         if(account){
              console.log('user found');
              const item = await Item.fondOne({_id:new ObjectId(id)});
              if(item){
                   console.log('item found');
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
         const account = await User.fondOne({_id:new ObjectId(user)});
         if(account){
              console.log('user found');
              const item = await Item.fondOne({_id:new ObjectId(id)});
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





router.patch(`/save_for_later` , async function(req , res){
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
        console.log('error saving item for later' , err);
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









router.get(`/get_sugestions/:query` , async function(req , res){
    try{
       const query = req.params.query;

       const recomendations = await Item.find({
        $or: [
            { name: { $regex: query, $options: "i" } },  // match by name
            { description: { $regex: query, $options: "i" } }, // match by desc
            { type: { $regex: query, $options: "i" } },  // match by type
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
       const {query , page} = req.query;
       const limit = 30;

       const results = await Item.find({
        $or: [
            { name: { $regex: query, $options: "i" } },  // match by name
            { description: { $regex: query, $options: "i" } }, // match by desc
            { type: { $regex: query, $options: "i" } },  // match by type
          ]
       }).populate({path:'shop' , populate:'owner'  }).limit(limit).skip(page * limit).sort({createdAt:-1});

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