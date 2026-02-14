import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getFollowers, getFollowings, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/following/:username", protectRoute, getFollowings);
router.get("/followers/:username", protectRoute, getFollowers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

export default router;