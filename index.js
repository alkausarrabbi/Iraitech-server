const express=require("express");
const { MongoClient } = require('mongodb');
const app=express();
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
var admin = require("firebase-admin");


const port=process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// firebase admin initialization 


var serviceAccount = require('./iraitech-c2fec-firebase-adminsdk-hwswd-5d71d8a5fb.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jy706.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        console.log(idToken);
        try {
            const decodedUser = await admin.auth().verifyIdToken(idToken);
            console.log("ddddco",decodedUser)
            req.decodedUserEmail = decodedUser.email;
        }
        catch {

        }
    }
    next();
}

async function run() {
    try {
        await client.connect();
        const database = client.db('Iraitech');
        const usersCollection = database.collection('users');


        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.json(result);

        });
        app.get('/users/:email',verifyToken, async (req, res) => {
          
            const email = req.params.email;
            if (req.decodedUserEmail === email){
                const query = { email: email };
                const result = await usersCollection.findOne(query);
                res.send(result);
            }
            else {
                res.status(401).json({ message: 'User not authorized' })
            }
            

        });
        
// 
// 
// 
// 
// 
// 
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.json(result);
           
        });




// 
// 
// 
// 
// 
// 
// 




    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);






app.get('/',(req,res)=>{
    res.send("WelCome To Iraitech Innovations & Technologies Private Limited Database");
})

app.listen(port,()=>{
    console.log("listening Iraitech location is :",port);
})