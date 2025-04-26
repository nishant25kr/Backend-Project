import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        
        const accesstoken = user.generateAccessToken();

        const refreshtoken = user.generateRefreshToken();

        user.refreshtoken = refreshtoken;
        await user.save({ validateBeforeSave: false });

        return { accesstoken, refreshtoken }

    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    //GET USER DETAIL FROM FORNTEND
    const { fullname, username, email, password } = req.body
    console.log(username);
    console.log(email);

    //steps->validation - not empty
    if (fullname === "") {
        throw new ApiError(400, "Fullname is empty",)
    }
    if (email === "") {
        throw new ApiError(400, "email is empty",)
    }
    if (username === "") {
        throw new ApiError(400, "username is empty",)
    }
    if (password === "") {
        throw new ApiError(400, "Password is empty",)
    }

    //check if user alresdy exist ->from username and email
    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existUser) throw new ApiError(409, "User alrady exist");

    //check for coverimage and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required 1");
    }

    //uploade to cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!coverImage) {
        throw new ApiError(400, "coverImage file is required 2");
    }


    if (!avatar) {
        throw new ApiError(400, "Avatar file is required 2");
    }

    //create  user object-create entry in DB

    const user = await User.create(
        {
            fullname,
            avatar: avatar.url,
            coverImage: coverImage.url || "",
            email,
            username: username.toLowerCase(),
            password
        }
    );


    //remove password and refresh token field from response
    const usercreate = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //check for user creation
    if (!usercreate) {
        throw new ApiError(500, "Something went wrong while registring the user");
    }

    //return res.
    return res.status(201).json(
        new ApiResponse(200, usercreate, "User registered successfully!")
    );

})

const loginUser = asyncHandler(async (req, res) => {

    //collect the inputs
    //check the validations
    //verify the user
    //access and refresh token
    //send cookies

    const { email, username, password } = req.body
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User is not registered");
    }

    const ispasswordvalid = await user.isPasswordCorrect(password);
    if (!ispasswordvalid) {
        throw new ApiError(404, "Password is incorrect");
    }

    const { accesstoken, refreshtoken } = await generateAccessandRefreshToken(user._id);

    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accesstoken, option)
        .cookie("refreshtoken", refreshtoken, option)
        .json(
            new ApiResponse(200, { user, loginUser, refreshtoken, accesstoken }, "User logged in successfully")
        );

})

const logoutUser = asyncHandler(async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:undefined,
            }
        },
        {
            new:true
        }
    )
    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accesstoken",option)
    .clearCookie("refreshtoken",option)
    .json(new ApiResponse(200,{},"User logged out "))
})

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingAccessToken = cookie.refreshToken || req.body.refreshToken
    if(!incomingAccessToken){
        throw new ApiError(400,"incomingAccessToken is not there");
    }

    try {
        const decodedToken = jwt.verify(incomingAccessToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(400,"Invalid refresh token")
        }
    
        if(incomingAccessToken !== user.refreshToken){
            throw new ApiError(401,"Refresh token is expired or user");
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accesstoken,newrefreshtoken} = await generateAccessandRefreshToken(user._id);
    
        reture.res
        .status(200)
        .cookie("accessToken",accesstoken)
        .cookie("refreshToken",newrefreshtoken)
        .json(
            new ApiResponse(200,{accesstoken,newrefreshtoken},"AccessToken refresed")
        )
    } catch (err) {
        throw new ApiError(401,"Invalid refresh token");
    }

})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword,confPassword} = req.body

    if(!(newPassword === confPassword)){
        throw new ApiError(400,"new password and confirm password not matching");
    }

    const user = await User.findById(req?.user._id);

    const ispasswordCorrect = await user.isPasswordCorrect(oldPassword);
    
    if(!ispasswordCorrect){
        throw new ApiError(400,"Invalid password");
    }

    user.password = newPassword;

    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password changed succesfully"));

})

const currentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(200,req.user,"Current user fetched successfully");
})

const updateUserDetail = asyncHandler(async(req,res) => {
    
    const {newfullname,newusername,newemail} = req.body

    const user = User.findByIdAndUpdate(
        req?.user._id,
        {
            $set:{
                username:newusername,
                fullname:newfullname,
                email:newemail
            }
        }

    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account updated"))

})

const updateAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avator file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading file");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .select(200)
    .json(
        new ApiResponse(200,user,"Avatar image updated succesfully")
    )
})

const updateCoverImage = asyncHandler(async(req,res) => {
    const coverLocalPath = req.file?.path

    if(!coverLocalPath){
        throw new ApiError(400,"coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading file");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .select(200)
    .json(
        new ApiResponse(200,user,"Coverimage updated succesfully")
    )
})

const getUserChannerProfile = asyncHandler( async (req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"Username is missing");
    }
    
    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"subscribers.subscriber"]},
                        then:true,
                        else:false
                    }

                }    

            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User channel fetched succesfully"
        )
    );
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    currentUser,
    updateUserDetail,
    updateAvatar,
    updateCoverImage,
    getUserChannerProfile
}













// export { 
//     registerUser
//     ,loginUser
//     ,logoutUser
//     ,refreshAccessToken
//     ,changeCurrentPassword
//     ,currentUser
//     ,updateUserDetail
//     ,updateAvarat
//     ,updateCoverImage,
//     getUserChannerProfile
//  }

