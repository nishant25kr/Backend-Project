import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.models.js";
import { Video } from '../models/video.models.js';


const addComment = asyncHandler(async(req,res) => {

    const { content } = req.body;
    const videoId = req.params.videoId;
    
    console.log(content)
    console.log(videoId)

    if(content == ""){
        throw new ApiError(400,"Content cannot be empty");
    }
    if(!videoId){
        throw new ApiError(400,"Video Id is not there");
    }
    // const video = await Video.findById()

    const video = await Video.findById(videoId);

    console.log(video)

    if(!video){
        throw new ApiError(400,"Invalid vadeo ID")
    }

    const comment = await Comment.create(
        {
            content,
            video: videoId,
            owner: req.user?._id
        }
    )

    if(!comment){
        throw new ApiError(400,"Something went wrong while creating comment");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment crated successfully"
        )
    )
},{timeStamp:true})

const getVideoComments = asyncHandler(async(req,res) => {
    
    const videoId = req.params.videoId.trim();
    
    if(!videoId){
        throw new ApiError(400,"Video id is not there");
    }

    const comments = await Comment.find({video:videoId})

    if(!comments){
        throw new ApiError(400,"There is no comment in this video")
    }

    console.log(comments)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comments,
            "Comments fetched successfully"
        )
    )

},{timeStamp:true})

const updateComment = asyncHandler(async(req,res) => {

    const {newcomment} = req.body;
    const commentId = req.params.commentId.trim()
    
  
    if(!newcomment || newcomment.trim() === ""){
        throw new ApiError(400,"Comment should not be empty")
    }

    if(!commentId){
        throw new ApiError(400,"CommentID is not there");
    }

    console.log(commentId);
    console.log(newcomment)

    const updatecomment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:newcomment
            }
        },
        { new: true }
    )
    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatecomment,
            "comment updated successfully"
        )
    )

},{timeStamp:true})

const deleteComment = asyncHandler(async(req,res) => {
    const commentId = req.params.commentId.trim();
    if(!commentId){
        throw new ApiError(400,"Video id is not there");
    }
    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
},{timeStamp:true})



export{
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
}