import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Download, Upload, Eye, Trash2, Edit, Check, FileSpreadsheet } from 'lucide-react';
import type { OldNylamItem } from '@/types';

const genId = () => crypto.randomUUID();

export const OldNylamTable = () => {
  const { oldNylamGoods, addOldNylamItem, updateOldNylamItem, deleteOldNylamItem } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showView, setShowView] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const [form, setForm] = useState<Omit<OldNylamItem, 'id'>>({
    date: '', consignmentNo: '', marka: '', totalCtn: 0, ctnRemainingNylam: 0,
    loadedCtn: 0, cbm: 0, gw: 0, destination: '', dispatchedFromNylam: '',
    nylamContainer: '', arrivalLocation: '', arrivalDate: '', client: '', followUp: false,
  });

  const filtered = useMemo(() => oldNylamGoods.filter(i =>
    Object.values(i).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  ), [oldNylamGoods, search]);

  const resetForm = () => setForm({ date: '', consignmentNo: '', marka: '', totalCtn: 0, ctnRemainingNylam: 0, loadedCtn: 0, cbm: 0, gw: 0, destination: '', dispatchedFromNylam: '', nylamContainer: '', arrivalLocation: '', arrivalDate: '', client: '', followUp: false });

  const handleSave = () => {
    if (editId) {
      updateOldNylamItem(editId, form);
      setEditId(null);
    } else {
      addOldNylamItem({ id: genId(), ...form });
    }
    setShowAdd(false);
    resetForm();
  };

  const handleEdit = (item: OldNylamItem) => {
    const { id, ...rest } = item;
    setForm(rest);
    setEditId(id);
    setShowAdd(true);
  };

  const handleExport = () => {
    const headers = ['Date', 'Consignment No', 'MARKA', 'Total CTN', 'CTN Remaining', 'Loaded CTN', 'CBM', 'GW', 'Destination', 'Dispatched from Nylam', 'Nylam Container', 'Arrival Location', 'Arrival Date', 'Client'];
    const rows = oldNylamGoods.map(i => [i.date, i.consignmentNo, i.marka, i.totalCtn, i.ctnRemainingNylam, i.loadedCtn, i.cbm, i.gw, i.destination, i.dispatchedFromNylam, i.nylamContainer, i.arrivalLocation, i.arrivalDate, i.client].join('\t'));
    const blob = new Blob([[headers.join('\t'), ...rows].join('\n')], { type: 'text/tab-separated-values' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'old-nylam-goods.tsv'; a.click();
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const v = lines[i].split('\t');
      if (v.length < 2) continue;
      addOldNylamItem({ id: genId(), date: v[0]||'', consignmentNo: v[1]||'', marka: v[2]||'', totalCtn: Number(v[3])||0, ctnRemainingNylam: Number(v[4])||0, loadedCtn: Number(v[5])||0, cbm: Number(v[6])||0, gw: Number(v[7])||0, destination: v[8]||'', dispatchedFromNylam: v[9]||'', nylamContainer: v[10]||'', arrivalLocation: v[11]||'', arrivalDate: v[12]||'', client: v[13]||'', followUp: false });
    }
    setShowImport(false);
    setImportText('');
  };

  const viewedItem = showView ? oldNylamGoods.find(i => i.id === showView) : null;

  return (
    <div>
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
        <table className="w-full text-xs whitespace-nowrap">
          <thead className="bg-muted sticky top-0 z-20">
            <tr>
              <th className="p-2 text-left font-semibold">Date</th>
              <th className="p-2 text-left font-semibold">Consignment No.</th>
              <th className="p-2 text-left font-semibold">MARKA</th>
              <th className="p-2 text-left font-semibold highlight-cell">Total CTN</th>
              <th className="p-2 text-left font-semibold highlight-cell">CTN Remaining</th>
              <th className="p-2 text-left font-semibold">Loaded CTN</th>
              <th className="p-2 text-left font-semibold">CBM</th>
              <th className="p-2 text-left font-semibold">GW</th>
              <th className="p-2 text-left font-semibold">Destination</th>
              <th className="p-2 text-left font-semibold">Dispatched from Nylam</th>
              <th className="p-2 text-left font-semibold">Nylam Container</th>
              <th className="p-2 text-left font-semibold">Arrival Location</th>
              <th className="p-2 text-left font-semibold">Arrival Date</th>
              <th className="p-2 text-left font-semibold">Client</th>
              <th className="p-2 text-left font-semibold">Follow Up</th>
              <th className="p-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t hover:bg-muted/50">
                <td className="p-2">{item.date}</td>
                <td className="p-2 font-medium">{item.consignmentNo}</td>
                <td className="p-2">{item.marka}</td>
                <td className="p-2 highlight-cell">{item.totalCtn}</td>
                <td className="p-2 highlight-cell">{item.ctnRemainingNylam}</td>
                <td className="p-2">{item.loadedCtn}</td>
                <td className="p-2">{item.cbm}</td>
                <td className="p-2">{item.gw}</td>
                <td className="p-2">{item.destination}</td>
                <td className="p-2">{item.dispatchedFromNylam}</td>
                <td className="p-2">{item.nylamContainer}</td>
                <td className="p-2">{item.arrivalLocation}</td>
                <td className="p-2">{item.arrivalDate}</td>
                <td className="p-2">{item.client}</td>
                <td className="p-2 text-center">
                  <div className="cursor-pointer" onDoubleClick={() => updateOldNylamItem(item.id, { followUp: !item.followUp })}>
                    {item.followUp ? <Check className="h-4 w-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                  </div>
                </td>
                <td className="p-2 flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowView(item.id)}><Eye className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(item)}><Edit className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteOldNylamItem(item.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={16} className="p-8 text-center text-muted-foreground">No items found</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Old Nylam Item</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs font-semibold">Date</label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Consignment No.</label><Input value={form.consignmentNo} onChange={e => setForm({ ...form, consignmentNo: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">MARKA</label><Input value={form.marka} onChange={e => setForm({ ...form, marka: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Total CTN</label><Input type="number" value={form.totalCtn} onChange={e => setForm({ ...form, totalCtn: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">CTN Remaining</label><Input type="number" value={form.ctnRemainingNylam} onChange={e => setForm({ ...form, ctnRemainingNylam: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">Loaded CTN</label><Input type="number" value={form.loadedCtn} onChange={e => setForm({ ...form, loadedCtn: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">CBM</label><Input type="number" step="0.01" value={form.cbm} onChange={e => setForm({ ...form, cbm: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">GW</label><Input type="number" step="0.01" value={form.gw} onChange={e => setForm({ ...form, gw: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">Destination</label><Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Dispatched from Nylam</label><Input value={form.dispatchedFromNylam} onChange={e => setForm({ ...form, dispatchedFromNylam: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Nylam Container</label><Input value={form.nylamContainer} onChange={e => setForm({ ...form, nylamContainer: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Arrival Location</label><Input value={form.arrivalLocation} onChange={e => setForm({ ...form, arrivalLocation: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Arrival Date</label><Input type="date" value={form.arrivalDate} onChange={e => setForm({ ...form, arrivalDate: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Client</label><Input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
          </div>
          <Button className="mt-4 w-full" onClick={handleSave}>{editId ? 'Update' : 'Add'}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Details</DialogTitle></DialogHeader>
          {viewedItem && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(viewedItem).filter(([k]) => k !== 'id').map(([k, v]) => (
                <div key={k}><span className="font-semibold capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span> {String(v)}</div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Import Data</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="file" accept=".csv,.tsv,.txt" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImportText(ev.target?.result as string); r.readAsText(f); } }} />
            <textarea className="w-full border rounded p-2 h-32 text-sm" value={importText} onChange={e => setImportText(e.target.value)} />
            <Button className="w-full" onClick={handleImport}><FileSpreadsheet className="h-4 w-4 mr-1" />Import</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
