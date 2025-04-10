import bcrypt from 'bcryptjs';
import User from '../models/UserModel.js'
import jwt from 'jsonwebtoken'
import UserModel from '../models/UserModel.js';
import { cloudinary } from '../config/cloudinary.js';

const maxAge = 3*24*60*60*1000;


const createToken = (email, id) => {
    return jwt.sign({email, id}, process.env.JWT_KEY, {expiresIn: maxAge});
}

export const signup = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        
        // 1. check for email and password given or not
        console.log(1)
        if(!email || !password) {
            return res.status(400).json({msg: 'Please provide email and password'});
        }
        
        // 2. create a new user
        console.log(2)
        const user = await User.create({email, password});
        console.log('user: ', user)

        // 3. set cookie
        console.log(3)
        res.cookie('jwt', createToken(email, user._id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        
        // 4. return user data
        console.log(4)
        res.status(201).json({msg: 'User signed up successfully', user});
        
    }catch (err) {
        console.log(err);
        res.status(500).json({msg: 'internal server error'});
    }
}

export const login = async (req, res) => {
    try{
        console.log('login controller is called');
        
        const {email, password} = req.body;

        // 1. check for email and password given or not
        console.log(1);
        if(!email || !password) {
            return res.status(400).json({msg: 'Please provide email and password'});
        }
        
        // 2. find user
        console.log(2);
        const user = await User.findOne({email});
        
        // if no user found
        console.log(3);
        if(!user) {
            return res.status(404).json({msg: 'No user found, Please Signup'});
        }

        // if wrong password
        console.log(4);
        console.log('user.password: ', user.password);
        const correctPassword = await bcrypt.compare(password, user.password);

        if(!correctPassword) {            
            return res.status(400).json({msg: 'invalid Password'});
        }
        
        
        // 3. login by setting up cookie
        console.log(5);
        res.cookie('jwt', createToken(email, user._id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });

        // 4. return user data        
        res.status(200).json({msg: 'user logged in successfully', user});

    }catch (err) {
        console.log(err);
        res.status(500).json({msg: 'internal server error'});
    }
}

export const getUserInfo = async (req, res) => {
    try{
        const token = req.cookies.jwt; // get token from cookie
        const data = jwt.verify(token, process.env.JWT_KEY); // decrypt token to get data
        const user =  await UserModel.findOne({email: data.email}); // get user
        if(!user) return res.status(401).json({msg: 'User not found'}); // if user not found, return unauthorized
        res.status(200).json({msg: 'this is user info', user}); // return the user
    }catch (err) {
        console.log(err);
        res.status(500).json({msg: 'internal server error'});
    }
}

export const updateProfile = async (req, res) => {
    try{
        //get the req data
        const { firstName, lastName, color} = req.body;
        if(!firstName || !lastName) return res.status(500).json({msg: 'firstname, lastname and color is required'});

        // get user form mongoDB and update profile
        const token = req.cookies.jwt;
        const userData = jwt.verify(token, process.env.JWT_KEY);
        const user = await UserModel.findByIdAndUpdate(userData.id , {firstName, lastName, color, profileSetup: true}, {new: true, runValidators: true});
        
        // check for uses existance
        if(!user) return res.status(401).json({msg: 'User not found', user}); 
        
        // send response
        res.status(200).json({msg: 'user profile updated successfully', user});
    }catch (err) {
        console.log(err);
        res.status(500).json({msg: 'internal server error'});
    }
}

export const updateProfileImage = async (req, res) => {
    try{
        console.log('updateProfileImage() called');
        console.log('req.file: '+ JSON.stringify(req.file));
        
        if(!req.file) {
            return res.status(400).json({msg: 'File is required'});
        }
        
        //find user and update profile.image
        const token = req.cookies.jwt;
        const userData = jwt.verify(token, process.env.JWT_KEY);
        const user = await UserModel.findByIdAndUpdate(userData.id , {image: req.file.path}, {new: true, runValidators: true});
        
        // check for users existance
        if(!user) return res.status(401).json({msg: 'User not found', user});

        // send response
        res.status(200).json({msg: 'user profile updated successfully', user});
    } catch (err) {
        console.log(err);
        res.status(500).json({msg: 'internal server error'});
    }
}

export const removeProfileImage = async (req, res) => {
    try {
        // Get user from token

        console.log('removeProfileImage called');
        
        const token = req.cookies.jwt;
        const userData = jwt.verify(token, process.env.JWT_KEY);
        const user = await UserModel.findById(userData.id);

        if (!user || !user.image) {
            return res.status(404).json({ msg: 'No image found' });
        }

        // Extract public ID from image URL
        const publicId = user.image.split('/').slice(-2).join('/').split('.')[0];

        // Remove image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Update user profile to remove image
        user.image = null;
        await user.save();

        res.status(200).json({ msg: 'Profile image removed successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', {maxAge: 1, secure: true, sameSite: 'none'});
        res.status(200).json({ msg: 'Logout Successful'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
};