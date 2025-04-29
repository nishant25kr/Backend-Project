import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const getAllVideos = asyncHandler(async(req,res) => {

})

const publishAVideo = asyncHandler(async(req,res) => {
    
    //taking input form user
    const {title, description} = req.body;

    //checking validation
    if(title == ""){
        throw new ApiError(400,"Fill the Title");
    }
    if(description == ""){
        throw new ApiError(400,"Fill the Discription");
    }

    const videoLocalFile = req.files?.videoFile[0]?.path;
    const thumbnailLocalFile = req.files?.thumbnail[0]?.path;

    if(!videoLocalFile){
        throw new ApiError(400,"Video is not there");
    }

    if(!thumbnailLocalFile){
        throw new ApiError(400,"Thumbnail is not there");
    }

    console.log("hi")
    const uploadVideoOnCloudinary = await uploadOnCloudinary(videoLocalFile);
    const uploadthumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalFile);

    if(!uploadVideoOnCloudinary){
        throw new ApiError(400,"Error in uploading video in cloudinary");
    }
    if(!uploadthumbnailOnCloudinary){
        throw new ApiError(400,"Error in uploading thumbnail in cloudinary");
    }

    const video = await Video.create(
        {
            Title: title, 
            Description: description,
            thumbnail:uploadthumbnailOnCloudinary.url,
            videoFile:uploadVideoOnCloudinary.url
        }
    );

    if(!video){
        throw new ApiError(400,"Error in creating video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video uplaoded successfully")
    )


})


export {getAllVideos,publishAVideo}