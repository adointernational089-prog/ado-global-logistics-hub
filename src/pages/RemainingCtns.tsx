import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Download, Upload, Eye, Trash2, Edit, FileSpreadsheet } from 'lucide-react';
import type { RemainingCtnItem } from '@/types';

const genId = () => crypto.randomUUID();

const RemainingCtns = () => {
  const { remainingCtns, addRemainingCtn, updateRemainingCtn, deleteRemainingCtn } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const filtered = useMemo(() => remainingCtns.filter(i =>
    Object.values(i).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  ), [remainingCtns, search]);

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
    const rows = remainingCtns.map(i => [i.consignmentDate, i.consignmentNo, i.marka, i.totalCtn, i.cbm, i.gw, i.destination, i.remainingCtn, i.remainingCtnLocation, i.client].join('\t'));
    const blob = new Blob([[headers.join('\t'), ...rows].join('\n')], { type: 'text/tab-separated-values' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'remaining-ctns.tsv'; a.click();
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const v = lines[i].split('\t');
      if (v.length < 2) continue;
      addRemainingCtn({
        id: genId(), consignmentDate: v[0]||'', consignmentNo: v[1]||'', marka: v[2]||'',
        totalCtn: Number(v[3])||0, cbm: Number(v[4])||0, gw: Number(v[5])||0,
        destination: v[6]||'', remainingCtn: Number(v[7])||0, remainingCtnLocation: v[8]||'', client: v[9]||''
      });
    }
    setShowImport(false);
    setImportText('');
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
        <Button variant="outline" onClick={() => setShowImport(true)}><Upload className="h-4 w-4 mr-1" />Import</Button>
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
            {filtered.length === 0 && <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">No remaining CTNs found. Add items manually or use Import.</td></tr>}
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
            <div><label className="text-xs font-semibold">CBM</label><Input type="number" step="0.01" value={form.cbm} onChange={e => setForm({ ...form, cbm: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">GW</label><Input type="number" step="0.01" value={form.gw} onChange={e => setForm({ ...form, gw: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">Destination</label><Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Remaining CTN</label><Input type="number" value={form.remainingCtn} onChange={e => setForm({ ...form, remainingCtn: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">Location</label><Input value={form.remainingCtnLocation} onChange={e => setForm({ ...form, remainingCtnLocation: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Client</label><Input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
          </div>
          <Button className="mt-4 w-full" onClick={handleSave}>{editId ? 'Update' : 'Add'}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Import Remaining CTNs</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">Upload file</label><Input type="file" accept=".csv,.tsv,.txt" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImportText(ev.target?.result as string); r.readAsText(f); } }} /></div>
            <div><label className="text-sm font-semibold">Or paste tab-separated data</label><textarea className="w-full border rounded p-2 h-32 text-sm" placeholder="Date&#9;Consignment No&#9;MARKA&#9;Total CTN&#9;CBM&#9;GW&#9;Destination&#9;Remaining CTN&#9;Location&#9;Client" value={importText} onChange={e => setImportText(e.target.value)} /></div>
            <Button className="w-full" onClick={handleImport}><FileSpreadsheet className="h-4 w-4 mr-1" />Import</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemainingCtns;
