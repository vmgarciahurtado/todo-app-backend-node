const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const { check } = require('express-validator');
const express = require('express');
const bcryptjs = require('bcryptjs');
const { validateFields, existEmail } = require("./middlewares/validate-fields");
const { verifyExist } = require("./helpers/db-validator");


initializeApp();

const app = express();

//******************************** TASKS ******************************************** */

app.get('/task/:id' ,[
  check('id','El id es obligatoria').not().isEmpty(),
  validateFields
], async (req , res) =>{

  const {id} = req.params;

    const writeResult = await getFirestore()
      .collection("tasks").where('userId', '==', id).get();

      const result = writeResult.docs.map(doc => doc.data());
      res.status(200).json(result);
});


app.post('/task' ,[
    check('id','El id es obligatoria').not().isEmpty(),
    check('title','El titulo es obligatorio').not().isEmpty(),
    check('state','El state es obligatorio').not().isEmpty(),
    check('description','La descripcion es obligatoria').not().isEmpty(),
    check('userId','El id del usuario es obligatorio').not().isEmpty(),
    validateFields
], async (req , res) =>{
    const {id,title, description,state,userId} = req.body;

    const enDescription = "english text";
    
    const writeResult = await getFirestore()
    .collection("tasks")
    .add({id,title,description,state,enDescription,userId});
    
    res.status(201).json({result: `task with ID: ${writeResult.id} added.`});
});

app.put('/task/:id',[
    check('state','El state es obligatorio').not().isEmpty(),
    check('state','No es un state valido').isIn(['true','false']),
    validateFields
], async (req , res) =>{
    const {id} = req.params;
    const {state} = req.body;

    const collection =  await getFirestore()
    .collection("tasks");

    collection.where('id', '==', id)
  .get()
  .then((querySnapshot) => {
    if (querySnapshot.empty) {
      console.log('No se encontró ningún elemento con el id:', id);
      return;
    }

    querySnapshot.forEach(async (doc) => {
      const document = collection.doc(doc.id);
      await document.update({state});
      res.status(200).json('Elemento actualizado');
    });
  })
  .catch((error) => {
      console.error('Error al buscar el elemento:', error);
      res.status(400).json('Error al buscar el elemento');
  });

});

app.delete('/task/:id' , async (req , res) =>{
    const {id} = req.params;

    const collection =  await getFirestore()
    .collection("tasks");

    collection.where('id', '==', id)
  .get()
  .then((querySnapshot) => {
    if (querySnapshot.empty) {
      console.log('No se encontró ningún elemento con el id:', id);
      return;
    }

    querySnapshot.forEach(async (doc) => {
      const document = collection.doc(doc.id);
      await document.delete();
      res.status(200).json('Elemento eliminado');
    });
  })
  .catch((error) => {
      console.error('Error al buscar el elemento:', error);
      res.status(400).json('Error al buscar el elemento');
  });

});

//********************************* USERS ******************************************* */

app.post('/user' ,[
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

//* USERS - GET **/
app.get('/user/:id' , async (req , res) =>{

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

//***************************** LOGIN *********************************************** */
app.post('/login' ,[
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
//**************************************************************************** */

exports.app = onRequest(app);

//*! Delete all tasks
// const a = await getFirestore()
// .collection("tasks").listDocuments();

// a.forEach(async (doc) => {
//     await doc.delete();
// });

//*! Delete all users
// const b = await getFirestore()
// .collection("users").listDocuments();
// b.forEach(async (doc) => {
//     await doc.delete();
// });