import { Router } from 'express';
import { signup, login, getUserInfo, updateProfile, updateProfileImage, removeProfileImage, logout } from '../controllers/AuthController.js'
import { verifyToken } from '../middlewares/AuthMiddleware.js';
import { uploadProfilePic } from '../config/cloudinary.js';  // Changed from 'upload'

const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.get('/user-info', verifyToken, getUserInfo);
authRouter.post('/update-profile', verifyToken, updateProfile);
authRouter.post('/update-profile-image', verifyToken, uploadProfilePic.single('profile-image'), updateProfileImage);
authRouter.delete('/remove-profile-image', verifyToken, removeProfileImage);
authRouter.post('/logout', logout);

export default authRouter;