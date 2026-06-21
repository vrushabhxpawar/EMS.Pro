import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["Todo", "InProgress", "Done"],
      default: "Todo",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: [true, "Task must belong to a board"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must be assigned to a user"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // set automatically from req.user in the controller
    },
  },
  { timestamps: true } // gives createdAt and updatedAt
);

// Compound indexes (Section 6.3 bonus optimisation) — cheap to add now,
// speeds up the board-scoped queries used by GET /boards/:id/tasks
taskSchema.index({ board: 1, status: 1 });
taskSchema.index({ board: 1, assignedTo: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;