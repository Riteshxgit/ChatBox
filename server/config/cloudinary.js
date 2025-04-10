import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage instances for different use cases
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads/profile',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
  },
});

const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads/files',
    resource_type: 'auto', // 👈 Critical change
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `${timestamp}-${file.originalname}`; // Keep full filename
    }
  }
});

// Create multer instances
export const uploadProfilePic = multer({ storage: profileStorage });
export const uploadFile = multer({ storage: fileStorage });
export { cloudinary };