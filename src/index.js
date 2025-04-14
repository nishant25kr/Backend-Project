import mongoose, { mongo } from "mongoose"
import { DB_NAME } from "./constants";

import express from "express"
const app = express()

/*
(()=>{
    try {
        mongoose.connect(`${process.env.mongoDB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`connected to ${process.env.PORT}`)
        })
    } catch (err) {
        console.log(err);
    }
})()
*/


