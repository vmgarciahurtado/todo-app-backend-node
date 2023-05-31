const verifyExist = async (collection,field,validator) => {

    return new Promise((resolve, reject) => {

        collection.where(field, '==', validator)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
              resolve();
        }
        
        querySnapshot.forEach( (doc) => {
            resolve(doc.data());
        });
    })
    .catch((error) => {
        resolve();
        });
        
    })
}




module.exports = {
    verifyExist,
}