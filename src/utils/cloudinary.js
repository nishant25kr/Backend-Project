import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

   
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


