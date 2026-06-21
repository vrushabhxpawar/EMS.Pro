import Board from "../models/board.model.js";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";

// POST /api/boards
// Admin only (enforced by middleware). Creates a board owned by the admin.
export const createBoard = async (req, res) => {
  const { title, description, members } = req.body;
  const errors = [];

  if (!title || !title.trim()) errors.push("Title is required");
  if (title && title.length > 100)
    errors.push("Title cannot exceed 100 characters");

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  try {
    if (members && members.length > 0) {
      const validCount = await User.countDocuments({ _id: { $in: members } });
      if (validCount !== members.length) {
        return res.status(400).json({
          success: false,
          message: "One or more member IDs are invalid",
          errors: [],
        });
      }
    }

    const board = await Board.create({
      title,
      description,
      owner: req.user._id,
      members: members || [],
    });

    return res.status(201).json({ success: true, data: board });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the board",
      errors: [err.message],
    });
  }
};

// GET /api/boards
// Auth required. Admin sees every board, a regular User sees only boards
// they're a member of. Each board includes memberCount/taskCount for the
// Dashboard cards described in section 5.1.
export const getBoards = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { members: req.user._id };

    const boards = await Board.find(filter)
      .populate("owner", "name email")
      .lean();

    const boardsWithCounts = await Promise.all(
      boards.map(async (board) => {
        const taskCount = await Task.countDocuments({ board: board._id });
        return {
          ...board,
          memberCount: board.members.length,
          taskCount,
        };
      })
    );

    return res.status(200).json({ success: true, data: boardsWithCounts });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching boards",
      errors: [err.message],
    });
  }
};

// GET /api/boards/:id
// Auth + Member. Admin can view any board; a regular User only if they're
// in the members list.
export const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found", errors: [] });
    }

    const isAdmin = req.user.role === "admin";
    const isMember = board.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this board",
        errors: [],
      });
    }

    return res.status(200).json({ success: true, data: board });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the board",
      errors: [err.message],
    });
  }
};

// PUT /api/boards/:id
// Admin only. Updates title, description, and/or fully replaces members.
// For single add/remove operations, prefer the dedicated member routes below.
export const updateBoard = async (req, res) => {
  const { title, description, members } = req.body;

  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found", errors: [] });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: ["Title cannot be empty"],
        });
      }
      board.title = title;
    }

    if (description !== undefined) board.description = description;

    if (members !== undefined) {
      const validCount = await User.countDocuments({ _id: { $in: members } });
      if (validCount !== members.length) {
        return res.status(400).json({
          success: false,
          message: "One or more member IDs are invalid",
          errors: [],
        });
      }
      board.members = members;
    }

    await board.save();

    return res.status(200).json({ success: true, data: board });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the board",
      errors: [err.message],
    });
  }
};

// DELETE /api/boards/:id
// Admin only. Spec requires the board's tasks to be deleted along with it.
export const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found", errors: [] });
    }

    await Task.deleteMany({ board: board._id });
    await board.deleteOne();

    return res.status(200).json({
      success: true,
      data: { message: "Board and its tasks deleted successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the board",
      errors: [err.message],
    });
  }
};

// POST /api/boards/:id/members
// Admin only. Body: { userId }
export const addMember = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["userId is required"],
    });
  }

  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found", errors: [] });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", errors: [] });
    }

    const alreadyMember = board.members.some((m) => m.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this board",
        errors: [],
      });
    }

    board.members.push(userId);
    await board.save();

    return res.status(200).json({ success: true, data: board });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while adding the member",
      errors: [err.message],
    });
  }
};

// DELETE /api/boards/:id/members/:userId
// Admin only.
export const removeMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found", errors: [] });
    }

    const { userId } = req.params;
    const wasMember = board.members.some((m) => m.toString() === userId);

    if (!wasMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this board",
        errors: [],
      });
    }

    board.members = board.members.filter((m) => m.toString() !== userId);
    await board.save();

    return res.status(200).json({ success: true, data: board });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while removing the member",
      errors: [err.message],
    });
  }
};