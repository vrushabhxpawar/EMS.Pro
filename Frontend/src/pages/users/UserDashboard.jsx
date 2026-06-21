// src/pages/user/UserDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import { CheckSquare, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/board"), api.get("/task/my-tasks")]).then(
      ([boardsRes, tasksRes]) => {
        setBoards(boardsRes.data.data);
        setTasks(tasksRes.data.data); // already filtered to current user
        setLoading(false);
      },
    );
  }, []);

  // eslint-disable-next-line no-unused-vars
  const todo = tasks.filter((t) => t.status === "Todo");
  const inProgress = tasks.filter((t) => t.status === "InProgress");
  const done = tasks.filter((t) => t.status === "Done");

  // Today's tasks — due today or overdue and not done
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgent = tasks.filter((t) => {
    if (t.status === "Done") return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) <= today;
  });

  if (loading)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">
          Good morning, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's your task overview for today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Total</span>
            <CheckSquare className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-3xl font-bold">{tasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">My Tasks</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Active</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {inProgress.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">In Progress</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Done</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600">{done.length}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* My Tasks — flat list */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-1"></h2>
          <p className="text-xs text-gray-400 mb-4">
            Manage your assigned work and track progress.
          </p>

          <div className="space-y-2">
            {tasks.length === 0 && (
              <p className="text-sm text-gray-400 py-6 text-center">
                No tasks assigned yet.
              </p>
            )}
            {tasks.slice(0, 6).map((task) => {
              const overdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== "Done";
              return (
                <div
                  key={task._id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      task.status === "Done"
                        ? "bg-green-500"
                        : task.status === "InProgress"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${task.status === "Done" ? "line-through text-gray-400" : "text-gray-800"}`}
                    >
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p
                        className={`text-xs mt-0.5 ${overdue ? "text-red-500" : "text-gray-400"}`}
                      >
                        {overdue ? "Overdue · " : "Due "}
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-4">
          {/* Urgent / due today */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold mb-1">Focus</h2>
            <p className="text-xs text-gray-400 mb-3">Your next best action.</p>

            {urgent.length === 0 ? (
              <p className="text-sm text-gray-400">You're all caught up 🎉</p>
            ) : (
              <div className="space-y-2">
                {urgent.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {task.title}
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      {new Date(task.dueDate) < today ? "Overdue" : "Due today"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Boards */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold mb-1">My Boards</h2>
            <p className="text-xs text-gray-400 mb-3">Jump into a board.</p>

            <div className="space-y-2">
              {boards.length === 0 && (
                <p className="text-sm text-gray-400">No boards yet.</p>
              )}
              {boards.map((b) => (
                <button
                  key={b._id}
                  onClick={() => navigate(`/boards/${b._id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {b.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.members?.length ?? 0} members
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
