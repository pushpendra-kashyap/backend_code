import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Congratulations Your App listening this Port:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log("MONGODB Db Connection faild !!", error);
  });

// import express from "express";
// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.listen(process.env.PORT, () => {
//       console.log(`Congratulations App listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     throw error;
//   }
// })();
