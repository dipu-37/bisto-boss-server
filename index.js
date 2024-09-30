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
    const menuCollection = client.db("BistoDb").collection("menu");
    await client.connect();



    app.get('/menu',async (req,res)=>{
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
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