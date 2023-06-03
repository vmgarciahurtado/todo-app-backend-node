const {getFirestore} = require("firebase-admin/firestore");
const {check} = require("express-validator");
const {validateFields} = require("../middlewares/validate-fields");
const {Router} = require("express");

const router = Router();


router.get("/task/:id", [
  check("id", "El id es obligatoria").not().isEmpty(),
  validateFields,
], async (req, res) =>{
  const {id} = req.params;

  const writeResult = await getFirestore()
      .collection("tasks").where("userId", "==", id).get();

  const result = writeResult.docs.map((doc) => doc.data());
  res.status(200).json(result);
});


router.post("/task", [
  check("id", "El id es obligatoria").not().isEmpty(),
  check("title", "El titulo es obligatorio").not().isEmpty(),
  check("state", "El state es obligatorio").not().isEmpty(),
  check("description", "La descripcion es obligatoria").not().isEmpty(),
  check("userId", "El id del usuario es obligatorio").not().isEmpty(),
  check("date", "La fecha es obligatoria").not().isEmpty(),
  validateFields,
], async (req, res) =>{
  const {id, title, description, state, userId, date} = req.body;

  const enDescription = "english text";

  const writeResult = await getFirestore()
      .collection("tasks")
      .add({id, title, description, state, enDescription, userId, date});

  res.status(201).json({result: `task with ID: ${writeResult.id} added.`});
});

router.put("/task", [
  check("state", "El state es obligatorio").not().isEmpty(),
  check("taskId", "El taskId es obligatorio").not().isEmpty(),
  check("state", "No es un state valido").isIn(["true", "false"]),
  validateFields,
], async (req, res) =>{
  const {state, taskId} = req.body;
  const collection = await getFirestore()
      .collection("tasks");

  collection.where("id", "==", taskId)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(400).json("El elemento no existe");
        }

        querySnapshot.forEach(async (doc) => {
          const document = collection.doc(doc.id);
          await document.update({state});
          res.status(200).json("Elemento actualizado");
        });
      })
      .catch((error) => {
        console.error("Error al buscar el elemento:", error);
        return res.status(400).json("Error al buscar el elemento");
      });
});

router.delete("/task/:id", async (req, res) =>{
  const {id} = req.params;

  const collection = await getFirestore()
      .collection("tasks");

  collection.where("id", "==", id)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(400).json("El elemento no existe");
        }

        querySnapshot.forEach(async (doc) => {
          const document = collection.doc(doc.id);
          await document.delete();
          res.status(200).json("Elemento eliminado");
        });
      })
      .catch((error) => {
        console.error("Error al buscar el elemento:", error);
        return res.status(400).json("Error al buscar el elemento");
      });
});

module.exports = router;
