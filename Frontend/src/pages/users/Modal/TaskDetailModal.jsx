import { useState } from 'react';
import api from '../../../api/axios';
import PriorityBadge from '../../../components/PriorityBadge';

import {
  X,
  Calendar,
  Flag,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

const STATUSES = ['Todo', 'InProgress', 'Done'];

export default function TaskDetailModal({
  task,
  canEditAll,
  onClose,
  onUpdated,
}) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate
      ? task.dueDate.split('T')[0]
      : '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = canEditAll
        ? form
        : { status: form.status };

      await api.put(`/task/${task._id}`, payload);

      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              Task Details
            </h2>

            <p className="text-sm text-gray-500">
              Task #{task._id.slice(-6)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PriorityBadge priority={form.priority} />

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-90px)]"
        >
          {/* Title */}
          <div>
            <Label className="mb-2 block">
              Title
            </Label>

            <Input
              value={form.title}
              disabled={!canEditAll}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                }))
              }
            />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>

            <textarea
              rows={5}
              disabled={!canEditAll}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  description: e.target.value,
                }))
              }
            />

            <div className="text-xs text-gray-400 mt-1 text-right">
              {form.description.length}/1000
            </div>
          </div>

          {/* Admin Fields */}
          {canEditAll && (
            <>
              {/* Priority */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Flag className="h-4 w-4" />
                  Priority
                </Label>

                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(
                    (priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            priority,
                          }))
                        }
                        className={`flex-1 rounded-lg border py-2 text-sm font-medium transition
                          ${
                            form.priority === priority
                              ? priority === 'High'
                                ? 'bg-red-500 text-white border-red-500'
                                : priority === 'Medium'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-green-500 text-white border-green-500'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {priority}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </Label>

                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          {/* Status */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              Status
            </Label>

            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      status,
                    }))
                  }
                  className={`rounded-lg py-2 text-sm font-medium transition
                    ${
                      form.status === status
                        ? 'bg-black text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {status === 'InProgress'
                    ? 'In Progress'
                    : status}
                </button>
              ))}
            </div>
          </div>

          {/* Read-only Info */}
          {!canEditAll && (
            <div className="rounded-xl border bg-gray-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Priority
                </span>

                <PriorityBadge
                  priority={task.priority}
                />
              </div>

              {task.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Due Date
                  </span>

                  <span>
                    {new Date(
                      task.dueDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}

              {task.assignedTo?.name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Assigned To
                  </span>

                  <span>
                    {task.assignedTo.name}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-3">
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
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
