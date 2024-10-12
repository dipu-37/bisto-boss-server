const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const port = process.env.PORT || 5000
const app = express()
const jwt = require('jsonwebtoken');
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


    // jwt realted api 

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res.send({ token })
    })
    // middlewares 
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

     // use verify admin after verifyToken
     const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }


    // users related api 
    app.get('/users',verifyToken,verifyAdmin, async (req, res) => {
      //console.log(req.headers)
      const result = await userCollection.find().toArray();
      res.send(result)
    })
    app.post('/users', async (req, res) => {

      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

   

    // make admin 
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)

    })

    app.get('/users/admin/:email',verifyToken,async(req,res)=>{
      const email = req.params.email;
      if(email !==req.decoded.email){
        return res.status(403).send({message:'unauthorized access'})
      }
      const query = {email:email};
      const user = await userCollection.findOne(query);
      let admin = false;
      if(user){
        admin = user?.role==='admin';
      }
      res.send({admin});
    })

    app.delete('/users/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    //  menu realated api
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })
    app.get('/menu/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await menuCollection.findOne(query);
      res.send(result);
    })

    app.post('/menu',verifyToken,verifyAdmin, async (req, res) => {
      const item = req.body;
      const result = await menuCollection.insertOne(item);
      res.send(result);
    });
    app.patch('/menu/:id', async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          name: item.name,
          category: item.category,
          price: item.price,
          recipe: item.recipe,
          image: item.image
        }
      }

      const result = await menuCollection.updateOne(filter, updatedDoc)
      res.send(result);
    });
    
    app.delete('/menu/:id',verifyToken,verifyAdmin,async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await menuCollection.deleteOne(query);
      res.send(result)
    })
  
   
  

    // reviewsCollection 
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })

    // cart collection 

    app.get('/carts', async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      console.log("Querying cartsCollection with:", query);

      const result = await cartsCollection.find(query).toArray();
      res.send(result);
      console.log('result is ----->', result)
    })

    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result);
    })

    // delete the cart 
    app.delete('/carts/:id', async (req, res) => {
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



/**
 * --------------------------------
 *      NAMING CONVENTION
 * --------------------------------
 * app.get('/users')
 * app.get('/users/:id')
 * app.post('/users')
 * app.put('/users/:id')
 * app.patch('/users/:id')
 * app.delete('/users/:id')
 * 
*/