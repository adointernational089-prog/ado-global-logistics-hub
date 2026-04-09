import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Download, Upload, Eye, Trash2, Edit, FileSpreadsheet } from 'lucide-react';
import type { RemainingCtnItem } from '@/types';

const genId = () => crypto.randomUUID();

const RemainingCtns = () => {
  const { remainingCtns, addRemainingCtn, updateRemainingCtn, deleteRemainingCtn, loadingList } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const autoItems = useMemo(() => {
    return loadingList.filter(l => {
      const remaining = l.totalCtns - l.tatopani.loadedCtn - l.kerung.loadedCtn;
      return remaining > 0;
    }).map(l => ({
      id: l.id,
      consignmentDate: l.date,
      consignmentNo: l.consignmentNo,
      marka: l.marka,
      totalCtn: l.totalCtns,
      cbm: l.cbm,
      gw: l.gw,
      destination: l.destination,
      remainingCtn: l.totalCtns - l.tatopani.loadedCtn - l.kerung.loadedCtn,
      remainingCtnLocation: 'Nylam',
      client: l.client,
    }));
  }, [loadingList]);

  const allItems = [...autoItems, ...remainingCtns];
  const filtered = useMemo(() => allItems.filter(i =>
    Object.values(i).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  ), [allItems, search]);

  const [form, setForm] = useState<Omit<RemainingCtnItem, 'id'>>({
    consignmentDate: '', consignmentNo: '', marka: '', totalCtn: 0, cbm: 0, gw: 0,
    destination: '', remainingCtn: 0, remainingCtnLocation: '', client: '',
  });

  const resetForm = () => setForm({ consignmentDate: '', consignmentNo: '', marka: '', totalCtn: 0, cbm: 0, gw: 0, destination: '', remainingCtn: 0, remainingCtnLocation: '', client: '' });

  const handleSave = () => {
    if (editId) { updateRemainingCtn(editId, form); setEditId(null); }
    else { addRemainingCtn({ id: genId(), ...form }); }
    setShowAdd(false); resetForm();
  };

  const handleExport = () => {
    const headers = ['Date', 'Consignment No', 'MARKA', 'Total CTN', 'CBM', 'GW', 'Destination', 'Remaining CTN', 'Location', 'Client'];
    const rows = allItems.map(i => [i.consignmentDate, i.consignmentNo, i.marka, i.totalCtn, i.cbm, i.gw, i.destination, i.remainingCtn, i.remainingCtnLocation, i.client].join('\t'));
    const blob = new Blob([[headers.join('\t'), ...rows].join('\n')], { type: 'text/tab-separated-values' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'remaining-ctns.tsv'; a.click();
  };

  return (
    <div className="p-6">
      <h1 className="page-header">Remaining CTNs</h1>
      <div className="toolbar">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { resetForm(); setEditId(null); setShowAdd(true); }}><Plus className="h-4 w-4 mr-1" />Add</Button>
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export</Button>
      </div>

      <div className="table-container border rounded-lg">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted sticky top-0 z-20">
            <tr>
              <th className="p-3 text-left font-semibold">Date</th>
              <th className="p-3 text-left font-semibold">Consignment No.</th>
              <th className="p-3 text-left font-semibold">MARKA</th>
              <th className="p-3 text-left font-semibold highlight-cell">Total CTN</th>
              <th className="p-3 text-left font-semibold">CBM</th>
              <th className="p-3 text-left font-semibold">GW</th>
              <th className="p-3 text-left font-semibold">Destination</th>
              <th className="p-3 text-left font-semibold highlight-cell">Remaining CTN</th>
              <th className="p-3 text-left font-semibold">Location</th>
              <th className="p-3 text-left font-semibold">Client</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t hover:bg-muted/50">
                <td className="p-3">{item.consignmentDate}</td>
                <td className="p-3 font-medium">{item.consignmentNo}</td>
                <td className="p-3">{item.marka}</td>
                <td className="p-3 highlight-cell">{item.totalCtn}</td>
                <td className="p-3">{item.cbm}</td>
                <td className="p-3">{item.gw}</td>
                <td className="p-3">{item.destination}</td>
                <td className="p-3 highlight-cell">{item.remainingCtn}</td>
                <td className="p-3">{item.remainingCtnLocation}</td>
                <td className="p-3">{item.client}</td>
                <td className="p-3 flex gap-1">
                  <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { const { id, ...rest } = item; setForm(rest); setEditId(id); setShowAdd(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteRemainingCtn(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">No remaining CTNs found</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Remaining CTN</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold">Date</label><Input type="date" value={form.consignmentDate} onChange={e => setForm({ ...form, consignmentDate: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Consignment No.</label><Input value={form.consignmentNo} onChange={e => setForm({ ...form, consignmentNo: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">MARKA</label><Input value={form.marka} onChange={e => setForm({ ...form, marka: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Total CTN</label><Input type="number" value={form.totalCtn} onChange={e => setForm({ ...form, totalCtn: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">Remaining CTN</label><Input type="number" value={form.remainingCtn} onChange={e => setForm({ ...form, remainingCtn: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">Location</label><Input value={form.remainingCtnLocation} onChange={e => setForm({ ...form, remainingCtnLocation: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Client</label><Input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
          </div>
          <Button className="mt-4 w-full" onClick={handleSave}>{editId ? 'Update' : 'Add'}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemainingCtns;
