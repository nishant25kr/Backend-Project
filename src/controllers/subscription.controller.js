import {Subscription} from '../models/subscription.models.js'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// import { ApiError } from "../utils/ApiError";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler";

const toggleSubscription = asyncHandler(async(req,res) => {
    
    //channelId is ID of User of which you want to subscribe
    const channelId = req.params.channelId.trim();
    console.log(channelId)
    console.log(req.user._id)
    
    if(!channelId){
        new ApiError(400,"Channel ID is not there");
    }

    // if(!(channelId == req.user?._id)){

    // }

    const subscription = await Subscription.create(
        {
            subscriber:req.user._id,
            channel:channelId
        }
    )

    if(!subscription){
        throw new ApiError(400,"Error in creating subscription");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscription,
            "Subscription created sucessfully"
        )
    );

},{timeStamp:true})

const getUserChannelSubscribers = asyncHandler(async(req,res) => {
    
    const channelId = req.user?._id

    if(!channelId){
        throw new ApiError(400,"Channel ID is not there");
    }

    const subscribers = await Subscription.find({channel:channelId})
    // .select({subscriber:1})

    if(!subscribers){
        throw new ApiError(400,"Not found");
    }

    //console.log(subscribers)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "Subscriber fetch successfully"
        )
    );

},{timeStamp:true})

const getSubscribedChannels = asyncHandler(async(req,res) => {

    const subscriberId = req.user?._id;

    const channels = await Subscription.find({subscriber:subscriberId});

    if(!channels){
        throw new ApiError(400,"Error in fetching channels");
    }
    console.log(channels)

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
