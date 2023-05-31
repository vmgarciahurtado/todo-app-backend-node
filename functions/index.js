const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");

const admin = require("firebase-admin");
const serviceAccount = require("./credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

//* *** TASKS **** */
app.use(require("./routes/tasks"));

//* *** USERS **** */
app.use(require("./routes/users"));

//* *** LOGIN **** */
app.use(require("./routes/login"));

exports.app = onRequest(app);

//* ! Delete all tasks
// const a = await getFirestore()
// .collection("tasks").listDocuments();

// a.forEach(async (doc) => {
//     await doc.delete();
// });

//* ! Delete all users
// const b = await getFirestore()
// .collection("users").listDocuments();
// b.forEach(async (doc) => {
//     await doc.delete();
// });
