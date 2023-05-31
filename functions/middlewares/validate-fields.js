const {validationResult} = require("express-validator");
const {verifyExist} = require("../helpers/db-validator");
const {getFirestore} = require("firebase-admin/firestore");


const validateFields = ( req, res, next ) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  next();
};


const existEmail = async (email) => {
  const collection = await getFirestore()
      .collection("users");

  const exist = await verifyExist(collection, "email", email);
  if (exist) {
    throw new Error(`El email ${ email } ya esta registrado en la BD`);
  }
};


module.exports = {
  validateFields,
  existEmail,
};
