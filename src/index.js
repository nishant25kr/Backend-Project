import dotenv from "dotenv";
dotenv.config();  

import connectDB from "./db/db.js";  
import { app } from "./app.js";


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port:${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("DB connection failed: ",err);
});












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



