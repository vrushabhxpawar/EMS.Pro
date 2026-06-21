// src/components/StatusBadge.jsx
const map = {
  Todo:       'bg-gray-100 text-gray-600',
  InProgress: 'bg-blue-100 text-blue-700',
  Done:       'bg-green-100 text-green-700',
};
const labels = { Todo: 'To Do', InProgress: 'In Progress', Done: 'Done' };
export default function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status]}`}>
      {labels[status]}
    </span>
  );
}