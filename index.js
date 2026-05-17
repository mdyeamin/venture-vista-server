require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8000;
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
    // await client.connect();
    const db = client.db("venture_vista");
    const destinationCollection = db.collection("destinations");
    const bookingCollection = db.collection("bookings");

    // *****
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
    );
    const verifyToken = async (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      try {
        const { payload } = await jwtVerify(token, JWKS);
        console.log(payload);
        next();
      } catch (error) {
        return res.status(403).send({ message: "Forbidden" });
      }

      console.log("token from header", token);
    };

    // post data to the collection
    app.post("/destinations", async (req, res) => {
      const destination = req.body;
      console.log(destination, "desti");

      const result = await destinationCollection.insertOne(destination);
      console.log("new post added", result);
      res.send(result);
    });

    // get all data from the collection
    app.get("/destinations", async (req, res) => {
      const result = await destinationCollection.find().toArray();
      res.send(result);
    });

    // get single  data by id

    //middleware for validate id
    app.get("/destinations/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const findOne = await destinationCollection.findOne({
        _id: new ObjectId(id),
      });

      res.send(findOne);
    });
    // update single data by ID
    app.patch("/destinations/:id", async (req, res) => {
      const id = req.params.id;

      const updatedData = req.body;
      const result = await destinationCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        { $set: updatedData },
      );
      res.send(result);
    });

    // delete one by id
    app.delete("/destinations/:id",verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = destinationCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // booking API

    // add booking api
    app.post("/booking", async (req, res) => {
      const bookings = req.body;
      const result = await bookingCollection.insertOne(bookings);
      console.log(result, "catch from  backend");

      res.send(result);
    });

    // get booking api
    app.get("/booking/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;

      const result = await bookingCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    // delete booking
    app.delete("/booking/:bookingId",verifyToken, async (req, res) => {
      const { bookingId } = req.params;
      console.log(bookingId);

      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(bookingId),
      });
      console.log("after Delete booking", result);

      res.send(result);
      // if(deletedCount){
      //   revalidatePath(/)
      // }
    });
    // *****

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
