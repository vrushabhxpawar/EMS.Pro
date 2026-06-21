import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import TaskDetailModal from './modal/TaskDetailModal';
import { SlidersHorizontal } from 'lucide-react';

const STATUSES   = ['All', 'Todo', 'InProgress', 'Done'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];

export default function MyTasks() {
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const loadTasks = () => {
    const params = new URLSearchParams();
    if (statusFilter   !== 'All') params.set('status',   statusFilter);
    if (priorityFilter !== 'All') params.set('priority', priorityFilter);

    api.get(`/task/my-tasks`)
      .then(res => setTasks(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTasks(); }, [statusFilter, priorityFilter]);

  const grouped = {
    Todo:       tasks.filter(t => t.status === 'Todo'),
    InProgress: tasks.filter(t => t.status === 'InProgress'),
    Done:       tasks.filter(t => t.status === 'Done'),
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">All tasks assigned to you.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s === 'InProgress' ? 'In Progress' : s}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3">
        {[
          { label: 'To Do',       count: grouped.Todo.length,       color: 'bg-gray-100 text-gray-600' },
          { label: 'In Progress', count: grouped.InProgress.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Done',        count: grouped.Done.length,       color: 'bg-green-50 text-green-600' },
        ].map(pill => (
          <div key={pill.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${pill.color}`}>
            {pill.label}
            <span className="font-bold">{pill.count}</span>
          </div>
        ))}
      </div>

      {/* Task table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">No tasks found.</p>
            <p className="text-gray-300 text-xs mt-1">Try adjusting the filters above.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-xs text-gray-400">
                <th className="text-left px-5 py-3 font-medium">Task</th>
                <th className="text-left px-5 py-3 font-medium">Board</th>
                <th className="text-left px-5 py-3 font-medium">Priority</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Due Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const overdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== 'Done';

                return (
                  <tr
                    key={task._id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className={`font-medium ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3 text-gray-500">
                      {task.board?.title || '—'}
                    </td>

                    <td className="px-5 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td className="px-5 py-3">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="px-5 py-3">
                      {task.dueDate ? (
                        <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                          {overdue && '⚠ '}
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-xs text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          canEditAll={false}        // user can only change status
          onClose={() => setSelectedTask(null)}
          onUpdated={() => {
            setSelectedTask(null);
            loadTasks();
          }}
        />
      )}
    </div>
  );
}