import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Package, Truck, AlertTriangle, ArrowRight } from 'lucide-react';
import { getStatusColor } from '@/lib/statusColors';

const TrackingSystem = () => {
  const { consignments, loadingList, containers, remainingCtns } = useStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleSearch = () => {
    if (!search.trim()) { setResults(null); return; }
    const q = search.toLowerCase();

    const matchedLoadingItems = loadingList.filter(l =>
      l.consignmentNo.toLowerCase().includes(q) || l.marka.toLowerCase().includes(q) || l.client.toLowerCase().includes(q) || l.container.toLowerCase().includes(q)
    );

    const matchedConsignments = consignments.filter(c =>
      c.consignmentNo.toLowerCase().includes(q) || c.marka.toLowerCase().includes(q) || c.client.toLowerCase().includes(q)
    );

    const matchedContainers = containers.filter(c =>
      c.containerNo.toLowerCase().includes(q)
    );

    const matchedRemaining = remainingCtns.filter(r =>
      (r.consignmentNo || '').toLowerCase().includes(q) || (r.marka || '').toLowerCase().includes(q) || (r.client || '').toLowerCase().includes(q)
    );

    setResults({ consignments: matchedConsignments, loadingItems: matchedLoadingItems, containers: matchedContainers, remaining: matchedRemaining });
  };

  const renderStatusBadge = (status: string) => {
    if (!status) return <span className="text-muted-foreground text-xs">—</span>;
    const colorClass = getStatusColor(status);
    return <Badge variant="outline" className={`text-xs border ${colorClass}`}>{status}</Badge>;
  };

  const renderTimeline = (item: any) => {
    const steps: { label: string; detail: string; done: boolean; active: boolean }[] = [];

    if (item.dispatchedFrom) {
      steps.push({ label: 'Dispatched from Origin', detail: item.dispatchedFrom, done: true, active: false });
    }
    if (item.container) {
      steps.push({ label: 'Container', detail: item.container, done: true, active: false });
    }

    const statusOrder = ['On the way to Lhasa', 'At Lhasa', 'On the way to Nylam', 'At Nylam'];
    const currentIdx = statusOrder.indexOf(item.status);
    statusOrder.forEach((s, i) => {
      steps.push({ label: s, detail: '', done: i <= currentIdx && currentIdx >= 0, active: i === currentIdx });
    });

    if (item.arrivalDateNylam) {
      steps.push({ label: 'Arrived at Nylam', detail: item.arrivalDateNylam, done: true, active: false });
    }

    // Kerung/Tatopani details
    const kCtrs = item.kerung?.containers || [];
    const tCtrs = item.tatopani?.containers || [];
    if (kCtrs.length > 0 || item.kerung?.dispatchedFromNylam) {
      steps.push({ label: '→ KERUNG', detail: `${kCtrs.length || 1} container(s)`, done: !!item.kerung?.dispatchedFromNylam, active: item.kerung?.status?.includes('way') });
    }
    if (tCtrs.length > 0 || item.tatopani?.dispatchedFromNylam) {
      steps.push({ label: '→ TATOPANI', detail: `${tCtrs.length || 1} container(s)`, done: !!item.tatopani?.dispatchedFromNylam, active: item.tatopani?.status?.includes('way') });
    }

    return steps;
  };

  return (
    <div className="p-6">
      <h1 className="page-header">Tracking System</h1>
      <div className="toolbar">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search consignment, MARKA, container, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {results && (
        <div className="space-y-6 mt-4">
          {results.loadingItems.length > 0 && results.loadingItems.map((item: any) => {
            const timeline = renderTimeline(item);
            return (
              <Card key={item.id} className="border-2 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-5 w-5 text-accent" />
                      {item.consignmentNo} — {item.marka}
                    </CardTitle>
                    {renderStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">Client: <span className="font-semibold text-foreground">{item.client}</span></p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    <div className="p-2 rounded bg-accent/5 border"><span className="text-xs text-muted-foreground block">Date</span><span className="font-semibold">{item.date}</span></div>
                    <div className="p-2 rounded bg-accent/5 border"><span className="text-xs text-muted-foreground block">Total CTNS</span><span className="font-semibold">{item.totalCtns}</span></div>
                    <div className="p-2 rounded bg-accent/5 border"><span className="text-xs text-muted-foreground block">CBM</span><span className="font-semibold">{item.cbm}</span></div>
                    <div className="p-2 rounded bg-accent/5 border"><span className="text-xs text-muted-foreground block">Destination</span><span className="font-semibold">{item.destination}</span></div>
                  </div>

                  {/* Timeline */}
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-sm"><Truck className="h-4 w-4" /> Shipment Timeline</h3>
                  <div className="flex flex-wrap items-center gap-1 mb-4">
                    {timeline.map((step, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`px-2 py-1 rounded text-xs font-medium border ${step.active ? 'bg-accent text-accent-foreground border-accent' : step.done ? 'bg-green-100 text-green-700 border-green-200' : 'bg-muted text-muted-foreground border-border'}`}>
                          {step.label}
                          {step.detail && <span className="ml-1 opacity-70">({step.detail})</span>}
                        </div>
                        {i < timeline.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>

                  {/* Kerung/Tatopani details */}
                  {(item.kerung?.containers?.length > 0 || item.kerung?.dispatchedFromNylam) && (
                    <div className="mt-3 p-3 rounded-lg border bg-accent/5">
                      <h4 className="font-bold text-xs mb-2">KERUNG Details</h4>
                      {(item.kerung.containers || [{ ...item.kerung }]).map((c: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs mb-1">
                          <div><span className="text-muted-foreground">Dispatched:</span> {c.dispatchedFromNylam}</div>
                          <div><span className="text-muted-foreground">Loaded:</span> {c.loadedCtn}</div>
                          <div><span className="text-muted-foreground">Container:</span> {c.nylamContainer}</div>
                          <div>{renderStatusBadge(c.status)}</div>
                          <div><span className="text-muted-foreground">Received:</span> {c.receivedCtn}</div>
                          <div><span className="text-muted-foreground">Arrival:</span> {c.arrivalDate || '—'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(item.tatopani?.containers?.length > 0 || item.tatopani?.dispatchedFromNylam) && (
                    <div className="mt-3 p-3 rounded-lg border bg-accent/5">
                      <h4 className="font-bold text-xs mb-2">TATOPANI Details</h4>
                      {(item.tatopani.containers || [{ ...item.tatopani }]).map((c: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs mb-1">
                          <div><span className="text-muted-foreground">Dispatched:</span> {c.dispatchedFromNylam}</div>
                          <div><span className="text-muted-foreground">Loaded:</span> {c.loadedCtn}</div>
                          <div><span className="text-muted-foreground">Container:</span> {c.nylamContainer}</div>
                          <div>{renderStatusBadge(c.status)}</div>
                          <div><span className="text-muted-foreground">Received:</span> {c.receivedCtn}</div>
                          <div><span className="text-muted-foreground">Arrival:</span> {c.arrivalDate || '—'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Analysis */}
                  {(() => {
                    const kCtrs = item.kerung?.containers || (item.kerung?.loadedCtn > 0 ? [item.kerung] : []);
                    const tCtrs = item.tatopani?.containers || (item.tatopani?.loadedCtn > 0 ? [item.tatopani] : []);
                    const totalLoaded = [...kCtrs, ...tCtrs].reduce((s: number, c: any) => s + (c.loadedCtn || 0), 0);
                    const totalReceived = [...kCtrs, ...tCtrs].reduce((s: number, c: any) => s + (c.receivedCtn || 0), 0);
                    const missing = totalLoaded - totalReceived;
                    const remaining = item.totalCtns - totalLoaded;
                    if (missing > 0 || remaining > 0) {
                      return (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm flex gap-6">
                          <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-destructive" /> Analysis:</div>
                          {missing > 0 && <div>⚠ Missing CTN: <span className="font-bold">{missing}</span></div>}
                          {remaining > 0 && <div>📦 Remaining at Nylam: <span className="font-bold">{remaining}</span></div>}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
            );
          })}

          {results.consignments.length > 0 && results.loadingItems.length === 0 && (
            <div>
              <h3 className="font-bold mb-3">Consignment Results</h3>
              {results.consignments.map((c: any) => (
                <Card key={c.id} className="mb-2">
                  <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground block">Consignment No.</span><span className="font-semibold">{c.consignmentNo}</span></div>
                    <div><span className="text-xs text-muted-foreground block">MARKA</span><span className="font-semibold">{c.marka}</span></div>
                    <div><span className="text-xs text-muted-foreground block">Status</span>{renderStatusBadge(c.status)}</div>
                    <div><span className="text-xs text-muted-foreground block">Client</span><span className="font-semibold">{c.client}</span></div>
                    <div><span className="text-xs text-muted-foreground block">Destination</span><span className="font-semibold">{c.destination}</span></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {results.remaining.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">Remaining CTN Results</h3>
              {results.remaining.map((r: any) => (
                <Card key={r.id} className="mb-2">
                  <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground block">Consignment</span><span className="font-semibold">{r.consignmentNo}</span></div>
                    <div><span className="text-xs text-muted-foreground block">MARKA</span><span className="font-semibold">{r.marka}</span></div>
                    <div><span className="text-xs text-muted-foreground block">Remaining</span><span className="font-bold text-destructive">{r.remainingCtn}</span></div>
                    <div><span className="text-xs text-muted-foreground block">Location</span><span className="font-semibold">{r.remainingCtnLocation}</span></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {results.consignments.length === 0 && results.loadingItems.length === 0 && results.remaining.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No results found for "{search}"</p>
          )}
        </div>
      )}

      {!results && (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Search for a consignment, MARKA, container, or client</p>
          <p className="text-sm mt-1">The system will display complete tracking details with timeline</p>
        </div>
      )}
    </div>
  );
};

export default TrackingSystem;
