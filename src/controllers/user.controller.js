import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler ( async (req, res) => {
    
    //GET USER DETAIL FROM FORNTEND
    const {fullname,username,email,password} = req.body
    console.log(username);
    console.log(email);

    //steps->validation - not empty
    if(fullname === ""){
        throw new ApiError(400,"Fullname is empty",)
    }
    if(email === ""){
        throw new ApiError(400,"email is empty",)
    }
    if(username === ""){
        throw new ApiError(400,"username is empty",)
    }
    if(password === ""){
        throw new ApiError(400,"Password is empty",)
    }

    //check if user alresdy exist ->from username and email
    const existUser = User.findOne({
        $or:[{username},{email}]
    })

    if(existUser) throw new ApiError(409,"User alrady exist");

    //check for coverimage and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required");
    }

    //uploade to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    //create  user object-create entry in DB

    const user = await User.create(
        {
            fullname,
            avatar:avatar.url,
            coverImage:coverImage.url || "",
            email,
            username:username.toLowerCase(),
            password
        }
    );


    //remove password and refresh token field from response
    const usercreate = await User.findById(user._id).select(
        "-password -refreshToken"
    );


    //check for user creation
    if(!usercreate){
        throw new ApiError(500,"Something went wrong while registring the user");
    }

    return res.status(201).json(
        new ApiResponse(200,usercreate,"User registered successfully")
    );

    
})

export {registerUser}



//return res.