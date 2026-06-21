// src/pages/user/UserBoards.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Layout, Users, CheckSquare } from 'lucide-react';

export default function UserBoards() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/board')
      .then(res => {
        const data = res.data.data ?? res.data;

        setBoards(data);
      })
      .catch(err => console.error('Failed to fetch boards:', err))
      .finally(() => setLoading(false));
  }, [user]);

  // ── Loading skeleton ───────────────────────────────────
  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">My Boards</h1>
        <p className="text-sm text-gray-500 mt-1">
          Boards you are a member of.
        </p>
      </div>

      {/* Empty state */}
      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <Layout className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No boards yet</p>
          <p className="text-xs text-gray-400 mt-1">
            You haven't been added to any board yet.
          </p>
          <p className="text-xs text-gray-400">
            Contact your admin to get access.
          </p>
        </div>
      ) : (

        /* Board cards grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map(board => {
            const memberCount = board.members?.length ?? 0;
            const taskCount   = board.taskCount ?? 0;

            // Get initials of members for avatars (max 3)
            const memberAvatars = (board.members ?? []).slice(0, 3);

            return (
              <button
                key={board._id}
                onClick={() => navigate(`/boards/${board._id}`)}
                className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Layout className="w-5 h-5 text-gray-500" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Title & description */}
                <p className="font-semibold text-gray-800 text-sm leading-tight">
                  {board.title}
                </p>
                {board.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {board.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">

                  {/* Member avatars */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {memberAvatars.map((m, i) => {
                        const name     = m.name ?? 'U';
                        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                        return (
                          <div
                            key={m._id ?? i}
                            title={name}
                            className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white text-[9px] font-semibold text-gray-600 flex items-center justify-center"
                          >
                            {initials}
                          </div>
                        );
                      })}
                      {memberCount > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white text-[9px] font-semibold text-gray-500 flex items-center justify-center">
                          +{memberCount - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {memberCount}
                    </span>
                  </div>

                  {/* Task count */}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    {taskCount} tasks
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}