import bcrypt from "bcryptjs";
import User from "../models/user.js"
export const register= async(req,res)=>{
    try{
        const {username,password}=req.body;
        const hashedPassword= await bcrypt.hash(password,10);
        const newUser=new User({
            username,
            password: hashedPassword,
            is2faActive:false,
        });
        console.log("New User: ",newUser);
        await newUser.save()
    }catch(error){
        res.status(500).json({error:"Error Registering User",message: `${error}`})
    }
}

export const login= async(req,res)=>{
    
}

export const authStatus= async(req,res)=>{
    
}

export const logout= async(req,res)=>{
    
}

export const setup2FA= async(req,res)=>{
    
}

export const verify2FA= async(req,res)=>{
    
}

export const reset2FA= async(req,res)=>{
    
}