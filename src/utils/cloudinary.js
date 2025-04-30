import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"



    // cloudinary.config({ 
    //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    //     api_key: process.env.CLOUDINARY_API_KEY, 
    //     api_secret: process.env.CLOUDINARY_API_SECRET 
    // });

    cloudinary.config({ 
        cloud_name: 'dfqeev36z', 
        api_key: 648597441622775, 
        api_secret: 'HgQ_bP1iFDyRwb0S7irVvE80epE'
    });


    // Upload an image
     const uploadOnCloudinary = async (localfilepath)=>{
         try {
            if(!localfilepath){

                 return null;
            } 
            
            console.log("above response section")
            const response = await cloudinary.uploader.upload(localfilepath ,{
                resource_type: "auto"
            });

            //console.log(response)


            //console.log("Upladed successfully",response);
            //fs.unlinkSync(localfilepath)
            return response;
            
        } catch (err) {

            //fs.unlinkSync(localfilepath)  //this will remore locally saved temporary file because of filure
            return null;
        }
     }
    
    console.log(uploadOnCloudinary);
    
export {uploadOnCloudinary}


