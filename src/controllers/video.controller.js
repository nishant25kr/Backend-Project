import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";



const getAllVideos = asyncHandler(async (req, res) => {

    const incomingAccessToken = req.cookies.refreshtoken || req.body;

    if (!incomingAccessToken) {
        throw new ApiError(400, "AccessToken is not there");
    }

    const decodedToken = jwt.verify(incomingAccessToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError(400, "User is not there");
    }

    const ownerId = user._id;

    //const newvideo = Video.find({ owner: ownerId }).select('Title')

    //const videoCount = await Video.countDocuments({ owner: ownerId });

    const sortedVideos =
        await Video.find({ owner: ownerId })
            .select("Title -_id")  // Select only the Title field
            .sort({ Title: 1 })  // 1 for ascending order, -1 for descending order


    //console.log(videoCount)
    //console.log(newvideo);

    //console.log(sortedVideos[0]);
    //console.log(sortedVideos[1]);
    for (let i = 0; i < sortedVideos.length; i++) {
        const element = sortedVideos[i];
        console.log(element);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                sortedVideos,
                "Videos fetched successfully"
            )
        )


})

const publishAVideo = asyncHandler(async (req, res) => {

    //taking input form user
    const { Title, Description } = req.body
    const incomingAccessToken = req.cookies.refreshtoken

    //console.log(incomingAccessToken)
    if (!incomingAccessToken) {
        throw new ApiError(400, "incomingAccessToken is not there");
    }

    const decodedToken = jwt.verify(incomingAccessToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id)
    //console.log(user)


    //checking validation
    if (Title == "") {
        throw new ApiError(400, "Fill the Title");
    }
    if (Description == "") {
        throw new ApiError(400, "Fill the Discription");
    }

    const videoLocalFile = req.files?.videoFile[0]?.path;
    const thumbnailLocalFile = req.files?.thumbnail[0]?.path;

    if (!videoLocalFile) {
        throw new ApiError(400, "Video is not there");
    }

    if (!thumbnailLocalFile) {
        throw new ApiError(400, "Thumbnail is not there");
    }


    const uploadVideoOnCloudinary = await uploadOnCloudinary(videoLocalFile);
    const uploadthumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalFile);

    if (!uploadVideoOnCloudinary) {
        throw new ApiError(400, "Error in uploading video in cloudinary");
    }
    if (!uploadthumbnailOnCloudinary) {
        throw new ApiError(400, "Error in uploading thumbnail in cloudinary");
    }

    console.log(Title)
    console.log(Description)

    const video = await Video.create(
        {
            Title,
            Description,
            thumbnail: uploadthumbnailOnCloudinary.url,
            videoFile: uploadVideoOnCloudinary.url,
            owner: user._id
        }
    );



    //console.log(video.owner)

    if (!video) {
        throw new ApiError(400, "Error in creating video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "video uplaoded successfully")
        )


})

const getVideoById = asyncHandler(async (req, res) => {

    const geetingvideoId = req.params.videoId.replace(/^:/, '');

    console.log(geetingvideoId)

    const video = await Video.findById(geetingvideoId)

    if (!video) {
        throw new ApiError(400, "Invalid video ID");
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

const updateVideo = asyncHandler(async (req, res) => {

    const videoLocalPath = req.file?.path

    const geetingoldvideoId = req.params.videoId.replace(/^:/, '');

    console.log(geetingoldvideoId)

    const oldvideo = await Video.findById(geetingoldvideoId)

    if (!oldvideo) {
        throw new ApiError(400, "Invalid video ID");
    }

    const newvideo = await uploadOnCloudinary(videoLocalPath)

    if (!newvideo) {
        throw new ApiError(400, "Error in uploading to cloudinary");
    }

    //const oldthumbnail = await Video.findById(geetingoldvideoId)
    // if(!oldthumbnail){
    //     throw new ApiError(400,"old video fetched")
    // }

    //console.log(oldthumbnail)

    const video = await Video.findByIdAndUpdate(
        geetingoldvideoId,
        {
            $set: {
                thumbnail: newvideo.url
            }
        },
        { new: true }
    )

    console.log(video.thumbnail)

    return res
        .status(200)
        .json(
            200,
            {},
            "Video updated successfully"
        )

})

const deleteVideo = asyncHandler(async (req, res) => {

    const videoId = req.params.videoId.replace(/^:/, '');

    if (!videoId) {
        throw new ApiError(400, "VideoId is not there");
    }

    const deletevideo = await Video.findByIdAndDelete(videoId);

    if (!deleteVideo) {
        throw new ApiError(400, "Error in deleting the video");
    }

    console.log("Video deleted SuccessFully")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "video deleted successfully"
            )
        )

})

const togglePublishStatus = asyncHandler(async (req, res) => {

    const videoId = req.params.videoId.replace(/^:/, '');

    if (!videoId) {
        throw new ApiError(400, "VideoId is not there");
    }

    const video = await Video.findById(videoId);

    const oldstatus = video.isPublished

    if(video.isPublished){
        video.isPublished=false
    }else{
        video.isPublished = true
    }

    await video.save();
    const newstatus = video.isPublished


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            `changed is public from ${oldstatus} to ${newstatus}`
        )
    )

})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}