import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content:{
            type:String,
            required:true,

        },
        video:{
            type: mongoose.Schema.ObjectId,
            ref: "Video"
        },
        owner:{
            type: mongoose.Schema.ObjectId,
            ref: "User",

        },
        
    },
    {timeseries:true}
)

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment",commentSchema)