import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken"

const createTweet = asyncHandler( async(req,res) => {
    
    const  incomingAccessToken  = req.cookies.refreshtoken 
    const { content } = req.body
    //const { getAccessToken } = req.cookies.refreshtoken  || req.body

    //console.log(incomingAccessToken)


    if(content == ""){
        throw new ApiError(400,"Enter sonthing to tweet");
    }

    if(!incomingAccessToken){
        throw new ApiError(400,"Access token is not there")
    }

    const decodedToken = jwt.verify(incomingAccessToken, process.env.REFRESH_TOKEN_SECRET);

    if(!decodedToken){
        throw new ApiError(400,"Error in decoding accessToken");
    }

    const user = await User.findById(decodedToken?._id);
    //console.log(user)
    const userId = user._id;

    const tweet = await Tweet.create(
        {
            content,
            owner : userId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet created successfully"
        )
    )

})

const getUserTweets = asyncHandler (async(req,res) => {
    
    const incomingAccessToken = req.cookies.refreshtoken

    if(!incomingAccessToken){
        throw new ApiError(400,"Accesstoken is not there")
    }

    const decodedToken = jwt.verify(incomingAccessToken,process.env.REFRESH_TOKEN_SECRET)

    if(!decodedToken){
        throw new ApiError(400,"Error in decoding the token");
    }

    // const user = await User.find()

    const tweets = await Tweet.find({owner:decodedToken?._id});

    console.log(tweets)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "tweets fetched successfully"
        )
    )

})

const updateTweet = asyncHandler(async(req,res) => {
    const tweetID = req.params.tweetId.replace(/^:/, '');
    const {newcontent} = req.body

    if(newcontent == ""){
        throw new ApiError("Fill the new tweet")
    }

    if(!tweetID){
        throw new ApiError(400,"Tweet ID is not there");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetID,
        {
            $set:{
                content:newcontent
            }
        }
    );

    if(!tweet){
        throw new ApiError(400,"Invalid tweet ID");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "tweet changed seccessfully"
        )
    )

})

const deleteTweet = asyncHandler(async(req,res) => {
    
    const tweetID = req.params.tweetId.replace(/^:/, '');

    if(!tweetID){
        throw new ApiError(400,"Tweet ID is not there");
    }

    const deleting = await Tweet.findByIdAndDelete(tweetID);

    if(!deleting){
        throw new ApiError(400,"Error in deleting the tweet");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deleting,
            "Tweet delete successfully"
        )
    )
})


export{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}