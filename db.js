const mongoose = require('mongoose');   

async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb+srv://desertsailor:0307@cluster0.52njkdy.mongodb.net/?appName=Cluster0/todolistDB");
    
    return mongoose;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
async function disconnectFromMongoDB() {
  await mongoose.connection.close();
}


module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB
};
