import { Router } from "express";
import { 
    changeCurrentPassword, 
    currentUser, 
    getUserChannerProfile, 
    getUserWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAvatar, 
    updateCoverImage, 
    updateUserDetail 
} from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/change-Password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, currentUser);
router.route("/update-acount").patch(verifyJWT, updateUserDetail);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"),updateAvatar);
router.route("/update-coverImage").patch(verifyJWT, upload.single("/coverImage"),updateCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannerProfile)
router.route("history").get(verifyJWT,getUserWatchHistory)



export default router;

















// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Create upload directory if not exists
// const uploadDir = "uploads/";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${Date.now()}${ext}`);
//   },
// });

// export const router = multer({ storage });
