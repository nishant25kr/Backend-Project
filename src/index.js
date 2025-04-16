
import dotenv from "dotenv";
dotenv.config();  

import connectDB from "./db/db.js";  


connectDB();






//another way of connection

// (()=>{
//     try {
//         mongoose.connect(`${process.env.mongoDB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR",error);
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`connected to ${process.env.PORT}`)
//         })
//     } catch (err) {
//         console.log(err);
//     }
// })()



