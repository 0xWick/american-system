const mongoose = require("mongoose");

async function connectDB() {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGO_URI_LOCAL);
    console.log(`MONGO DB Connected: ${conn.connection.host}`.cyan.underline);
    
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDB;