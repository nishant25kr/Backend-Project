import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";



const getAllVideos = asyncHandler(async(req,res) => {

    const incomingAccessToken = req.cookies.refreshtoken || req.body;
    
    if(!incomingAccessToken){
        throw new ApiError(400,"AccessToken is not there");
    }
    
    const decodedToken = jwt.verify(incomingAccessToken,process.env.REFRESH_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?._id);
    
    if(!user){
        throw new ApiError(400,"User is not there");
    }

    const ownerId = user._id;

    //const newvideo = Video.find({ owner: ownerId }).select('Title')

    //const videoCount = await Video.countDocuments({ owner: ownerId });

    const sortedVideos = [
        await Video.find({ owner: ownerId })
    .select("Title -_id")  // Select only the Title field
    .sort({ Title: 1 })  // 1 for ascending order, -1 for descending order


    ] 

    //console.log(videoCount)
    //console.log(newvideo);

    console.log(sortedVideos);
    
    

})

const publishAVideo = asyncHandler(async(req,res) => {
    
    //taking input form user
    const { Title, Description } = req.body
    const incomingAccessToken = req.cookies.refreshtoken

    //console.log(incomingAccessToken)
    if(!incomingAccessToken){
        throw new ApiError(400,"incomingAccessToken is not there");
    }

    const decodedToken = jwt.verify(incomingAccessToken,process.env.REFRESH_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?._id)
    //console.log(user)
    

    //checking validation
    if(Title == ""){
        throw new ApiError(400,"Fill the Title");
    }
    if(Description == ""){
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

    
    const uploadVideoOnCloudinary = await uploadOnCloudinary(videoLocalFile);
    const uploadthumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalFile);

    if(!uploadVideoOnCloudinary){
        throw new ApiError(400,"Error in uploading video in cloudinary");
    }
    if(!uploadthumbnailOnCloudinary){
        throw new ApiError(400,"Error in uploading thumbnail in cloudinary");
    }

    console.log(Title)
    console.log(Description)

    const video = await Video.create(
        {
            Title, 
            Description,
            thumbnail:uploadthumbnailOnCloudinary.url,
            videoFile:uploadVideoOnCloudinary.url,
            owner:user._id
        }
    );

    

    //console.log(video.owner)

    if(!video){
        throw new ApiError(400,"Error in creating video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video uplaoded successfully")
    )


})

const getVideoById = asyncHandler(async (req,res) => {

    console.log(req.params.id)
    const video = await Video.findById(req.params.id)

    if(!video){
        throw new ApiError(400,"Invalid video ID");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    ) 


})


export {
     getAllVideos
    ,publishAVideo
    ,getVideoById
}