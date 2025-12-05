const express = require ('express');
const { connect } = require('./configs/database');
const dotenv = require ('dotenv').config();
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieparser = require('cookie-parser');

const server = http.createServer(app);

// app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({extended:true}));


const whitelist = [
    'http://localhost:5173',
    'https://localhost:5173',
    'http://127.0.0.1:5173',
    'http://10.0.2.2:3000',  // Android emulator (optional)
];

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow requests with no origin (React Native)
            if (!origin) return callback(null, true);
    
            // Allow if the origin is in the whitelist
            if (whitelist.includes(origin)) {
                return callback(null, true);
            }
    
            // Allow LAN IPs (actual phone)
            if (origin.startsWith('http://192.168.')) {
                return callback(null, true);
            }
    
            return callback(new Error('Not allowed by CORS: ' + origin));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});



// app.use(cors({
//     origin: function (origin, callback) {
//         // Allow requests with no origin (React Native)
//         if (!origin) return callback(null, true);

//         // Allow if the origin is in the whitelist
//         if (whitelist.includes(origin)) {
//             return callback(null, true);
//         }

//         // Allow LAN IPs (actual phone)
//         if (origin.startsWith('http://192.168.')) {
//             return callback(null, true);
//         }

//         return callback(new Error('Not allowed by CORS: ' + origin));
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));


app.use(express.json());

app.use('/' , require('./configs/routes'));



// Listen for incoming socket connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen to events from the client

    // NORMAL CASHCROP USER LOGS IN OR CREATES ACCOUNT
    socket.on('user register' ,async function(data , callback){
        id = data._id.toString();
        socket.join(id);
         

         callback();
    })
     
    // ORDER HAS BEEN CONFIRMED BY SELLER
    socket.on('order confirmed' ,async function(data , callback){
        const buyer = data.buyer.toString();
         const orderid = data._id.toString();
 
         io.to(buyer).emit('confirmed order' , orderid );
         socket.emit('confirmation' , orderid) // send event to the seller after confirming

         callback();
    })

    // ORER HAS BENN DECLINED BY SELLER
    socket.on('order declined' ,async function(data , callback){
        const buyer = data.buyer.toString();
         const orderid = data._id.toString();
 
         io.to(buyer).emit('declined order' , orderid );
         socket.emit('declination' , orderid)// send event to the seller afted declining

         callback();
    })


    // ORDER HAS BEEN CANCELLED BY BUYER
    socket.on('order cancelled' ,async function(data , callback){
         const buyer = data.buyer.toString();
         const orderid = data._id.toString();
         const seller = data.seller.toString();
         io.to(seller).emit('cancelled order' , orderid );
         socket.emit('cancellation' , orderid)
         callback();
    })


  // TEST EVENT TO TEST THE SOCKETS
    socket.on('test' ,async function(data , callback){
        console.log('test event received successfully');
        
        socket.emit('testresponse')
        callback();
   })


    // When a user disconnects
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});




connect().then(function(){
   console.log('server setting up....listening------');
   server.listen( process.env.PORT || 3000, () => {
    console.log(`Server started on port`);
   });
})
.catch(function(err){
    console.log('failed to connect to database' , err);
})