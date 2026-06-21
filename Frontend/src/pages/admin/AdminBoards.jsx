import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Users, ListChecks } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../components/ui/card';

export default function AdminBoards() {
  const [boards, setBoards] = useState([]);
  const navigate = useNavigate();

  // Backend routes live at /api/boards (plural) — this was pointing at
  // /board (singular) before, which would 404 on every request.
  const load = () => api.get('/board').then((res) => setBoards(res.data.data));

  useEffect(() => {
    load();
  }, []);

  const deleteBoard = async (id) => {
    if (!confirm('Delete this board and all its tasks?')) return;
    await api.delete(`/board/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">All Boards</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all boards in the system.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-black text-white hover:bg-gray-800 text-xs h-8 gap-1"
          onClick={() => navigate('/admin/boards/new')}
        >
          <Plus className="w-3.5 h-3.5" /> New Board
        </Button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
          No boards yet — create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => (
            <Card
              key={b._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/board/${b._id}/view`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight"
                  >
                    {b.title}
                  </CardTitle>
                  {/* stopPropagation so clicking these doesn't ALSO trigger the card's onClick navigation */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => navigate(`/admin/boards/${b._id}/edit`)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBoard(b._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {b.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {b.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pb-3">
                <p className="text-xs text-gray-400">
                  Owner:{' '}
                  <span className="text-gray-600 font-medium">
                    {b.owner?.name || '—'}
                  </span>
                </p>
              </CardContent>

              <CardFooter className="pt-3 flex items-center gap-4 text-xs text-gray-500 border-t">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{b.memberCount ?? b.members?.length ?? 0} members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>{b.taskCount ?? 0} tasks</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}