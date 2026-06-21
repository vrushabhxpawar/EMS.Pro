import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';


export default function BoardForm() {
  const { id } = useParams();   // undefined = create, defined = edit
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', members: [] });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth').then(res => setAllUsers(res.data.data));
    if (id) {
      api.get(`/board/${id}`).then(res => {
        const b = res.data.data;
        setForm({
          title: b.title, description: b.description || '',
          members: b.members.map(m => m._id),
        });
      });
    }
  }, [id]);

  const toggleMember = (userId) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter(m => m !== userId)
        : [...f.members, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      if (id) await api.put(`/board/${id}`, form);
      else    await api.post('/board', form);
      navigate('/admin/boards');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{id ? 'Edit Board' : 'New Board'}</h1>
        <p className="text-sm text-gray-500 mt-1">{id ? 'Update board details and members.' : 'Create a new board and add members.'}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Board Title</Label>
            <Input className="mt-1" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <Label>Description <span className="text-gray-400 font-normal">(optional)</span></Label>
            <textarea rows={3}
              className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <Label>Members</Label>
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y">
              {allUsers.map(u => (
                <label key={u._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.members.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                    className="accent-black"
                  />
                  <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold flex items-center justify-center">
                    {u.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{u.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{u.email}</span>
                </label>
              ))}
            </div>
            {form.members.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">{form.members.length} member(s) selected</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/admin/boards')}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800" disabled={loading}>
              {loading ? 'Saving…' : id ? 'Update Board' : 'Create Board'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}