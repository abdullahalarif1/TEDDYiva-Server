const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const trending = require('./trending.json')

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.TOY_USER}:${process.env.TOY_PASS}@cluster0.xwxepqp.mongodb.net/?retryWrites=true&w=majority`;

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
        const usersCollection = client.db('shopCategory').collection('category')

        const myToyCollection = client.db('myToyCategory').collection('categories')

        const indexKeys = { seller: 1, toyName: 1 };
        const indexOptions = { name: "toyCategory" };
        const result = await myToyCollection.createIndex(indexKeys, indexOptions)

        app.get('/toySearchBySeller/:text', async (req, res) => {
            const searchText = req.params.text
            console.log(searchText);

            const result = await myToyCollection.find({
                $or: [
                    { seller: { $regex: searchText, $options: "i" } },
                    { toyName: { $regex: searchText, $options: "i" } },
                ],

            }).toArray()
            res.send(result)
        })




        app.get('/category', async (req, res) => {
            const cursor = usersCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })


        app.get('/myToys', async (req, res) => {
            console.log(req.query.subCategory);
            let query = {}
            if (req.query?.email && req.query?.subCategory) {
                query = { email: req.query.email },
                    query = { subcategory: req.query.subCategory }

            }
            const cursor = myToyCollection.find(query).limit(20)
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/myToys', async (req, res) => {
            const user = req.body
            console.log('create new', user);
            const result = await myToyCollection.insertOne(user)
            res.send(result)
        })

        app.patch('/myToys/:id', async (req, res) => {
            updateToy = req.body;
            console.log(updateToy);

        })

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await myToyCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/myToys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await myToyCollection.findOne(query)
            res.send(result)
        })


        app.put('/myToys/:id', async (req, res) => {
            const id = req.params.id
            const user = req.body
            console.log(user);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedUser = {
                $set: {
                    name: user.name,
                    price: user.price,
                    quantity: user.quantity,
                    description: user.description,


                }
            }
            const result = await myToyCollection.updateOne(filter, updatedUser, options,)
            res.send(result)
        })




        app.get('/trending', async (req, res) => {

            res.send(trending)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('toy market running')

})

app.listen(port, () => {
    console.log(`toy server running on ${port}`);
})