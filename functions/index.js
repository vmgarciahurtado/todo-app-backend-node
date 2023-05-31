const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const { check } = require('express-validator');
const express = require('express');
const { validateFields } = require("./middlewares/validate-fields");

initializeApp();

const app = express();

//* TAKS - GET **/
app.get('/task' , async (req , res) =>{
    const writeResult = await getFirestore()
      .collection("tasks").get();

      const result = writeResult.docs.map(doc => doc.data());
      res.status(200).json(result);
});


//* TAKS - POST **/
app.post('/task' ,[
    check('id','El id es obligatoria').not().isEmpty(),
    check('title','El titulo es obligatorio').not().isEmpty(),
    check('state','El state es obligatorio').not().isEmpty(),
    check('description','La descripcion es obligatoria').not().isEmpty(),
    validateFields
], async (req , res) =>{
    const {id,title, description,state} = req.body;
    const writeResult = await getFirestore()
    .collection("tasks")
    .add({id,title,description,state});
    
    res.status(201).json({result: `task with ID: ${writeResult.id} added.`});
});

//* TAKS - PUT **/
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
      document.update({state});
      res.status(200).json('Elemento actualizado');
    });
  })
  .catch((error) => {
      console.error('Error al buscar el elemento:', error);
      res.status(400).json('Error al buscar el elemento');
  });

});


//* USERS **/

exports.app = onRequest(app);

//*! Delete all tasks
// const a = await getFirestore()
// .collection("tasks").listDocuments();

// a.forEach(async (doc) => {
//     await doc.delete();
// });