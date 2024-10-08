const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const port = process.env.PORT || 5000
const app = express()

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://solosphere.web.app',
  ],

}
app.use(cors(corsOptions))
app.use(express.json())
require('dotenv').config()


console.log(process.env.DB_USER, process.env.DB_PASS)
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mq0mae1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gjzedcz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

/// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    const userCollection = client.db("BistoDb").collection("users");
    const menuCollection = client.db("BistoDb").collection("menu");
    const reviewsCollection = client.db("BistoDb").collection("reviews");
    await client.connect();
    const cartsCollection = client.db("BistoDb").collection("carts");
    await client.connect();

    // users related api 
    app.post('/user', async(req,res)=>{

      const user = req.body;
      const query = {email : user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send({message:'user already exists',insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })


  //  manucollection menu realated api
    app.get('/menu',async (req,res)=>{
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    // reviewsCollection 
    app.get('/reviews',async (req,res)=>{
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })

    // cart collection 

    app.get('/carts',async(req,res)=>{
      const email = req.query.email;

       const query = { email: email };
       console.log("Querying cartsCollection with:", query);

      const result = await cartsCollection.find(query).toArray();
      res.send(result);
      console.log('result is ----->',result)
    })

    app.post('/carts',async(req,res)=>{
      const cartItem=req.body;
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result);
    })
   
    // delete the cart 
     app.delete ('/carts/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
     })
   
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("gigaGadgets Confirmed!");
});

app.listen(port, () => {
  console.log(`Brandshop listening at http://localhost:${port}`);
});