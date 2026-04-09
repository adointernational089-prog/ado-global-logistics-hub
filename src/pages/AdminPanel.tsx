import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Shield, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  user_id: string;
  role: string;
  approved: boolean;
  email: string;
  created_at: string;
}

const AdminPanel = () => {
  const { role } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    const { data: roles } = await supabase.from('user_roles').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (roles && profiles) {
      const merged = roles.map(r => ({
        ...r,
        email: profiles.find(p => p.user_id === r.user_id)?.email || '',
      }));
      setStaff(merged);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  if (role !== 'admin') {
    return <div className="p-6"><p className="text-destructive">Access denied. Admin only.</p></div>;
  }

  const handleCreateStaff = async () => {
    if (!email || !password) return;
    setLoading(true);
    
    // Use Supabase admin to create user via edge function
    const { data, error } = await supabase.functions.invoke('create-staff', {
      body: { email, password },
    });

    if (error) {
      toast.error('Failed to create staff: ' + error.message);
    } else {
      toast.success('Staff account created for ' + email);
      setShowAdd(false);
      setEmail('');
      setPassword('');
      fetchStaff();
    }
    setLoading(false);
  };

  const handleDeleteStaff = async (userId: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (!error) {
      toast.success('Staff removed');
      fetchStaff();
    }
  };

  return (
    <div className="p-6">
      <h1 className="page-header flex items-center gap-2">
        <Shield className="h-6 w-6 text-accent" /> Admin Panel
      </h1>
      
      <div className="toolbar">
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" />Add Staff
        </Button>
      </div>

      <div className="table-container border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Role</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-t hover:bg-muted/50">
                <td className="p-3">{s.email}</td>
                <td className="p-3"><Badge variant={s.role === 'admin' ? 'default' : 'secondary'}>{s.role}</Badge></td>
                <td className="p-3"><Badge variant={s.approved ? 'default' : 'destructive'}>{s.approved ? 'Active' : 'Inactive'}</Badge></td>
                <td className="p-3">
                  {s.role !== 'admin' && (
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteStaff(s.user_id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Staff Account</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@example.com" /></div>
            <div><label className="text-sm font-semibold">Password</label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" /></div>
            <Button className="w-full" onClick={handleCreateStaff} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Users className="h-4 w-4 mr-1" />}
              Create Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
