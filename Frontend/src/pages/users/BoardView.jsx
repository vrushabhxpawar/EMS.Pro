import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TaskCard from '../../components/TaskCard';
import CreateTaskModal from './modal/CreateTaskModal';
import TaskDetailModal from './modal/TaskDetailModal';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';

const COLUMNS = [
  { key: 'Todo',       label: 'To Do',       dot: 'bg-gray-400' },
  { key: 'InProgress', label: 'In Progress',  dot: 'bg-blue-500' },
  { key: 'Done',       label: 'Done',         dot: 'bg-green-500' },
];

export default function BoardView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadTasks = () =>
    api.get(`/board/${id}/tasks`).then(res => setTasks(res.data.data));

  useEffect(() => {
    api.get(`/board/${id}`).then(res => setBoard(res.data.data));
    loadTasks();
  }, [id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{board?.title || 'Board'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{board?.description}</p>
        </div>
        <Button
          size="sm"
          className="bg-black text-white hover:bg-gray-800 text-xs h-8 gap-1"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="bg-gray-100 rounded-xl p-3">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-medium text-gray-700">{col.label}</span>
                <span className="ml-auto text-xs text-gray-400 bg-white rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400">No tasks here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <CreateTaskModal
          boardId={id}
          members={board?.members || []}
          onClose={() => setShowCreate(false)}
          onCreated={loadTasks}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          canEditAll={user?.role === 'admin'}
          onClose={() => setSelectedTask(null)}
          onUpdated={loadTasks}
        />
      )}
    </div>
  );
}