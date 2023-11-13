const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
// miidlewire
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vmck6km.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection




    
    const menuCollection =client.db("mayerdua").collection("menu")
    const cartsCollection = client.db("mayerdua").collection("carts");
    const userCollection = client.db("mayerdua").collection("users");
    const paymentCollection = client.db("mayerdua").collection("payments");
    const reviewsCollection = client.db("mayerdua").collection("reviews")
    const teamCollection = client.db("mayerdua").collection("team")

// user related api
app.get('/users', async (req, res) => {
const result = await userCollection.find().toArray()
res.send(result)
})
// post users
app.post('/users',async(req,res)=>{
const user =req.body
const query = { email: user.email }
        const existingUser = await userCollection.findOne(query)
        if (existingUser) {
            return res.send({ message: "user already exist " })
        }
const result =await userCollection.insertOne(user)
res.send(result)
})
//check admin
app.get('/users/admin/:email',async(req,res)=>{
const email = req.params.email;
const query ={email:email}
const user =await userCollection.findOne(query)
const result ={admin: user?.role==='admin'}
res.send(result)
})
// make admin
app.patch('/users/admin/:id', async (req, res) => {

const id = req.params.id
const filter = { _id: new ObjectId(id) }
const updateDoc = {
    $set: {
        role: 'admin'
    }
}
const result = await userCollection.updateOne(filter, updateDoc)
res.send(result)

})
// for menu
app.get('/menu', async (req, res) => {
const result = await menuCollection.find().toArray()
res.send(result)
})

app.post('/menu', async (req, res) => {
const newItem = req.body
const result = await menuCollection.insertOne(newItem)
res.send(result)

})

// for delete



app.delete('/menu/:id',async(req,res)=>{
const id=req.params.id
const query ={_id:new ObjectId(id)};
const result =await menuCollection.deleteOne(query)
res.send(result)
})
// Update a menu item

app.put('/menu/:id', async (req, res) => {

const id = req.params.id
const filter = { _id: new ObjectId(id) }
const options = { upsert: true }
const updateMenu = req.body
const newMenuItem = {
    $set: {
      name: updateMenu.name,
      price: updateMenu.price,
      category: updateMenu.category,
      recipe: updateMenu.recipe,
      Image: updateMenu.image,
    },
}
const result = await menuCollection.updateOne(filter, newMenuItem, options)
res.send(result)
})



// for team
app.get('/team', async (req, res) => {
const result = await teamCollection.find().toArray()
res.send(result)
})


    // for review
    app.get('/reviews', async (req, res) => {
        const result = await reviewsCollection.find().toArray()
        res.send(result)
    })

    // for review
    app.get('/reviews', async (req, res) => {
        const result = await reviewsCollection.find().toArray()
        res.send(result)
    })
    // cartcollection

    // get item based on email
    app.get('/carts', async (req, res) => {
        const email = req.query.email;
        if (!email) {
            res.send([]);
        }
        const query = { email: email };
        const result = await cartsCollection.find(query).toArray()
        res.send(result)
    })

    // added carts
    app.post('/carts', async (req, res) => {
        const item = req.body;
        console.log(item);
        const result = await cartsCollection.insertOne(item)
        res.send(result)
    })
// for delete
app.delete('/carts/:id',async(req ,res)=>{
const id=req.params.id
const query ={_id: new ObjectId(id)};
const result = await cartsCollection.deleteOne(query)
res.send(result)
})
// create payment intent
app.post('/create-payment-intent',async(req,res)=>{
const {price}=req.body
const amount =await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
})
res.send({
    clientSecret:paymentIntent.client_secret
})
})
// payment related api
app.post('/payments', async (req, res) => {
const payment = req.body;
const insertResult = await paymentCollection.insertOne(payment);

const query = { _id: { $in: payment.cartItems.map(id => new ObjectId(id)) } }
const deleteResult = await cartCollection.deleteMany(query)

res.send({ insertResult, deleteResult });
})


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send("  MayerDUa is running")
})

app.listen(port, () => {
    console.log(` MayerDUa is sitting port on ${port}`);
})
