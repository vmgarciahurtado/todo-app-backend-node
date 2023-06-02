const {getFirestore} = require("firebase-admin/firestore");
const {check} = require("express-validator");
const {validateFields} = require("../middlewares/validate-fields");
const {verifyExist} = require("../helpers/db-validator");
const {Router} = require("express");

const router = Router();

router.post("/login", [
  check("email", "El email no es valido").isEmail(),
  check("password", "El password al menos 2 caracteres").isLength({min: 3}),
  validateFields,
], async (req, res) =>{
  const {email, password} = req.body;

  const collection = await getFirestore()
      .collection("users");

  const user = await verifyExist(collection, "email", email);
  if (!user) {
    return res.status(400).json({
      msg: "Usuario / Password no son correctos",
    });
  }
  if (user.password != password) {
    return res.status(400).json({
      msg: "Usuario / Password no son correctos",
    });
  }

  res.status(200).json(user);
});

module.exports = router;
