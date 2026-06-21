// src/components/PriorityBadge.jsx
const map = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-green-100 text-green-700',
};
export default function PriorityBadge({ priority }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[priority]}`}>
      {priority}
    </span>
  );
}

