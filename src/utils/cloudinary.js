import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    
    // Upload an image
     const uploadOnCloudinary = async (localfilepath)=>{
        try {
            if(!localfilepath) return null;
            const response = await cloudinary.uploader.upload(localfilepath,{
                resource_type:'auto'
            });

            console.log("Upladed successfully",response.url);
            return response;
            
        } catch (err) {
            fs.unlinkSync(localfilepath)  //this will remore locally saved temporary file because of filure
            return null;
        }
     }
    
    console.log(uploadOnCloudinary);
    
export {uploadOnCloudinary}