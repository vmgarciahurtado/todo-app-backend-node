const {getFirestore} = require("firebase-admin/firestore");
const { check } = require('express-validator');
const { validateFields } = require("../middlewares/validate-fields");
const bcryptjs = require('bcryptjs');
const { verifyExist } = require("../helpers/db-validator");
const { Router } = require('express');

const router = Router();

router.post('/login' ,[
    check('email','El email no es valido').isEmail(),
    check('password','El password no es valido, debe tener mas de 2 caracteres').isLength({min: 3}),
    validateFields
  ], async (req , res) =>{
  
    const {email,password} = req.body;
  
    const collection =  await getFirestore()
    .collection("users");
  
    const user = await verifyExist(collection,'email',email);
    if (!user) {
     return res.status(400).json({
        msg: 'Usuario / Password no son correctos'
    });
    }
    
    const validPassword = bcryptjs.compareSync(password,user.pass);
    if (!validPassword) {
        return res.status(400).json({
            msg: 'Usuario / Password no son correctos'
        });
    }
    
    const {pass,...rest} = user;
    res.status(200).json(rest);
        
  });

  module.exports = router