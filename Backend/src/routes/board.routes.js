import express from "express";
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
} from '../controllers/board.controller.js';
import {
  createTask,
  getBoardTasks,
  getTaskById,  
} from '../controllers/task.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/", protect, adminOnly, createBoard);
router.get("/", protect, getBoards);
router.get("/:id", protect, getBoardById);
router.put("/:id", protect, adminOnly, updateBoard);
router.delete("/:id", protect, adminOnly, deleteBoard);
router.post("/:id/members", protect, adminOnly, addMember);
router.delete("/:id/members/:userId", protect, adminOnly, removeMember);

router.post("/:id/tasks", protect, createTask);
router.get("/:id/tasks", protect, getBoardTasks);

export default router;