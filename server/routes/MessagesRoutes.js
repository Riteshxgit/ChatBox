import { Router } from "express";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { uploadFile as fileUploadMiddleware } from '../config/cloudinary.js';  // Renamed import

const messageRoutes = Router();

messageRoutes.post('/get-messages', verifyToken, getMessages);
messageRoutes.post('/upload-file', verifyToken, fileUploadMiddleware.single('file'), uploadFile);

export default messageRoutes;