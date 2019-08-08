const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  port = 3001,
  mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/testDB", { useNewUrlParser: true });
const userModel = require("./models/user.model");

app.use(bodyParser());

app.get("/", (req, res) => res.send("Application is active"));

app.listen(port, () => console.log(`Application is running on port ${port}`));

/* Postman Collection link
 https://www.getpostman.com/collections/9ea21de8405b02d2fb4b
 */
//Add single or mutiple users
app.post("/users", async (req, res) => {
  try {
    if (!req.body.users) {
      return res.status(400).send({ message: "Unexpected user input" });
    }
    const users = req.body.users || []; // uers Array

    if (users.length) {
      await userModel.insertMany(users);

      return res.status(200).send({ message: "Data successfully added" });
    }
  } catch (err) {
    console.log("err", err);
    return res.status(500).send({ message: "Insertion failed" });
  }
});

function updateUserObj(user) {
  user.identity = Math.floor(Math.random() * 100000) + 1;
}

//Fetch all users
app.get("/users", async (req, res) => {
  try {
    let userList = await userModel.find({}).lean();

    /* The following requirement is not very clear. I need more detail on this.
     *
     * While retrieving users Loop through every user and make a async call every 3 seconds
     * that adds a new key to user object named "identity" and assign identity a random number.
     */
    userList.forEach(user => setTimeout(() => updateUserObj(user), 3000));

    res
      .status(200)
      .send({ message: "Data successfully fetched", data: userList });
  } catch (err) {
    res.status(500).send({ message: "Data retrieval failed" });
  }
});

// Fetch user by id
app.get("/user", async (req, res) => {
  try {
    const userId = req.query.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: "Invalid user Id" });
    }
    const userFound = await userModel.findOne({ _id: userId }).lean();

    if (userFound) {
      res
        .status(200)
        .send({ message: "Data successfully fetched", data: userFound });
    } else {
      res.status(200).send({ message: "Data not found" });
    }
  } catch (err) {
    res.status(500).send({ message: "Data retrieval failed" });
  }
});

app.all("*", (req, res) => {
  res.status(404).send({ message: "Url not found" });
});
