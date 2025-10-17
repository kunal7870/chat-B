import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js"


export const signup = async (req, res) => {
    const { fullname, email, password, confirmPass } = req.body;

    try {
        if (password !== confirmPass) {
            return res.status(400).json({ error: "Passwords dooo not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        //hashing the password
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullname,
            email,
            password: hashPassword,
        });

        await newUser.save();
        if (newUser) {
            createTokenAndSaveCookie(newUser._id, res);
            res.status(201).json({ message: "User created successfully", useri:{
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email
            } });
        }

    } catch (error) {
        // console.log(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const login = async(req,res) => {
    const {email,password} = req.body;
    try {
        
        const useri = await User.findOne({email});
        const isMatch = await bcrypt.compare(password,useri.password);
        if(!useri || !isMatch){
            return res.status(400).json({error: "Invalid UserName or password"})
        }
        createTokenAndSaveCookie(useri._id,res);
        res.status(200).json({message: "User login successfully", useri:{
            _id: useri._id,
            fullname: useri.fullname,
            email: useri.email
        }})
    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: "Something went wrong" });
    }
}

export const logout = async(req,res) => {
    try {
        res.clearCookie("jwt")
        res.status(200).json({message: "User logout successfully"})
    } catch (error) {
        // console.log(error)
        res.status(500).json({error: "internal server error"})
    }
};

//to get all users from database

export const allUsers = async (req,res) => {
  try {
    const loggedUser = req.useri._id;
    const allUsers = await User.find({ _id : {$ne: loggedUser}}).select("-password");
    res.status(201).json({
        allUsers
    })
  } catch (error) {
    console.log("Error in alluser controller: ", error);
  }
}

