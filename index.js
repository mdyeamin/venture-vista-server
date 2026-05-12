require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("venture_vista");
    const destinationCollection = db.collection("destinations");

    // *****
    // get all data from the collection
    app.get("/destinations", async (req, res) => {
      const result = await destinationCollection.find().toArray();
      res.send(result);
    });

    // get single  data by id

    app.get("/destinations/:id", async (req, res) => {
      const id = req.params.id;
      const findOne = await destinationCollection.findOne({
        _id: new ObjectId(id),
      });

      res.send(findOne);
    });

    // post data to the collection
    app.post("/destinations", async (req, res) => {
      const destination = req.body;
      console.log(destination, "desti");

      const result = await destinationCollection.insertOne(destination);
      console.log("new post added", result);
      res.send(result);
    });

    // *****

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

run().catch(console.dir);
