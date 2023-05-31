const {getFirestore} = require("firebase-admin/firestore");
const { Router } = require('express');
const { check } = require('express-validator');
const bcryptjs = require('bcryptjs');
const { validateFields, existEmail } = require("../middlewares/validate-fields");
const { verifyExist } = require("../helpers/db-validator");

const router = Router();

router.post('/user' ,[
    check('id','El id es obligatoria').not().isEmpty(),
    check('name','El name es obligatorio').not().isEmpty(),
    check('email','El email no es valido').isEmail(),
    check('email').custom(existEmail),
    check('password','El password no es valido, debe tener mas de 2 caracteres').isLength({min: 3}),
    validateFields
  ], async (req , res) =>{
    const {id,name,email,password} = req.body;
    
    const salt = bcryptjs.genSaltSync();
    const pass = bcryptjs.hashSync(password,salt);
    
    const writeResult = await getFirestore()
    .collection("users")
    .add({id,name,email,pass});
    
    res.status(201).json({result: `user with ID: ${writeResult.id} added.`});
  });
  

  router.get('/user/:id' , async (req , res) =>{
    const {id} = req.params;
    const field = 'id';
    const validator = id;
    const collection =  await getFirestore()
    .collection("users");
  
    const user = await verifyExist(collection,field,validator);
    if (!user) {
      res.status(400).json('No se encontró ningún usuario');
    }
    res.status(200).json(user);
        
  });

  module.exports = router