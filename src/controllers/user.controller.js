import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken();
        const refreshtoken = user.generateRefreshToken();

        user.refreshtoken = refreshtoken;
        user.save({ validateBeforeSave: false });

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
    console.log(email)
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
    .clearCookies("accesstoken",option)
    .clearCookies("refreshtoken",option)
    .json(new ApiResponse(200,{},"User logged out "))
})

export { registerUser, loginUser ,logoutUser }



