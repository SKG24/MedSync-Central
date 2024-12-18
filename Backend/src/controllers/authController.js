import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Feedback from "../models/feedback.js";
export const register= async(req,res)=>{
    try{
        const {username,password}= req.body;
        const hashedPassword= await bcrypt.hash(password,10);
        const newUser=new User({
            username,
            password: hashedPassword,
            isMfaActive:false,
        });
        console.log("New User: ",newUser);
        await newUser.save()
        res.status(200).json({message:"User Registered Successfully"});
    }catch(error){
        res.status(500).json({error:"Error Registering User",message: `${error}`})
    }
}

export const login= async(req,res)=>{
    console.log("The authenticated user is:",req.user);
    res.status(200).json({
        message:"User logged in successful",
        username: req.user.username,
        isMfaActive:req.user.isMfaActive,
    })
}

export const authStatus= async(req,res)=>{
    if(req.user){
        res.status(200).json({
            message:"User logged in successful",
            username: req.user.username,
            isMfaActive:req.user.isMfaActive, 
        })
    }else{
        res.status(401).json({message:"Unauthorised User"})
    }
}

export const logout= async(req,res)=>{
    if(!req.user) res.status(401).json({message:"Unauthorised User"});
    req.logout((err)=>{
        if(err) res.status(400).json({message:"User Not Logged in"});
        res.status(200).json({message:"Logged out successfully"});
    })
}

export const setup2FA= async(req,res)=>{
    try {
        console.log("The req user is: ",req.user);
        const user=req.user;
        var secret = speakeasy.generateSecret();
        console.log("The secret object is: ",secret);
        user.twoFactorSecret=secret.base32;
        user.isMfaActive=true;
        await user.save();
        const url=speakeasy.otpauthURL({
            secret:secret.base32,
            label:`${req.user.username}`,
            encoding:"base32",
        });
        const qrImageUrl=await qrCode.toDataURL(url);
        res.status(200).json({
            secret:secret.base32,
            qrCode: qrImageUrl,
        })
    } catch (error) {
        res.status(500).json({error:"Error setting up 2fa",message: `${error}`})
    }
    
}

export const verify2FA= async(req,res)=>{
    const {token}=req.body;
    const user=req.user;

    const verified=speakeasy.totp.verify({           //for setting timed otp
        secret: user.twoFactorSecret,
        encoding:"base32",
        token,
    });
    if(verified){
        const jwtToken=jwt.sign(
            {username:user.username},
            process.env.JWT_SECRET,
            {expiresIn:"1hr"}
        );
        res.status(200).json({
            message:"2FA successful",
            token:jwtToken
        });
    }else{
        res.status(400).json({message:"Invalid 2FA Token"})
    }                   
}

export const reset2FA= async(req,res)=>{
    try{
        const user=req.user;
        user.twoFactorSecret="";
        user.isMfaActive=false;
        await user.save();
        res.status(200).json({message:"2FA reset successful"});
    }catch(error){
        res.status(500).json({error:"Errror reseting 2FA",message:error})
    }
}

export const feedback = async (req, res) => {
    try {
        // Deconstruct the parameters from req.body
        const {
            username,
            weight,
            height,
            bloodPressure,
            temperature,
            diagnosis,
            feedback
        } = req.body;
        
        // Create a new MedicalReport instance
        const newReport = new Feedback({
            username,
            weight,
            height,
            bloodPressure,
            temperature,
            diagnosis,
            feedback
        });

        // Save the report to the database
        const savedReport = await newReport.save();

        // Send a response
        res.status(201).json({
            success: true,
            message: "Medical report created successfully",
            data: savedReport
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating medical report",
            error: error.message
        });
    }
};