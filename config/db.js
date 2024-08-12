const mongoose = require("mongoose");

async function connectDB() {
  try {
    mongoose.set("strictQuery", false);
    if (process.env.NODE_ENV == "prod") {
      const conn = await mongoose.connect(process.env.MONGO_URI_ATLAS);
      console.log(`MONGO DB Connected: ${conn.connection.host}`.cyan.underline);  
      console.log("Node Environment is Dev")
    }
    else{
      const conn = await mongoose.connect(process.env.MONGO_URI_LOCAL);
      console.log(`MONGO DB Connected: ${conn.connection.host}`.cyan.underline);  
      console.log("Node Environment is Local")
    }

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDB;