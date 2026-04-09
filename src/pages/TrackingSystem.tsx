import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Package, Truck, AlertTriangle } from 'lucide-react';

const TrackingSystem = () => {
  const { consignments, loadingList, containers, remainingCtns } = useStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleSearch = () => {
    if (!search.trim()) return;
    const q = search.toLowerCase();

    const matchedConsignments = consignments.filter(c =>
      c.consignmentNo.toLowerCase().includes(q) || c.marka.toLowerCase().includes(q) || c.client.toLowerCase().includes(q)
    );

    const matchedLoadingItems = loadingList.filter(l =>
      l.consignmentNo.toLowerCase().includes(q) || l.marka.toLowerCase().includes(q) || l.client.toLowerCase().includes(q) || l.container.toLowerCase().includes(q) || l.kerung.nylamContainer.toLowerCase().includes(q) || l.tatopani.nylamContainer.toLowerCase().includes(q)
    );

    const matchedContainers = containers.filter(c =>
      c.containerNo.toLowerCase().includes(q)
    );

    const autoContainers = loadingList.filter(l =>
      l.container.toLowerCase().includes(q) || l.kerung.nylamContainer.toLowerCase().includes(q) || l.tatopani.nylamContainer.toLowerCase().includes(q)
    );

    setResults({ consignments: matchedConsignments, loadingItems: matchedLoadingItems, containers: matchedContainers, autoContainers });
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
      </div>

      {results && (
        <div className="space-y-6 mt-4">
          {results.loadingItems.map((item: any) => (
            <Card key={item.id} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  {item.consignmentNo} — {item.marka}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div><span className="font-semibold">Date:</span> {item.date}</div>
                  <div><span className="font-semibold">Total CTNS:</span> {item.totalCtns}</div>
                  <div><span className="font-semibold">CBM:</span> {item.cbm}</div>
                  <div><span className="font-semibold">GW:</span> {item.gw}</div>
                  <div><span className="font-semibold">Destination:</span> {item.destination}</div>
                  <div><span className="font-semibold">Status:</span> <Badge variant="outline">{item.status}</Badge></div>
                  <div><span className="font-semibold">Client:</span> {item.client}</div>
                  <div><span className="font-semibold">LOT No:</span> {item.lotNo}</div>
                </div>

                <h3 className="font-bold mb-2 flex items-center gap-2"><Truck className="h-4 w-4" /> Shipment Trail</h3>
                <div className="space-y-2 text-sm pl-4 border-l-2 border-accent">
                  {item.dispatchedFrom && <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-accent" /> Dispatched from origin: {item.dispatchedFrom}</div>}
                  {item.container && <div className="flex items-center gap-2"><Package className="h-3 w-3 text-muted-foreground" /> Container: {item.container}</div>}
                  {item.arrivalDateNylam && <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-success" /> Arrived at Nylam: {item.arrivalDateNylam}</div>}

                  {item.kerung.dispatchedFromNylam && (
                    <div className="ml-4 border-l pl-3">
                      <div className="font-semibold">→ KERUNG</div>
                      <div>Dispatched: {item.kerung.dispatchedFromNylam}</div>
                      <div>Loaded CTN: {item.kerung.loadedCtn} | Container: {item.kerung.nylamContainer}</div>
                      <div>Status: {item.kerung.status}</div>
                      {item.kerung.receivedCtn > 0 && <div>Received CTN: {item.kerung.receivedCtn}</div>}
                      {item.kerung.arrivalDate && <div>Arrival: {item.kerung.arrivalDate}</div>}
                    </div>
                  )}

                  {item.tatopani.dispatchedFromNylam && (
                    <div className="ml-4 border-l pl-3">
                      <div className="font-semibold">→ TATOPANI</div>
                      <div>Dispatched: {item.tatopani.dispatchedFromNylam}</div>
                      <div>Loaded CTN: {item.tatopani.loadedCtn} | Container: {item.tatopani.nylamContainer}</div>
                      <div>Status: {item.tatopani.status}</div>
                      {item.tatopani.receivedCtn > 0 && <div>Received CTN: {item.tatopani.receivedCtn}</div>}
                      {item.tatopani.arrivalDate && <div>Arrival: {item.tatopani.arrivalDate}</div>}
                    </div>
                  )}
                </div>

                {/* Missing CTN Analysis */}
                {(() => {
                  const missing = (item.tatopani.loadedCtn + item.kerung.loadedCtn) - item.tatopani.receivedCtn - item.kerung.receivedCtn;
                  const remaining = item.totalCtns - item.tatopani.loadedCtn - item.kerung.loadedCtn;
                  if (missing > 0 || remaining > 0) {
                    return (
                      <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm">
                        <div className="flex items-center gap-2 font-semibold mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /> Analysis</div>
                        {missing > 0 && <div>⚠ Missing CTN: {missing}</div>}
                        {remaining > 0 && <div>📦 Remaining at Nylam: {remaining}</div>}
                      </div>
                    );
                  }
                  return null;
                })()}
              </CardContent>
            </Card>
          ))}

          {results.consignments.length > 0 && results.loadingItems.length === 0 && (
            <div>
              <h3 className="font-bold mb-2">Consignment Results</h3>
              {results.consignments.map((c: any) => (
                <Card key={c.id} className="mb-2">
                  <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="font-semibold">No:</span> {c.consignmentNo}</div>
                    <div><span className="font-semibold">MARKA:</span> {c.marka}</div>
                    <div><span className="font-semibold">Status:</span> {c.status}</div>
                    <div><span className="font-semibold">Client:</span> {c.client}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {results.consignments.length === 0 && results.loadingItems.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No results found for "{search}"</p>
          )}
        </div>
      )}

      {!results && (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Search for a consignment, MARKA, container, or client</p>
          <p className="text-sm">The system will display complete tracking details</p>
        </div>
      )}
    </div>
  );
};

export default TrackingSystem;
