import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { v2 as cloudinary } from "cloudinary";



import connectMongoDB from './utils/db.js';

import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import notificationRouter from './routes/notification.route.js'
import messageRoutes from './routes/message.route.js';


dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json({limit : "5mb"}));// limit shouldn't be too high to prevent DOS attack i.e denial of service from attackers  // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cors());
app.use(cookieParser());

app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);
app.use("/api/post",postRouter);
app.use("/api/notification",notificationRouter);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
    res.json({success:true,message: "Kya hal bsdk"});
})

app.listen(PORT,()=>{
    connectMongoDB();
})