import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Like} from "../models/like.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async(req,res) => {

    const videoId = req.params.videoId.trim();
    
    if(!videoId){
        throw new ApiError(400,"VideoId is required");
    }

    // const checklike = await Like
    const like = await Like.create(
        {
            video:videoId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "like to video created successfully"
        )
    )

},{timeStamp:true})

const toggleCommentLike = asyncHandler(async(req,res) => {
    const commentId = req.params.commentId.trim();
    
    if(!commentId || commentId===""){
        throw new ApiError(400,"Comment ID is required");
    }

    const like = await Like.create(
        {
            comment:commentId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Comment liken successfully"
        )
    );


},{timeStamp:true})

const toggleTweetLike = asyncHandler(async(req,res) => {
    
    const tweetId = req.params.tweetId.trim();
    
    if(!tweetId || tweetId===""){
        throw new ApiError(400,"Comment id is required")
    }

    const like = await Like.create(
        {
            tweet:tweetId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Tweet like successfully"
        )
    );


},{timeStamp:true})

const getLikedVideos = asyncHandler(async(req,res) => {

    const likedVideos = await Like.find().select({ video: 1 })

    const videos = likedVideos.map(item => item.video); // extract only videos

    console.log(videos)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "Liked video fetched"
        )
    )
     
},{timeStamp:true})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}