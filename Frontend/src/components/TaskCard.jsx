import PriorityBadge from './PriorityBadge';

export default function TaskCard({ task, onClick }) {
  const initials = task.assignedTo?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-800 leading-tight">{task.title}</p>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        {task.dueDate && (
          <span className={`text-[10px] ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        <div className="ml-auto w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold flex items-center justify-center">
          {initials}
        </div>
      </div>
    </button>
  );
}