import User from './../models/user.model.js';
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from './../utils/generateToken.js';

export const getMe = async(req, res)=>{
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");

        if(!user){
            res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const signup = async(req, res)=>{
    try {
        const { fullName, username, email, password } = req.body;

        if(!fullName || !username || !email || !password){
            res.status(400).json({ error: "Enter all the fields." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

        const existingMail = await User.findOne({email});

        if(existingMail){
            return res.status(400).json({ error: "Email is already taken" });
        }
        const existingUsername = await User.findOne({username});

        if(existingUsername){
            return res.status(400).json({ error: "Username is already taken" });
        }

        if(password.length < 6){
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
			username,
			email,
			password: hashedPassword,
        });

        if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export const login = async(req, res)=>{
    try {
        const { username, password } = req.body;

        if(!username || !password){
            res.status(400).json({ error: "Enter all the fields." });
        }

        const user = await User.findOne({username});

        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

        generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const logout = (req,res)=>{
    try {
        res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}