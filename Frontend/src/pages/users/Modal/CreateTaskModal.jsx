import { useState } from "react";
import api from "../../../api/axios";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { X, Calendar, User, Loader2 } from "lucide-react";

export default function CreateTaskModal({
  boardId,
  members,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.assignedTo) {
      setError("Please assign to a member");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/board/${boardId}/tasks`, form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">New Task</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <Label>Title</Label>
            <Input
              className="mt-1"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>

          <div>
            <Label>Description</Label>

            <textarea
              rows={4}
              maxLength={500}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  description: e.target.value,
                }))
              }
            />

            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.description.length}/500
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block">Priority</Label>

              <div className="flex gap-2">
                {["Low", "Medium", "High"].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition
          ${
            form.priority === priority
              ? priority === "High"
                ? "bg-red-500 text-white border-red-500"
                : priority === "Medium"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-green-500 text-white border-green-500"
              : "border-gray-200 hover:bg-gray-50"
          }
        `}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>

              <Input
                type="date"
                className="mt-1"
                value={form.dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assign To
            </Label>

            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.assignedTo}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  assignedTo: e.target.value,
                }))
              }
            >
              <option value="">Select member</option>

              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.title.trim() || !form.assignedTo}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
