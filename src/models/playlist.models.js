import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        descriptions:{
            type:String,
            required:true
        },
        videos:[
            {
                type:mongoose.Schema.ObjectId,
                ref:"Video",
    
            },
        ],
        owner:{
            type:mongoose.Schema.ObjectId,
            ref:"User"
        }


    },{timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema);