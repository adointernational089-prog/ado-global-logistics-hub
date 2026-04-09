import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Download, Upload, Eye, Trash2, Edit, FileSpreadsheet } from 'lucide-react';
import type { ContainerItem } from '@/types';

const genId = () => crypto.randomUUID();

const Containers = () => {
  const { containers, addContainer, updateContainer, deleteContainer, loadingList } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [openContainer, setOpenContainer] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const [form, setForm] = useState<Omit<ContainerItem, 'id'>>({
    containerNo: '', totalConsignments: 0, dispatchedDate: '',
    dispatchedFrom: 'Guangzhou', arrivalDate: '', arrivalLocation: 'Nylam',
  });

  const allContainers = useMemo(() => {
    const fromLoadingList = new Map<string, { from: string; items: typeof loadingList }>();
    loadingList.forEach(item => {
      const containerKeys = [item.container, item.kerung.nylamContainer, item.tatopani.nylamContainer].filter(Boolean);
      containerKeys.forEach(cn => {
        if (!fromLoadingList.has(cn)) fromLoadingList.set(cn, { from: '', items: [] });
        fromLoadingList.get(cn)!.items.push(item);
      });
    });

    const merged = [...containers];
    fromLoadingList.forEach((val, containerNo) => {
      if (!merged.find(c => c.containerNo === containerNo)) {
        merged.push({
          id: containerNo, containerNo, totalConsignments: val.items.length,
          dispatchedDate: '', dispatchedFrom: 'Guangzhou', arrivalDate: '', arrivalLocation: 'Nylam',
        });
      }
    });
    return merged;
  }, [containers, loadingList]);

  const filtered = useMemo(() => allContainers.filter(c =>
    Object.values(c).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  ), [allContainers, search]);

  const containerConsignments = useMemo(() => {
    if (!openContainer) return [];
    const cn = allContainers.find(c => c.id === openContainer)?.containerNo;
    if (!cn) return [];
    return loadingList.filter(l =>
      l.container === cn || l.kerung.nylamContainer === cn || l.tatopani.nylamContainer === cn
    );
  }, [openContainer, allContainers, loadingList]);

  const resetForm = () => setForm({ containerNo: '', totalConsignments: 0, dispatchedDate: '', dispatchedFrom: 'Guangzhou', arrivalDate: '', arrivalLocation: 'Nylam' });

  const handleSave = () => {
    if (editId) {
      updateContainer(editId, form);
      setEditId(null);
    } else {
      addContainer({ id: genId(), ...form });
    }
    setShowAdd(false);
    resetForm();
  };

  const handleExport = () => {
    const headers = ['Container No', 'Total Consignments', 'Dispatched Date', 'Dispatched From', 'Arrival Date', 'Arrival Location'];
    const rows = allContainers.map(c => [c.containerNo, c.totalConsignments, c.dispatchedDate, c.dispatchedFrom, c.arrivalDate, c.arrivalLocation].join('\t'));
    const blob = new Blob([[headers.join('\t'), ...rows].join('\n')], { type: 'text/tab-separated-values' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'containers.tsv'; a.click();
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const v = lines[i].split('\t');
      if (v.length < 2) continue;
      addContainer({ id: genId(), containerNo: v[0]||'', totalConsignments: Number(v[1])||0, dispatchedDate: v[2]||'', dispatchedFrom: (v[3] as any)||'Guangzhou', arrivalDate: v[4]||'', arrivalLocation: (v[5] as any)||'Nylam' });
    }
    setShowImport(false);
    setImportText('');
  };

  if (openContainer) {
    const container = allContainers.find(c => c.id === openContainer);
    return (
      <div className="p-6">
        <div className="toolbar">
          <Button variant="outline" onClick={() => setOpenContainer(null)}>← Back to Containers</Button>
          <h2 className="text-xl font-bold">{container?.containerNo}</h2>
        </div>
        <div className="table-container border rounded-lg">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-muted sticky top-0 z-20">
              <tr>
                <th className="p-3 text-left font-semibold">Date</th>
                <th className="p-3 text-left font-semibold">Consignment No.</th>
                <th className="p-3 text-left font-semibold">MARKA</th>
                <th className="p-3 text-left font-semibold">Total CTN</th>
                <th className="p-3 text-left font-semibold">Loaded CTN</th>
                <th className="p-3 text-left font-semibold">CBM</th>
                <th className="p-3 text-left font-semibold">GW</th>
                <th className="p-3 text-left font-semibold">Destination</th>
                <th className="p-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {containerConsignments.map(item => (
                <tr key={item.id} className="border-t hover:bg-muted/50">
                  <td className="p-3">{item.date}</td>
                  <td className="p-3 font-medium">{item.consignmentNo}</td>
                  <td className="p-3">{item.marka}</td>
                  <td className="p-3">{item.totalCtns}</td>
                  <td className="p-3">{item.kerung.loadedCtn + item.tatopani.loadedCtn}</td>
                  <td className="p-3">{item.cbm}</td>
                  <td className="p-3">{item.gw}</td>
                  <td className="p-3">{item.destination}</td>
                  <td className="p-3">{item.status}</td>
                </tr>
              ))}
              {containerConsignments.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No consignments in this container</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="page-header">Containers</h1>
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
              <th className="p-3 text-left font-semibold">Container No.</th>
              <th className="p-3 text-left font-semibold">Total Consignments</th>
              <th className="p-3 text-left font-semibold">Dispatched Date</th>
              <th className="p-3 text-left font-semibold">Dispatched From</th>
              <th className="p-3 text-left font-semibold">Arrival Date</th>
              <th className="p-3 text-left font-semibold">Arrival Location</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => setOpenContainer(c.id)}>
                <td className="p-3 font-medium text-accent">{c.containerNo}</td>
                <td className="p-3">{c.totalConsignments || loadingList.filter(l => l.container === c.containerNo || l.kerung.nylamContainer === c.containerNo || l.tatopani.nylamContainer === c.containerNo).length}</td>
                <td className="p-3">{c.dispatchedDate}</td>
                <td className="p-3">{c.dispatchedFrom}</td>
                <td className="p-3">{c.arrivalDate}</td>
                <td className="p-3">{c.arrivalLocation}</td>
                <td className="p-3 flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" onClick={() => setOpenContainer(c.id)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { const { id, ...rest } = c; setForm(rest); setEditId(id); setShowAdd(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteContainer(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No containers found</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Container</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold">Container No.</label><Input value={form.containerNo} onChange={e => setForm({ ...form, containerNo: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Dispatched Date</label><Input type="date" value={form.dispatchedDate} onChange={e => setForm({ ...form, dispatchedDate: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Dispatched From</label>
              <select className="w-full border rounded p-2 text-sm" value={form.dispatchedFrom} onChange={e => setForm({ ...form, dispatchedFrom: e.target.value as any })}>
                <option>Guangzhou</option><option>Yiwu</option><option>Nylam</option>
              </select>
            </div>
            <div><label className="text-xs font-semibold">Arrival Date</label><Input type="date" value={form.arrivalDate} onChange={e => setForm({ ...form, arrivalDate: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Arrival Location</label>
              <select className="w-full border rounded p-2 text-sm" value={form.arrivalLocation} onChange={e => setForm({ ...form, arrivalLocation: e.target.value as any })}>
                <option>Nylam</option><option>Tatopani</option><option>Kerung</option>
              </select>
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={handleSave}>{editId ? 'Update' : 'Add'}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Import</DialogTitle></DialogHeader>
          <Input type="file" accept=".csv,.tsv,.txt" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImportText(ev.target?.result as string); r.readAsText(f); } }} />
          <textarea className="w-full border rounded p-2 h-32 text-sm" value={importText} onChange={e => setImportText(e.target.value)} />
          <Button className="w-full" onClick={handleImport}><FileSpreadsheet className="h-4 w-4 mr-1" />Import</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Containers;
