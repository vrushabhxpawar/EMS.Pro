import express from "express";
import {
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasksAdmin,
  getMyTasks,
} from '../controllers/task.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/my-tasks', protect, getMyTasks);

router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);



// Admin route to get all tasks
router.get("/", protect, adminOnly, getAllTasksAdmin);

export default router;