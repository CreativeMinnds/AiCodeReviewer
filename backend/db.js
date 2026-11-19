const mongoose = require("mongoose");
const config = require("./config/env");

async function connectionDb() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDb Connected..");
  } catch (err) {
    console.error("Mongodb Error:", err.message);
    // In production let the host restart the service instead of running without a database.
    if (config.isProd) process.exit(1);
  }
}

module.exports = connectionDb;
