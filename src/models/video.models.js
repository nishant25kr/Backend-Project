import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const videoSchema = new mongoose.Schema({

    videoFile:{
        type:String,
        required:[true,"Required"]
    },
    thumbnail:{
        type:String,
        required:[true,"Required"]
    },
    Title:{
        type:String,
        required:[true,"Required"]
    },
    Description:{
        type:String,
        required:[true,"Required"]
    },
    Duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0
    },
    isPublised:{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }




},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.modified("password")) return next();

    this.password = bcrypt.hash(this.password,5);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password)
}

export const Video = mongoose.model("Video",videoSchema)