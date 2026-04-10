import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Users, Package, Eye, TrendingUp, MapPin, Box } from 'lucide-react';
import { getStatusColor, getDestinationRowClass } from '@/lib/statusColors';

const Dashboard = () => {
  const { consignments, loadingList, containers, remainingCtns } = useStore();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [viewConsignment, setViewConsignment] = useState<string | null>(null);

  const allClients = Array.from(new Set([
    ...consignments.map(c => c.client),
    ...loadingList.map(l => l.client),
  ])).filter(Boolean);

  const filteredClients = search
    ? (() => {
        const s = search.toLowerCase();
        const nameMatches = allClients.filter(c => c.toLowerCase().includes(s));
        const consignmentMatches = consignments
          .filter(c => c.consignmentNo.toLowerCase().includes(s) || c.marka.toLowerCase().includes(s))
          .map(c => c.client)
          .filter(Boolean);
        const loadingMatches = loadingList
          .filter(l => l.consignmentNo.toLowerCase().includes(s) || l.marka.toLowerCase().includes(s))
          .map(l => l.client)
          .filter(Boolean);
        return Array.from(new Set([...nameMatches, ...consignmentMatches, ...loadingMatches]));
      })()
    : allClients;

  const clientConsignments = selectedClient
    ? consignments.filter(c => c.client === selectedClient)
    : [];

  const viewedConsignment = viewConsignment
    ? consignments.find(c => c.id === viewConsignment)
    : null;

  const viewedLoadingItem = viewConsignment
    ? loadingList.find(l => l.consignmentNo === viewedConsignment?.consignmentNo)
    : null;

  // Summary stats
  const totalConsignments = consignments.length;
  const totalContainers = containers.length;
  const totalClients = allClients.length;
  const activeShipments = consignments.filter(c => c.status && !c.status.includes('port')).length;

  const renderStatusBadge = (status: string) => {
    if (!status) return <span className="text-muted-foreground">—</span>;
    const colorClass = getStatusColor(status);
    return <Badge variant="outline" className={`text-sm border ${colorClass}`}>{status}</Badge>;
  };

  return (
    <div className="p-6">
      <h1 className="page-header">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Total Consignments</p>
                <p className="text-2xl font-bold">{totalConsignments}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Clients</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Active Shipments</p>
                <p className="text-2xl font-bold">{activeShipments}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Containers</p>
                <p className="text-2xl font-bold">{totalContainers}</p>
              </div>
              <Box className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {!selectedClient ? (
        <>
          <div className="toolbar">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search client, consignment no., or MARKA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClients.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-12">No clients found. Add consignments to see clients here.</p>
            ) : (
              filteredClients.map((client) => {
                const clientCons = consignments.filter(c => c.client === client);
                const count = clientCons.length;
                const latestStatus = clientCons[clientCons.length - 1]?.status || '';
                return (
                  <Card
                    key={client}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
                    onClick={() => setSelectedClient(client)}
                  >
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <Users className="h-8 w-8 text-accent" />
                      <CardTitle className="text-lg font-bold">{client}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{count} consignment{count !== 1 ? 's' : ''}</span>
                      </div>
                      {latestStatus && <div className="mt-1">{renderStatusBadge(latestStatus)}</div>}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          <div className="toolbar">
            <Button variant="outline" onClick={() => setSelectedClient(null)}>← Back to Clients</Button>
            <Badge variant="secondary" className="text-base px-3 py-1 font-bold">{selectedClient}</Badge>
          </div>

          <div className="table-container border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0 z-20">
                <tr>
                  <th className="text-left p-3 font-bold">Date</th>
                  <th className="text-left p-3 font-bold">Consignment No.</th>
                  <th className="text-left p-3 font-bold">MARKA</th>
                  <th className="text-left p-3 font-bold">Total CTN</th>
                  <th className="text-left p-3 font-bold">CBM</th>
                  <th className="text-left p-3 font-bold">GW</th>
                  <th className="text-left p-3 font-bold">Destination</th>
                  <th className="text-left p-3 font-bold">Status</th>
                  <th className="text-left p-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientConsignments.map((c) => {
                  const destRowClass = getDestinationRowClass(c.destination);
                  return (
                    <tr key={c.id} className={`border-t hover:bg-muted/50 ${destRowClass}`}>
                      <td className="p-3">{c.date}</td>
                      <td className="p-3 font-semibold">{c.consignmentNo}</td>
                      <td className="p-3">{c.marka}</td>
                      <td className="p-3">{c.totalCtns}</td>
                      <td className="p-3">{c.cbm}</td>
                      <td className="p-3">{c.gw}</td>
                      <td className="p-3 font-medium">{c.destination}</td>
                      <td className="p-3">{renderStatusBadge(c.status)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" onClick={() => setViewConsignment(c.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={!!viewConsignment} onOpenChange={() => setViewConsignment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Consignment Details</DialogTitle>
          </DialogHeader>
          {viewedConsignment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="text-xs text-muted-foreground">Consignment No.</span>
                  <p className="font-bold text-lg">{viewedConsignment.consignmentNo}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="text-xs text-muted-foreground">MARKA</span>
                  <p className="font-bold text-lg">{viewedConsignment.marka}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(var(--highlight))] text-[hsl(var(--highlight-foreground))]">
                  <span className="text-xs opacity-70">Total CTNS</span>
                  <p className="font-bold text-xl">{viewedConsignment.totalCtns}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border">
                  <span className="text-xs text-muted-foreground">Client</span>
                  <p className="font-bold text-base">{viewedConsignment.client}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="mt-1">{renderStatusBadge(viewedConsignment.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-muted-foreground text-xs block">Date</span><span className="font-medium">{viewedConsignment.date}</span></div>
                <div><span className="text-muted-foreground text-xs block">CBM</span><span className="font-medium">{viewedConsignment.cbm}</span></div>
                <div><span className="text-muted-foreground text-xs block">GW</span><span className="font-medium">{viewedConsignment.gw}</span></div>
                <div><span className="text-muted-foreground text-xs block">Destination</span><span className="font-medium">{viewedConsignment.destination}</span></div>
              </div>
              {viewedConsignment.remarks && (
                <div className="text-sm"><span className="text-muted-foreground text-xs block">Remarks</span><span>{viewedConsignment.remarks}</span></div>
              )}
              {viewedLoadingItem && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-bold text-base">Loading List Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-muted-foreground text-xs block">LOT No.</span><span className="font-medium">{viewedLoadingItem.lotNo || '—'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Container</span><span className="font-medium">{viewedLoadingItem.container || '—'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Dispatched From</span><span className="font-medium">{viewedLoadingItem.dispatchedFrom || '—'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Arrival at Nylam</span><span className="font-medium">{viewedLoadingItem.arrivalDateNylam || '—'}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
