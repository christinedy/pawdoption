import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";

const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}


//user login
const loginUser = async (req,res) => {
    try {
        
        const {email,password} = req.body;

        const user = await userModel.findOne({email});

        if (!user) {
            return res.json({success:false, message:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            
            const token = createToken(user._id)
            res.json({success:true,token})
        }
        else {
            res.json({success:false, message: 'Invalid credentials'})
        }

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }
}

//user register
const registerUser =  async (req,res) => {
    try {
        console.log('Received req.body:', req.body);
        
        const { fullName, email, address, contactNo, password, role } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({success:false, message:"User already exists"})
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Please enter a valid email"})
            
        }
        if (password.length < 8) {
            return res.json({success:false, message:"Please enter a strong password"})
            
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new userModel({
            fullName,
            email,
            address,
            contactNo,
            password:hashedPassword,
            role
        })

        const user = await newUser.save() 

        const token = createToken(user._id)

        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})    
    }
}

// route for admin login
const adminLogin = async (req,res) => {
    
}

// get users
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password'); //exxclude password for security
        res.json({success: true, users})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// get user by id
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select('-password'); 
        
        if (!user) {
            return res.json({success: false, message: "User not found"})
        }
        
        res.json({success: true, user})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// update user by id
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, address, contactNo, password, role } = req.body;


        const user = await userModel.findById(id);
        if (!user) {
            return res.json({success: false, message: "User not found"})
        }


        if (email && email !== user.email) {
            const emailExists = await userModel.findOne({email});
            if (emailExists) {
                return res.json({success: false, message: "Email already in use"})
            }
            

            if (!validator.isEmail(email)) {
                return res.json({success: false, message: "Please enter a valid email"})
            }
        }


        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (address) updateData.address = address;
        if (contactNo) updateData.contactNo = contactNo;
        if (role) updateData.role = role;


        if (password) {
            if (password.length < 8) {
                return res.json({success: false, message: "Password must be at least 8 characters"})
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({success: true, message: "User updated successfully", user: updatedUser})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

//delete user by id
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await userModel.findByIdAndDelete(id);
        
        if (!user) {
            return res.json({success: false, message: "User not found"})
        }
        
        res.json({success: true, message: "User deleted successfully"})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}


export { loginUser, registerUser, adminLogin, getAllUsers, getUserById, updateUser, deleteUser}