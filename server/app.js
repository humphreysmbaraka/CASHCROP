const express = require ('express');
const { connect } = require('./configs/database');
const dotenv = require ('dotenv').config();
const app = express();
const cors = require('cors');



app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use(cors({
    origin: '*',  // Replace with your frontend domain
    methods: ['GET', 'POST' , 'PATCH' , 'DELETE'],  // Allow only GET and POST requests
    allowedHeaders: ['Content-Type'],  // Allow only Content-Type header
}));

app.use(express.json());

app.use('/' , require('./configs/routes'));








connect().then(function(){
   console.log('server setting up....listening------');
   app.listen( process.env.PORT || 3000, () => {
    console.log(`Server started on port`);
   });
})
.catch(function(err){
    console.log('failed to connect to database' , err);
})