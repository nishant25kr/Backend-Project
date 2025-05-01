import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.models.js";


const createPlaylist = asyncHandler(async(req,res) => {
    
    console.log("hi")
    const { name,descriptions } = req.body
    
    if(!name){
        throw new ApiError(400,"Name is required")
    }

    // console.log(name)
    // console.log(descriptions)
    // console.log(req.user)

    const playlist = await Playlist.create(
        {
            name,
            descriptions,
            owner:req.user._id
        }
    )

    if(!playlist){
        throw new ApiError(400,"Error in craeting playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist created successfully"
        )
    )
},{timeStamp:true})

const getUserPlaylists = asyncHandler(async(req,res) => {
    const playlistOfUser = await Playlist.find({ owner: req.user._id }).select({ name: 1, _id: 1,owner:1 });


    // console.log(playlistOfUser)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlistOfUser,
            "Playlist fetched successfully"
        )
    )
},{timeStamp:true})

const getPlaylistById = asyncHandler(async(req,res) => {

    const playlistId = req.params.playlistId.replace(/^:/,'');

    if(!playlistId){
        throw new ApiError(400,"Playlist Id is not there");
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Invalid Id or Playlist is not available")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )

},{timeStamp:true})

const addVideoToPlaylist = asyncHandler(async(req,res) => {
    
    const videoId = req.params.videoId.trim()
    const playlistId = req.params.playlistId.trim()

    // const { videoId, playlistId } = req.params.trim();

    console.log(videoId)
    console.log(playlistId)
    
    // const playlistId = req.params.playlistId.replace(/^:/,'');
    
    if(!videoId || !playlistId){
        throw new ApiError(400,"videoID or PlaylistId is not there")
    }

    //const video = await Video.findById(videoId);
    const playlist = await Playlist.findById(playlistId);
    // const playlist = await Playlist.findByIdAndUpdate(
    //     playlistId,
    //     {
    //         $set:{
    //             video:[video]
    //         }
    //     }
    // );
    
    // if (!playlist.videos(vi)) {
    //     playlist.videos=video;
    //     await playlist.save();
    //   }

    if(!playlist){
        throw new ApiError(400,"Error in playlist")
    }
   
    if(!playlist.videos.includes(videoId)){
        playlist.videos.push(videoId);
        await playlist.save();
    }
   
    //console.log(video)
    //console.log(playlist)

    if(!playlist){
        throw new ApiError(400,"Error in adding video to playlist")
    }

    //playlist.video = video;

    console.log(playlist)


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Video added successfully"
        )
    )

},{timeStamp:true})

const removeVideoFromPlaylist = asyncHandler(async(req,res) => {

    const videoId = req.params.videoId.trim();
    const playlistId = req.params.playlistId.trim();
    
    if(!videoId || !playlistId){
        throw new ApiError(400,"VideoId and PlaylistId is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"Error in fetching playlist")
    }

    if(playlist.videos.includes(videoId)){
        playlist.videos.pull(videoId)
        await playlist.save()
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "successfully deleted the video fron playlist"
        )
    )

},{timeStamp:true})

const deletePlaylist = asyncHandler(async(req,res) => {
    const playlistId = req.params.playlistId.trim()
    
    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(400,"Deleted playlist successfully");
    }

    return res
    .status(200)
    .json(
        new ApiError(
            200,
            {},
            "Playlist deleted successfully"
        )
    )
},{timeStamp:true})

const updatePlaylist = asyncHandler(async (req, res) => {
    
    const playlistId = req.params.playlistId.trim();
    const {name, descriptions} = req.body

    console.log(name)
    console.log(descriptions)
    console.log(playlistId)

    if(!playlistId || !name || !descriptions){
        throw new ApiError(400,"Everything is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                descriptions
            }
        }
    )

    if(!playlist){
        throw new ApiError(400,"Error in changing in database");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Data updated successfully"
        )
    )

},{timeStamp:true})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist

}