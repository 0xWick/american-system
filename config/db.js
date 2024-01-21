const mongoose = require("mongoose");

async function connectDB() {
  try {
    mongoose.set("strictQuery", false);
    if (process.env.NODE_ENV == "dev") {
      const conn = await mongoose.connect(process.env.MONGO_URI_ATLAS);
      console.log(`MONGO DB Connected: ${conn.connection.host}`.cyan.underline);  
    }
    else{
      console.log("Node Environment is not Dev")
    }

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDB;