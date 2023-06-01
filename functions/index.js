const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./credentials.json");
const cors = require("cors");

const functions = require("firebase-functions");

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(require("./routes/tasks"));
app.use(require("./routes/users"));
app.use(require("./routes/login"));

exports.app = functions.https.onRequest(app);
