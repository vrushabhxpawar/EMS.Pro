import Task from "../models/task.model.js";
import Board from "../models/board.model.js";
import User from "../models/user.model.js";

// POST /api/boards/:id/tasks
// Auth + Member. Admin can create on ANY board and assign to ANY user.
// A regular User must be a member of the board, and can only assign the
// task to themselves or another member of that same board.
export const createTask = async (req, res) => {
  const boardId = req.params.id;
  const { title, description, priority, dueDate, assignedTo } = req.body;
  const errors = [];

  if (!title || !title.trim()) errors.push("Title is required");
  if (title && title.length > 150)
    errors.push("Title cannot exceed 150 characters");
  if (description && description.length > 1000)
    errors.push("Description cannot exceed 1000 characters");
  if (priority && !["Low", "Medium", "High"].includes(priority))
    errors.push("Priority must be Low, Medium, or High");
  if (!assignedTo) errors.push("assignedTo is required");

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found", errors: [] });
    }

    const isAdmin = req.user.role === "admin";
    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this board",
        errors: [],
      });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
        errors: [],
      });
    }

    // Admin can assign to anyone. A regular User can only assign to
    // themselves or another member of the same board.
    if (!isAdmin) {
      const assigneeIsMember = board.members.some(
        (m) => m.toString() === assignedTo
      );
      if (!assigneeIsMember) {
        return res.status(403).json({
          success: false,
          message: "You can only assign tasks to members of this board",
          errors: [],
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      board: boardId,
      assignedTo,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the task",
      errors: [err.message],
    });
  }
};

// GET /api/boards/:id/tasks
// Auth + Member. Supports ?status=&priority=&assignedTo= filters, plus
// optional ?page=&limit= pagination (bonus section 6.3 — omit them and
// the endpoint just returns everything for that board).
export const getBoardTasks = async (req, res) => {
  const boardId = req.params.id;
  const { status, priority, assignedTo, page, limit } = req.query;

  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found", errors: [] });
    }

    const isAdmin = req.user.role === "admin";
    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this board",
        errors: [],
      });
    }

    const filter = { board: boardId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0; // 0 = no pagination applied

    let query = Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    if (limitNum > 0) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const tasks = await query;
    const totalCount = await Task.countDocuments(filter);
    const totalPages = limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1;

    return res.status(200).json({
      success: true,
      data: tasks,
      totalCount,
      totalPages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching tasks",
      errors: [err.message],
    });
  }
};

// GET /api/tasks/:id
// Auth + Member (member of the task's board, or Admin).
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("board", "title members");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found", errors: [] });
    }

    const isAdmin = req.user.role === "admin";
    const isMember = task.board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this task's board",
        errors: [],
      });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the task",
      errors: [err.message],
    });
  }
};

// PUT /api/tasks/:id
// Auth. Admin can edit any field on any task. A regular User can ONLY
// change status, and only on a task assigned to them.
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found", errors: [] });
    }

    const isAdmin = req.user.role === "admin";

    if (isAdmin) {
      const { title, description, status, priority, dueDate, assignedTo } =
        req.body;
      const errors = [];

      if (title !== undefined && !title.trim())
        errors.push("Title cannot be empty");
      if (
        status !== undefined &&
        !["Todo", "InProgress", "Done"].includes(status)
      )
        errors.push("Invalid status value");
      if (
        priority !== undefined &&
        !["Low", "Medium", "High"].includes(priority)
      )
        errors.push("Invalid priority value");

      if (errors.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Validation failed", errors });
      }

      if (assignedTo !== undefined) {
        const assignee = await User.findById(assignedTo);
        if (!assignee) {
          return res.status(404).json({
            success: false,
            message: "Assigned user not found",
            errors: [],
          });
        }
        task.assignedTo = assignedTo;
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    } else {
      // Regular User: must be the assignee, and can only touch `status`.
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update tasks assigned to you",
          errors: [],
        });
      }

      const { status } = req.body;

      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: ["status is required"],
        });
      }
      if (!["Todo", "InProgress", "Done"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: ["Invalid status value"],
        });
      }

      task.status = status;
      // Any other fields sent in req.body (title, priority, assignedTo...)
      // are silently ignored here — a non-admin physically can't touch them.
    }

    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the task",
      errors: [err.message],
    });
  }
};

// DELETE /api/tasks/:id
// Admin only.
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found", errors: [] });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      data: { message: "Task deleted successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the task",
      errors: [err.message],
    });
  }
};

// GET /api/admin/tasks
// Admin only. Same filters as the board-scoped list, but across every board.
export const getAllTasksAdmin = async (req, res) => {
  const { status, priority, assignedTo, board, page, limit } = req.query;

  try {
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (board) filter.board = board;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0;

    let query = Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("board", "title")
      .sort({ createdAt: -1 });

    if (limitNum > 0) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const tasks = await query;
    const totalCount = await Task.countDocuments(filter);
    const totalPages = limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1;

    return res.status(200).json({
      success: true,
      data: tasks,
      totalCount,
      totalPages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching tasks",
      errors: [err.message],
    });
  }
};

// controllers/taskController.js

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('board', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};