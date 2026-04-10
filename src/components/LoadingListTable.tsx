import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Download, Upload, Eye, Trash2, Edit, ChevronDown, ChevronRight, FileSpreadsheet, Check } from 'lucide-react';
import type { LoadingListItem, Destination, ConsignmentStatus, KerungDetails, TatopaniDetails, ContainerEntry } from '@/types';
import { DESTINATIONS, STATUSES, TATOPANI_STATUSES, KERUNG_STATUSES, emptyKerung, emptyTatopani, emptyContainerEntry } from '@/types';
import { getStatusColor, getDestinationRowClass } from '@/lib/statusColors';

const genId = () => crypto.randomUUID();

interface Props {
  origin: 'guangzhou' | 'yiwu';
}

export const LoadingListTable = ({ origin }: Props) => {
  const { loadingList, addLoadingListItem, updateLoadingListItem, deleteLoadingListItem, consignments, updateConsignment, addConsignment } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showView, setShowView] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedKerung, setExpandedKerung] = useState<string[]>([]);
  const [expandedTatopani, setExpandedTatopani] = useState<string[]>([]);
  const [showMasterEdit, setShowMasterEdit] = useState(false);
  const [showTatopaniEdit, setShowTatopaniEdit] = useState(false);
  const [showKerungEdit, setShowKerungEdit] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const label = origin === 'guangzhou' ? 'Guangzhou' : 'Yiwu';
  const items = useMemo(() => loadingList.filter(l => l.origin === origin), [loadingList, origin]);
  const filtered = useMemo(() => items.filter(i =>
    Object.values(i).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  ), [items, search]);

  const [form, setForm] = useState<Omit<LoadingListItem, 'id'>>({
    date: '', consignmentNo: '', marka: '', totalCtns: 0, cbm: 0, gw: 0,
    destination: 'TATOPANI', lotNo: '', dispatchedFrom: '', container: '',
    status: '', arrivalDateNylam: '',
    kerung: emptyKerung(), tatopani: emptyTatopani(),
    client: '', remarks: '', followUp: false, origin,
  });

  const [masterForm, setMasterForm] = useState({ lotNo: '', dispatchedFrom: '', container: '', dispatchedNylamKerung: '', nylamContainerKerung: '', dispatchedNylamTatopani: '', nylamContainerTatopani: '' });
  const [tatopaniForm, setTatopaniForm] = useState({ dispatchedFromNylam: '', nylamContainer: '', status: '' as string, arrivalDate: '' });
  const [kerungForm, setKerungForm] = useState({ dispatchedFromNylam: '', nylamContainer: '', status: '' as string, arrivalDate: '' });

  const resetForm = () => setForm({
    date: '', consignmentNo: '', marka: '', totalCtns: 0, cbm: 0, gw: 0,
    destination: 'TATOPANI', lotNo: '', dispatchedFrom: '', container: '',
    status: '', arrivalDateNylam: '',
    kerung: emptyKerung(), tatopani: emptyTatopani(),
    client: '', remarks: '', followUp: false, origin,
  });

  const getContainers = (item: LoadingListItem, type: 'kerung' | 'tatopani'): ContainerEntry[] => {
    const details = item[type];
    const ctrs = details.containers || [];
    // If old format (no containers array), create one entry from the main fields
    if (ctrs.length === 0 && (details.dispatchedFromNylam || details.loadedCtn > 0)) {
      return [{
        dispatchedFromNylam: details.dispatchedFromNylam,
        loadedCtn: details.loadedCtn,
        nylamContainer: details.nylamContainer,
        status: details.status,
        receivedCtn: details.receivedCtn,
        arrivalDate: details.arrivalDate,
      }];
    }
    return ctrs;
  };

  const calcOnTheWay = (item: LoadingListItem) => {
    let count = 0;
    const kCtrs = getContainers(item, 'kerung');
    const tCtrs = getContainers(item, 'tatopani');
    kCtrs.forEach(c => { if (c.status === 'On the way to Kerung') count += c.loadedCtn; });
    tCtrs.forEach(c => { if (c.status === 'On the way to Tatopani') count += c.loadedCtn; });
    if (count === 0) {
      if (item.tatopani.status === 'On the way to Tatopani') count += item.tatopani.loadedCtn;
      if (item.kerung.status === 'On the way to Kerung') count += item.kerung.loadedCtn;
    }
    return count;
  };

  const calcMissing = (item: LoadingListItem) => {
    const kCtrs = getContainers(item, 'kerung');
    const tCtrs = getContainers(item, 'tatopani');
    const totalLoaded = kCtrs.reduce((s, c) => s + c.loadedCtn, 0) + tCtrs.reduce((s, c) => s + c.loadedCtn, 0);
    const totalReceived = kCtrs.reduce((s, c) => s + c.receivedCtn, 0) + tCtrs.reduce((s, c) => s + c.receivedCtn, 0);
    if (totalLoaded === 0) return 0;
    return totalLoaded - totalReceived;
  };

  const calcRemaining = (item: LoadingListItem) => {
    const kCtrs = getContainers(item, 'kerung');
    const tCtrs = getContainers(item, 'tatopani');
    const totalLoaded = kCtrs.reduce((s, c) => s + c.loadedCtn, 0) + tCtrs.reduce((s, c) => s + c.loadedCtn, 0);
    if (totalLoaded === 0) return '-';
    return item.totalCtns - totalLoaded;
  };

  const syncToConsignments = (item: LoadingListItem) => {
    const existing = consignments.find(c => c.consignmentNo === item.consignmentNo);
    if (existing) {
      updateConsignment(existing.id, {
        date: item.date, marka: item.marka, totalCtns: item.totalCtns, cbm: item.cbm,
        gw: item.gw, destination: item.destination, status: item.status, client: item.client, remarks: item.remarks
      });
    } else {
      addConsignment({
        id: genId(), date: item.date, consignmentNo: item.consignmentNo, marka: item.marka,
        totalCtns: item.totalCtns, cbm: item.cbm, gw: item.gw, destination: item.destination,
        status: item.status, client: item.client, remarks: item.remarks,
      });
    }
  };

  const handleSave = () => {
    if (editId) {
      updateLoadingListItem(editId, form);
      syncToConsignments({ id: editId, ...form });
      setEditId(null);
    } else {
      const newItem: LoadingListItem = { id: genId(), ...form };
      addLoadingListItem(newItem);
      syncToConsignments(newItem);
    }
    setShowAdd(false);
    resetForm();
  };

  const handleEdit = (item: LoadingListItem) => {
    const { id, ...rest } = item;
    setForm(rest);
    setEditId(id);
    setShowAdd(true);
  };

  const handleInlineUpdate = (id: string, field: string, value: string) => {
    const updates: Partial<LoadingListItem> = { [field]: value };
    updateLoadingListItem(id, updates);
    const item = loadingList.find(l => l.id === id);
    if (item) syncToConsignments({ ...item, ...updates });
  };

  const handleMasterEdit = () => {
    selected.forEach(id => {
      const updates: Partial<LoadingListItem> = {};
      if (masterForm.lotNo) updates.lotNo = masterForm.lotNo;
      if (masterForm.dispatchedFrom) updates.dispatchedFrom = masterForm.dispatchedFrom;
      if (masterForm.container) updates.container = masterForm.container;
      updateLoadingListItem(id, updates);
    });
    setShowMasterEdit(false);
    setSelected([]);
    setMasterForm({ lotNo: '', dispatchedFrom: '', container: '', dispatchedNylamKerung: '', nylamContainerKerung: '', dispatchedNylamTatopani: '', nylamContainerTatopani: '' });
  };

  const handleTatopaniEdit = () => {
    selected.forEach(id => {
      const item = loadingList.find(l => l.id === id);
      if (item) {
        const updates: Partial<TatopaniDetails> = {};
        if (tatopaniForm.dispatchedFromNylam) updates.dispatchedFromNylam = tatopaniForm.dispatchedFromNylam;
        if (tatopaniForm.nylamContainer) updates.nylamContainer = tatopaniForm.nylamContainer;
        if (tatopaniForm.status) updates.status = tatopaniForm.status as any;
        if (tatopaniForm.arrivalDate) updates.arrivalDate = tatopaniForm.arrivalDate;
        updateLoadingListItem(id, { tatopani: { ...item.tatopani, ...updates } });
      }
    });
    setShowTatopaniEdit(false);
    setSelected([]);
    setTatopaniForm({ dispatchedFromNylam: '', nylamContainer: '', status: '', arrivalDate: '' });
  };

  const handleKerungEdit = () => {
    selected.forEach(id => {
      const item = loadingList.find(l => l.id === id);
      if (item) {
        const updates: Partial<KerungDetails> = {};
        if (kerungForm.dispatchedFromNylam) updates.dispatchedFromNylam = kerungForm.dispatchedFromNylam;
        if (kerungForm.nylamContainer) updates.nylamContainer = kerungForm.nylamContainer;
        if (kerungForm.status) updates.status = kerungForm.status as any;
        if (kerungForm.arrivalDate) updates.arrivalDate = kerungForm.arrivalDate;
        updateLoadingListItem(id, { kerung: { ...item.kerung, ...updates } });
      }
    });
    setShowKerungEdit(false);
    setSelected([]);
    setKerungForm({ dispatchedFromNylam: '', nylamContainer: '', status: '', arrivalDate: '' });
  };

  const handleFollowUpToggle = (id: string) => {
    const item = loadingList.find(l => l.id === id);
    if (item) updateLoadingListItem(id, { followUp: !item.followUp });
  };

  const updateContainerEntry = (itemId: string, type: 'kerung' | 'tatopani', index: number, field: keyof ContainerEntry, value: string | number) => {
    const item = loadingList.find(l => l.id === itemId);
    if (!item) return;
    const details = { ...item[type] };
    const ctrs = [...(details.containers || [])];
    if (!ctrs[index]) ctrs[index] = emptyContainerEntry();
    ctrs[index] = { ...ctrs[index], [field]: value };
    details.containers = ctrs;
    // Also update the main fields from first container for backward compat
    if (index === 0) {
      details.dispatchedFromNylam = ctrs[0].dispatchedFromNylam;
      details.loadedCtn = ctrs[0].loadedCtn;
      details.nylamContainer = ctrs[0].nylamContainer;
      details.status = ctrs[0].status as any;
      details.receivedCtn = ctrs[0].receivedCtn;
      details.arrivalDate = ctrs[0].arrivalDate;
    }
    updateLoadingListItem(itemId, { [type]: details });
  };

  const setContainerCount = (itemId: string, type: 'kerung' | 'tatopani', count: number) => {
    const item = loadingList.find(l => l.id === itemId);
    if (!item) return;
    const details = { ...item[type] };
    const existing = details.containers || [];
    const newCtrs: ContainerEntry[] = [];
    for (let i = 0; i < count; i++) {
      newCtrs.push(existing[i] || emptyContainerEntry());
    }
    details.containers = newCtrs;
    if (newCtrs.length > 0) {
      details.dispatchedFromNylam = newCtrs[0].dispatchedFromNylam;
      details.loadedCtn = newCtrs[0].loadedCtn;
      details.nylamContainer = newCtrs[0].nylamContainer;
      details.status = newCtrs[0].status as any;
      details.receivedCtn = newCtrs[0].receivedCtn;
      details.arrivalDate = newCtrs[0].arrivalDate;
    }
    updateLoadingListItem(itemId, { [type]: details });
  };

  const renderExpandableFields = (item: LoadingListItem, type: 'kerung' | 'tatopani') => {
    const details = item[type];
    const ctrs = details.containers || [];
    const count = ctrs.length || 1;
    const statuses = type === 'kerung' ? KERUNG_STATUSES : TATOPANI_STATUSES;
    const typeLabel = type === 'kerung' ? 'KERUNG' : 'TATOPANI';

    return (
      <tr className="bg-accent/5">
        <td colSpan={20} className="p-3">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-bold">{typeLabel}</span>
            <label className="text-xs font-semibold">Containers:</label>
            <Input
              className="h-7 w-16 text-xs"
              type="number"
              min={1}
              value={count}
              onChange={e => setContainerCount(item.id, type, Math.max(1, Number(e.target.value)))}
            />
          </div>
          {/* Vertical layout - each container as a card */}
          <div className="space-y-3 max-w-xl">
            {Array.from({ length: count }).map((_, idx) => {
              const entry = ctrs[idx] || emptyContainerEntry();
              return (
                <div key={idx} className="border rounded-lg p-3 bg-background">
                  <div className="text-xs font-bold mb-2 text-muted-foreground">Container {idx + 1}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Dispatched</label>
                      <Input className="h-7 text-xs" value={entry.dispatchedFromNylam} onChange={e => updateContainerEntry(item.id, type, idx, 'dispatchedFromNylam', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Loaded CTN</label>
                      <Input className="h-7 text-xs" type="number" value={entry.loadedCtn} onChange={e => updateContainerEntry(item.id, type, idx, 'loadedCtn', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Container</label>
                      <Input className="h-7 text-xs" value={entry.nylamContainer} onChange={e => updateContainerEntry(item.id, type, idx, 'nylamContainer', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Status</label>
                      <Select value={entry.status || '_none'} onValueChange={v => updateContainerEntry(item.id, type, idx, 'status', v === '_none' ? '' : v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">— Select —</SelectItem>
                          {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Received CTN</label>
                      <Input className="h-7 text-xs" type="number" value={entry.receivedCtn} onChange={e => updateContainerEntry(item.id, type, idx, 'receivedCtn', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Arrival Date</label>
                      <Input className="h-7 text-xs" type="date" value={entry.arrivalDate} onChange={e => updateContainerEntry(item.id, type, idx, 'arrivalDate', e.target.value)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </td>
      </tr>
    );
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split('\t');
      if (vals.length < 2) continue;
      const newItem: LoadingListItem = {
        id: genId(), date: vals[0] || '', consignmentNo: vals[1] || '', marka: vals[2] || '',
        totalCtns: Number(vals[3]) || 0, cbm: Number(vals[4]) || 0, gw: Number(vals[5]) || 0,
        destination: (vals[6] as Destination) || 'TATOPANI', lotNo: vals[7] || '',
        dispatchedFrom: vals[8] || '', container: vals[9] || '',
        status: (vals[10] as ConsignmentStatus) || '',
        arrivalDateNylam: '', kerung: emptyKerung(), tatopani: emptyTatopani(),
        client: vals[11] || '', remarks: vals[12] || '', followUp: false, origin,
      };
      addLoadingListItem(newItem);
      syncToConsignments(newItem);
    }
    setShowImport(false);
    setImportText('');
  };

  const handleExport = () => {
    const headers = ['Date', 'Consignment No', 'MARKA', 'Total CTNS', 'CBM', 'GW', 'Destination', 'LOT No', `Dispatched from ${label}`, `${label} Container`, 'Status', 'Client', 'Remarks'];
    const rows = items.map(i => [i.date, i.consignmentNo, i.marka, i.totalCtns, i.cbm, i.gw, i.destination, i.lotNo, i.dispatchedFrom, i.container, i.status, i.client, i.remarks].join('\t'));
    const csv = [headers.join('\t'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/tab-separated-values' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `loading-list-${origin}.tsv`; a.click();
  };

  const viewedItem = showView ? items.find(i => i.id === showView) : null;
  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const renderStatusBadge = (status: string) => {
    if (!status) return <span className="text-muted-foreground">—</span>;
    const colorClass = getStatusColor(status);
    return <Badge variant="outline" className={`text-xs border ${colorClass}`}>{status}</Badge>;
  };

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
        {selected.length > 0 && (
          <>
            <Button variant="secondary" onClick={() => setShowMasterEdit(true)}><Edit className="h-4 w-4 mr-1" />Master Edit ({selected.length})</Button>
            <Button variant="secondary" onClick={() => setShowTatopaniEdit(true)}>TATOPANI Edit</Button>
            <Button variant="secondary" onClick={() => setShowKerungEdit(true)}>KERUNG Edit</Button>
          </>
        )}
      </div>

      <div className="table-container border rounded-lg">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted sticky top-0 z-20">
            <tr>
              <th className="p-2 w-8"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={(c) => setSelected(c ? filtered.map(i => i.id) : [])} /></th>
              <th className="p-2 text-left font-bold">Consignment No.</th>
              <th className="p-2 text-left font-bold">Date</th>
              <th className="p-2 text-left font-bold">MARKA</th>
              <th className="p-2 text-left font-bold">Total CTNS</th>
              <th className="p-2 text-left font-bold">CBM</th>
              <th className="p-2 text-left font-bold">GW</th>
              <th className="p-2 text-left font-bold">Destination</th>
              <th className="p-2 text-left font-bold">LOT No.</th>
              <th className="p-2 text-left font-bold">Dispatched from {label}</th>
              <th className="p-2 text-left font-bold">{label} Container</th>
              <th className="p-2 text-left font-bold">Status</th>
              <th className="p-2 text-left font-bold">Arrival at Nylam</th>
              <th className="p-2 text-left font-bold">KERUNG ▼</th>
              <th className="p-2 text-left font-bold">TATOPANI ▼</th>
              <th className="p-2 text-left font-bold highlight-cell">On the Way</th>
              <th className="p-2 text-left font-bold highlight-cell">Missing CTN</th>
              <th className="p-2 text-left font-bold highlight-cell">Remaining CTN at Nylam</th>
              <th className="p-2 text-left font-bold">Client</th>
              <th className="p-2 text-left font-bold">Remarks</th>
              <th className="p-2 text-left font-bold">Follow Up</th>
              <th className="p-2 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isKerungExpanded = expandedKerung.includes(item.id);
              const isTatopaniExpanded = expandedTatopani.includes(item.id);
              const destRowClass = getDestinationRowClass(item.destination);
              return (
                <>
                  <tr key={item.id} className={`border-t hover:bg-muted/50 ${destRowClass}`}>
                    <td className="p-2"><Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} /></td>
                    <td className="p-2 font-semibold">{item.consignmentNo}</td>
                    <td className="p-2">{item.date}</td>
                    <td className="p-2">{item.marka}</td>
                    <td className="p-2">{item.totalCtns}</td>
                    <td className="p-2">{item.cbm}</td>
                    <td className="p-2">{item.gw}</td>
                    <td className="p-2 font-medium">{item.destination}</td>
                    <td className="p-2">{item.lotNo}</td>
                    {/* Inline editable: Dispatched from */}
                    <td className="p-2">
                      <Input className="h-7 text-xs w-24 border-dashed" value={item.dispatchedFrom} onChange={e => handleInlineUpdate(item.id, 'dispatchedFrom', e.target.value)} />
                    </td>
                    {/* Inline editable: Container */}
                    <td className="p-2">
                      <Input className="h-7 text-xs w-24 border-dashed" value={item.container} onChange={e => handleInlineUpdate(item.id, 'container', e.target.value)} />
                    </td>
                    {/* Inline editable: Status */}
                    <td className="p-2">
                      <Select value={item.status || '_none'} onValueChange={v => handleInlineUpdate(item.id, 'status', v === '_none' ? '' : v)}>
                        <SelectTrigger className="h-7 text-xs w-36 border-dashed"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">— Select —</SelectItem>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    {/* Inline editable: Arrival at Nylam */}
                    <td className="p-2">
                      <Input className="h-7 text-xs w-28 border-dashed" type="date" value={item.arrivalDateNylam} onChange={e => handleInlineUpdate(item.id, 'arrivalDateNylam', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" className="h-6 px-1 text-xs" onClick={() => setExpandedKerung(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}>
                        {isKerungExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        KERUNG
                      </Button>
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" className="h-6 px-1 text-xs" onClick={() => setExpandedTatopani(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}>
                        {isTatopaniExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        TATOPANI
                      </Button>
                    </td>
                    <td className="p-2 highlight-cell">{calcOnTheWay(item) || '-'}</td>
                    <td className="p-2 highlight-cell">{calcMissing(item) || '-'}</td>
                    <td className="p-2 highlight-cell">{calcRemaining(item)}</td>
                    <td className="p-2">{item.client}</td>
                    <td className="p-2">{item.remarks}</td>
                    <td className="p-2 text-center">
                      <div className="cursor-pointer" onDoubleClick={() => handleFollowUpToggle(item.id)}>
                        {item.followUp ? <Check className="h-4 w-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="p-2 flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowView(item.id)}><Eye className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(item)}><Edit className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteLoadingListItem(item.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </td>
                  </tr>
                  {isKerungExpanded && renderExpandableFields(item, 'kerung')}
                  {isTatopaniExpanded && renderExpandableFields(item, 'tatopani')}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={22} className="p-8 text-center text-muted-foreground">No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-bold text-lg">{editId ? 'Edit' : 'Add'} Loading List Item</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs font-bold">Date</label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Consignment No.</label><Input value={form.consignmentNo} onChange={e => setForm({ ...form, consignmentNo: e.target.value })} /></div>
            <div><label className="text-xs font-bold">MARKA</label><Input value={form.marka} onChange={e => setForm({ ...form, marka: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Total CTNS</label><Input type="number" value={form.totalCtns} onChange={e => setForm({ ...form, totalCtns: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-bold">CBM</label><Input type="number" step="0.01" value={form.cbm} onChange={e => setForm({ ...form, cbm: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-bold">GW</label><Input type="number" step="0.01" value={form.gw} onChange={e => setForm({ ...form, gw: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-bold">Destination</label>
              <Select value={form.destination} onValueChange={v => setForm({ ...form, destination: v as Destination })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DESTINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><label className="text-xs font-bold">LOT No.</label><Input value={form.lotNo} onChange={e => setForm({ ...form, lotNo: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Client</label><Input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
            <div className="col-span-3"><label className="text-xs font-bold">Remarks</label><Input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
          </div>
          <Button className="mt-4 w-full" onClick={handleSave}>{editId ? 'Update' : 'Add'}</Button>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-bold text-lg">Loading List Details</DialogTitle></DialogHeader>
          {viewedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="text-xs text-muted-foreground">Consignment No.</span>
                  <p className="font-bold text-lg">{viewedItem.consignmentNo}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="text-xs text-muted-foreground">MARKA</span>
                  <p className="font-bold text-lg">{viewedItem.marka}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(var(--highlight))] text-[hsl(var(--highlight-foreground))]">
                  <span className="text-xs opacity-70">Total CTNS</span>
                  <p className="font-bold text-xl">{viewedItem.totalCtns}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border">
                  <span className="text-xs text-muted-foreground">Client</span>
                  <p className="font-bold">{viewedItem.client}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {renderStatusBadge(viewedItem.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-muted-foreground text-xs block">Date</span><span className="font-medium">{viewedItem.date}</span></div>
                <div><span className="text-muted-foreground text-xs block">CBM</span><span className="font-medium">{viewedItem.cbm}</span></div>
                <div><span className="text-muted-foreground text-xs block">GW</span><span className="font-medium">{viewedItem.gw}</span></div>
                <div><span className="text-muted-foreground text-xs block">Destination</span><span className="font-medium">{viewedItem.destination}</span></div>
              </div>
              {viewedItem.remarks && (
                <div className="text-sm"><span className="text-muted-foreground text-xs block">Remarks</span><span>{viewedItem.remarks}</span></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-bold">Import Data</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-bold">Upload file</label><Input type="file" accept=".csv,.tsv,.txt,.xlsx" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setImportText(ev.target?.result as string); r.readAsText(f); } }} /></div>
            <div><label className="text-sm font-bold">Or paste data</label><textarea className="w-full border rounded p-2 h-32 text-sm" value={importText} onChange={e => setImportText(e.target.value)} /></div>
            <Button className="w-full" onClick={handleImport}><FileSpreadsheet className="h-4 w-4 mr-1" />Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Master Edit Dialog */}
      <Dialog open={showMasterEdit} onOpenChange={setShowMasterEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-bold">Master Edit ({selected.length} items)</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold">LOT No.</label><Input value={masterForm.lotNo} onChange={e => setMasterForm({ ...masterForm, lotNo: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Dispatched from {label}</label><Input value={masterForm.dispatchedFrom} onChange={e => setMasterForm({ ...masterForm, dispatchedFrom: e.target.value })} /></div>
            <div><label className="text-xs font-bold">{label} Container</label><Input value={masterForm.container} onChange={e => setMasterForm({ ...masterForm, container: e.target.value })} /></div>
          </div>
          <Button className="w-full mt-3" onClick={handleMasterEdit}>Apply</Button>
        </DialogContent>
      </Dialog>

      {/* TATOPANI Edit */}
      <Dialog open={showTatopaniEdit} onOpenChange={setShowTatopaniEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-bold">TATOPANI Edit ({selected.length} items)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-bold">Dispatched from Nylam</label><Input value={tatopaniForm.dispatchedFromNylam} onChange={e => setTatopaniForm({ ...tatopaniForm, dispatchedFromNylam: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Nylam Container</label><Input value={tatopaniForm.nylamContainer} onChange={e => setTatopaniForm({ ...tatopaniForm, nylamContainer: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Status</label>
              <Select value={tatopaniForm.status || '_none'} onValueChange={v => setTatopaniForm({ ...tatopaniForm, status: v === '_none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="_none">— Select —</SelectItem>{TATOPANI_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-bold">Arrival Date</label><Input type="date" value={tatopaniForm.arrivalDate} onChange={e => setTatopaniForm({ ...tatopaniForm, arrivalDate: e.target.value })} /></div>
          </div>
          <Button className="w-full mt-3" onClick={handleTatopaniEdit}>Apply</Button>
        </DialogContent>
      </Dialog>

      {/* KERUNG Edit */}
      <Dialog open={showKerungEdit} onOpenChange={setShowKerungEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-bold">KERUNG Edit ({selected.length} items)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-bold">Dispatched from Nylam</label><Input value={kerungForm.dispatchedFromNylam} onChange={e => setKerungForm({ ...kerungForm, dispatchedFromNylam: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Nylam Container</label><Input value={kerungForm.nylamContainer} onChange={e => setKerungForm({ ...kerungForm, nylamContainer: e.target.value })} /></div>
            <div><label className="text-xs font-bold">Status</label>
              <Select value={kerungForm.status || '_none'} onValueChange={v => setKerungForm({ ...kerungForm, status: v === '_none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="_none">— Select —</SelectItem>{KERUNG_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-bold">Arrival Date</label><Input type="date" value={kerungForm.arrivalDate} onChange={e => setKerungForm({ ...kerungForm, arrivalDate: e.target.value })} /></div>
          </div>
          <Button className="w-full mt-3" onClick={handleKerungEdit}>Apply</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
