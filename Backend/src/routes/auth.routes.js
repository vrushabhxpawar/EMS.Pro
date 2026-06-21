import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  getAllUsers,
  getUserById,
  deleteUser,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);

router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// No adminOnly here — deleteUser itself checks "is admin OR is self"
router.delete("/:id", protect, deleteUser);

export default router;
