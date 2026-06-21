import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Users, CheckSquare, Clock, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import '../../components/PriorityBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, tasks: 0, inProgress: 0, done: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/auth'),
      api.get('/task'),
    ]).then(([usersRes, tasksRes]) => {
      const allTasks = tasksRes.data.data;
      setStats({
        users: usersRes.data.data.length,
        tasks: allTasks.length,
        inProgress: allTasks.filter(t => t.status === 'InProgress').length,
        done: allTasks.filter(t => t.status === 'Done').length,
      });
      setRecentTasks(allTasks.slice(0, 5));
      setUsers(usersRes.data.data.slice(0, 5));
    });
  }, []);

  const statCards = [
    { label: 'Total Employees', value: stats.users,      icon: Users },
    { label: 'Total Tasks',     value: stats.tasks,      icon: CheckSquare },
    { label: 'In Progress',     value: stats.inProgress, icon: Clock },
    { label: 'Completed',       value: stats.done,       icon: CheckCircle },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of employees, tasks, and progress.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <Icon className="w-5 h-5 text-gray-400 mb-3" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Tasks */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sm">Recent Tasks</h2>
              <p className="text-xs text-gray-400">Latest assignments and delivery status.</p>
            </div>
            <Link to="/admin/boards" className="text-xs text-gray-500 hover:text-black">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left pb-2 font-medium">Task Name</th>
                <th className="text-left pb-2 font-medium">Assigned To</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map(task => (
                <tr key={task._id} className="border-b last:border-0">
                  <td className="py-2.5 text-gray-800">{task.title}</td>
                  <td className="py-2.5 text-gray-500">{task.assignedTo?.name}</td>
                  <td className="py-2.5"><StatusBadge status={task.status} /></td>
                  <td className="py-2.5 text-gray-500 text-xs">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Employee Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-sm">Employee Overview</h2>
            <p className="text-xs text-gray-400">Team members and current workload.</p>
          </div>
          <div className="space-y-3">
            {users.map(u => {
              const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
              return (
                <div key={u._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{u.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{u.role === 'admin' ? 'Admin' : 'Member'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}