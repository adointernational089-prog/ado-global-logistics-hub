import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Download, Upload, Eye, Trash2, Edit, FileSpreadsheet } from 'lucide-react';
import type { Consignment, Destination, ConsignmentStatus } from '@/types';
import { DESTINATIONS, STATUSES, emptyKerung, emptyTatopani } from '@/types';
import type { LoadingListItem } from '@/types';

const genId = () => crypto.randomUUID();

const Consignments = () => {
  const { consignments, addConsignment, updateConsignment, deleteConsignment, setConsignments, loadingList, addLoadingListItem, updateLoadingListItem } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showMasterEdit, setShowMasterEdit] = useState(false);
  const [masterStatus, setMasterStatus] = useState<ConsignmentStatus | ''>('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const [form, setForm] = useState<Omit<Consignment, 'id'>>({
    date: '', consignmentNo: '', marka: '', totalCtns: 0, cbm: 0, gw: 0,
    destination: 'TATOPANI', status: '', client: '', remarks: ''
  });

  const filtered = useMemo(() =>
    consignments.filter(c =>
      Object.values(c).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
    ), [consignments, search]);

  const resetForm = () => setForm({
    date: '', consignmentNo: '', marka: '', totalCtns: 0, cbm: 0, gw: 0,
    destination: 'TATOPANI', status: '', client: '', remarks: ''
  });

  const syncToLoadingList = (c: Consignment) => {
    const existing = loadingList.find(l => l.consignmentNo === c.consignmentNo);
    const prefix = c.consignmentNo.substring(0, 2).toUpperCase();
    const isYiwu = prefix === 'YA' || prefix === 'YW';
    const isGuangzhou = prefix === 'GA' || prefix === 'GW';
    if (!isYiwu && !isGuangzhou) return;
    const origin = isYiwu ? 'yiwu' as const : 'guangzhou' as const;
    if (existing) {
      updateLoadingListItem(existing.id, {
        date: c.date, marka: c.marka, totalCtns: c.totalCtns, cbm: c.cbm,
        gw: c.gw, destination: c.destination, status: c.status, client: c.client, remarks: c.remarks,
      });
    } else {
      const newItem: LoadingListItem = {
        id: genId(), date: c.date, consignmentNo: c.consignmentNo, marka: c.marka,
        totalCtns: c.totalCtns, cbm: c.cbm, gw: c.gw, destination: c.destination,
        lotNo: '', dispatchedFrom: '', container: '', status: c.status,
        arrivalDateNylam: '', kerung: emptyKerung(), tatopani: emptyTatopani(),
        client: c.client, remarks: c.remarks, followUp: false, origin
      };
      addLoadingListItem(newItem);
    }
  };

  const handleSave = () => {
    if (editId) {
      updateConsignment(editId, form);
      syncToLoadingList({ id: editId, ...form });
      setEditId(null);
    } else {
      const newC: Consignment = { id: genId(), ...form };
      addConsignment(newC);
      syncToLoadingList(newC);
    }
    setShowAdd(false);
    resetForm();
  };

  const handleEdit = (c: Consignment) => {
    setForm({ date: c.date, consignmentNo: c.consignmentNo, marka: c.marka, totalCtns: c.totalCtns, cbm: c.cbm, gw: c.gw, destination: c.destination, status: c.status, client: c.client, remarks: c.remarks });
    setEditId(c.id);
    setShowAdd(true);
  };

  const handleMasterEdit = () => {
    if (masterStatus && selected.length > 0) {
      const store = useStore.getState();
      selected.forEach(id => {
        store.updateConsignment(id, { status: masterStatus });
        const c = store.consignments.find(x => x.id === id);
        if (c) syncToLoadingList({ ...c, status: masterStatus });
      });
      setShowMasterEdit(false);
      setSelected([]);
      setMasterStatus('');
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split('\t');
      if (vals.length < 2) continue;
      const newC: Consignment = {
        id: genId(), date: vals[0] || '', consignmentNo: vals[1] || '', marka: vals[2] || '',
        totalCtns: Number(vals[3]) || 0, cbm: Number(vals[4]) || 0, gw: Number(vals[5]) || 0,
        destination: (vals[6] as Destination) || 'TATOPANI',
        status: (vals[7] as ConsignmentStatus) || '',
        client: vals[8] || '', remarks: vals[9] || '',
      };
      addConsignment(newC);
      syncToLoadingList(newC);
    }
    setShowImport(false);
    setImportText('');
  };

  const handleExport = () => {
    const headers = ['Date', 'Consignment No', 'MARKA', 'Total CTNS', 'CBM', 'GW', 'Destination', 'Status', 'Client', 'Remarks'];
    const rows = consignments.map(c => [c.date, c.consignmentNo, c.marka, c.totalCtns, c.cbm, c.gw, c.destination, c.status, c.client, c.remarks].join('\t'));
    const csv = [headers.join('\t'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'consignments.tsv'; a.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const viewedC = showView ? consignments.find(c => c.id === showView) : null;
  const viewedL = viewedC ? loadingList.find(l => l.consignmentNo === viewedC.consignmentNo) : null;

  return (
    <div className="p-6">
      <h1 className="page-header">Consignments</h1>

      <div className="toolbar">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { resetForm(); setEditId(null); setShowAdd(true); }}><Plus className="h-4 w-4 mr-1" />Add</Button>
        <Button variant="outline" onClick={() => setShowImport(true)}><Upload className="h-4 w-4 mr-1" />Import</Button>
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export</Button>
        {selected.length > 0 && (
          <Button variant="secondary" onClick={() => setShowMasterEdit(true)}>
            <Edit className="h-4 w-4 mr-1" />Master Edit ({selected.length})
          </Button>
        )}
      </div>

      <div className="table-container border rounded-lg">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted sticky top-0 z-20">
            <tr>
              <th className="p-3 w-10"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={(checked) => setSelected(checked ? filtered.map(c => c.id) : [])} /></th>
              <th className="p-3 text-left font-semibold sticky-col-left bg-muted" style={{ left: 40 }}>Consignment No.</th>
              <th className="p-3 text-left font-semibold">Date</th>
              <th className="p-3 text-left font-semibold">MARKA</th>
              <th className="p-3 text-left font-semibold">Total CTNS</th>
              <th className="p-3 text-left font-semibold">CBM</th>
              <th className="p-3 text-left font-semibold">GW</th>
              <th className="p-3 text-left font-semibold">Destination</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Client</th>
              <th className="p-3 text-left font-semibold">Remarks</th>
              <th className="p-3 text-left font-semibold sticky-col-right bg-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t hover:bg-muted/50">
                <td className="p-3"><Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} /></td>
                <td className="p-3 font-medium sticky-col-left" style={{ left: 40 }}>{c.consignmentNo}</td>
                <td className="p-3">{c.date}</td>
                <td className="p-3">{c.marka}</td>
                <td className="p-3">{c.totalCtns}</td>
                <td className="p-3">{c.cbm}</td>
                <td className="p-3">{c.gw}</td>
                <td className="p-3">{c.destination}</td>
                <td className="p-3">{c.status ? <Badge variant="outline">{c.status}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3">{c.client}</td>
                <td className="p-3">{c.remarks}</td>
                <td className="p-3 sticky-col-right flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setShowView(c.id)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteConsignment(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={12} className="p-8 text-center text-muted-foreground">No consignments found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Consignment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold">Date</label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Consignment No.</label><Input value={form.consignmentNo} onChange={e => setForm({ ...form, consignmentNo: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">MARKA</label><Input value={form.marka} onChange={e => setForm({ ...form, marka: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Total CTNS</label><Input type="number" value={form.totalCtns} onChange={e => setForm({ ...form, totalCtns: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">CBM</label><Input type="number" step="0.01" value={form.cbm} onChange={e => setForm({ ...form, cbm: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-semibold">GW</label><Input type="number" step="0.01" value={form.gw} onChange={e => setForm({ ...form, gw: Number(e.target.value) })} /></div>
            <div>
              <label className="text-xs font-semibold">Destination</label>
              <Select value={form.destination} onValueChange={v => setForm({ ...form, destination: v as Destination })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DESTINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold">Status</label>
              <Select value={form.status || '_none'} onValueChange={v => setForm({ ...form, status: v === '_none' ? '' as any : v as ConsignmentStatus })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Select —</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-semibold">Client</label><Input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Remarks</label><Input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
          </div>
          <Button className="mt-4 w-full" onClick={handleSave}>{editId ? 'Update' : 'Add'} Consignment</Button>
        </DialogContent>
      </Dialog>

      {/* View Dialog - Attractive */}
      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg">Consignment Details</DialogTitle></DialogHeader>
          {viewedC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="text-xs text-muted-foreground">Consignment No.</span>
                  <p className="font-bold text-lg">{viewedC.consignmentNo}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="text-xs text-muted-foreground">MARKA</span>
                  <p className="font-bold text-lg">{viewedC.marka}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(var(--highlight))] text-[hsl(var(--highlight-foreground))]">
                  <span className="text-xs opacity-70">Total CTNS</span>
                  <p className="font-bold text-xl">{viewedC.totalCtns}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border">
                  <span className="text-xs text-muted-foreground">Client</span>
                  <p className="font-bold">{viewedC.client}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <p className="font-semibold">{viewedC.status || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-muted-foreground text-xs block">Date</span><span className="font-medium">{viewedC.date}</span></div>
                <div><span className="text-muted-foreground text-xs block">CBM</span><span className="font-medium">{viewedC.cbm}</span></div>
                <div><span className="text-muted-foreground text-xs block">GW</span><span className="font-medium">{viewedC.gw}</span></div>
                <div><span className="text-muted-foreground text-xs block">Destination</span><span className="font-medium">{viewedC.destination}</span></div>
              </div>
              {viewedC.remarks && (
                <div className="text-sm"><span className="text-muted-foreground text-xs block">Remarks</span><span>{viewedC.remarks}</span></div>
              )}
              {viewedL && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-bold text-base">Loading List Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-muted-foreground text-xs block">LOT No.</span><span className="font-medium">{viewedL.lotNo || '—'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Container</span><span className="font-medium">{viewedL.container || '—'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Dispatched From</span><span className="font-medium">{viewedL.dispatchedFrom || '—'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Arrival at Nylam</span><span className="font-medium">{viewedL.arrivalDateNylam || '—'}</span></div>
                  </div>
                  {(viewedL.kerung.dispatchedFromNylam || viewedL.kerung.loadedCtn > 0) && (
                    <div className="border-t pt-2">
                      <h4 className="font-semibold text-sm mb-1">KERUNG</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Dispatched</span><p>{viewedL.kerung.dispatchedFromNylam}</p></div>
                        <div><span className="text-muted-foreground">Loaded CTN</span><p>{viewedL.kerung.loadedCtn}</p></div>
                        <div><span className="text-muted-foreground">Container</span><p>{viewedL.kerung.nylamContainer}</p></div>
                        <div><span className="text-muted-foreground">Status</span><p>{viewedL.kerung.status || '—'}</p></div>
                        <div><span className="text-muted-foreground">Received CTN</span><p>{viewedL.kerung.receivedCtn}</p></div>
                        <div><span className="text-muted-foreground">Arrival</span><p>{viewedL.kerung.arrivalDate || '—'}</p></div>
                      </div>
                    </div>
                  )}
                  {(viewedL.tatopani.dispatchedFromNylam || viewedL.tatopani.loadedCtn > 0) && (
                    <div className="border-t pt-2">
                      <h4 className="font-semibold text-sm mb-1">TATOPANI</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Dispatched</span><p>{viewedL.tatopani.dispatchedFromNylam}</p></div>
                        <div><span className="text-muted-foreground">Loaded CTN</span><p>{viewedL.tatopani.loadedCtn}</p></div>
                        <div><span className="text-muted-foreground">Container</span><p>{viewedL.tatopani.nylamContainer}</p></div>
                        <div><span className="text-muted-foreground">Status</span><p>{viewedL.tatopani.status || '—'}</p></div>
                        <div><span className="text-muted-foreground">Received CTN</span><p>{viewedL.tatopani.receivedCtn}</p></div>
                        <div><span className="text-muted-foreground">Arrival</span><p>{viewedL.tatopani.arrivalDate || '—'}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Import Consignments</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Upload Excel/CSV file</label>
              <Input type="file" accept=".csv,.tsv,.txt,.xlsx" onChange={handleFileImport} />
            </div>
            <div>
              <label className="text-sm font-semibold">Or paste tab-separated data</label>
              <textarea className="w-full border rounded p-2 h-32 text-sm" placeholder="Date&#9;Consignment No&#9;MARKA&#9;Total CTNS&#9;CBM&#9;GW&#9;Destination&#9;Status&#9;Client&#9;Remarks" value={importText} onChange={e => setImportText(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleImport}><FileSpreadsheet className="h-4 w-4 mr-1" />Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Master Edit Dialog */}
      <Dialog open={showMasterEdit} onOpenChange={setShowMasterEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Master Edit - Status</DialogTitle></DialogHeader>
          <Select value={masterStatus} onValueChange={v => setMasterStatus(v as ConsignmentStatus)}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="w-full mt-3" onClick={handleMasterEdit}>Apply to {selected.length} items</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consignments;
