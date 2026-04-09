import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Users, Package, Eye } from 'lucide-react';

const Dashboard = () => {
  const { consignments, loadingList } = useStore();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [viewConsignment, setViewConsignment] = useState<string | null>(null);

  const allClients = Array.from(new Set([
    ...consignments.map(c => c.client),
    ...loadingList.map(l => l.client),
  ])).filter(Boolean);

  const filteredClients = allClients.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const clientConsignments = selectedClient
    ? consignments.filter(c => c.client === selectedClient)
    : [];

  const viewedConsignment = viewConsignment
    ? consignments.find(c => c.id === viewConsignment)
    : null;

  const viewedLoadingItem = viewConsignment
    ? loadingList.find(l => l.consignmentNo === viewedConsignment?.consignmentNo)
    : null;

  return (
    <div className="p-6">
      <h1 className="page-header">Dashboard</h1>

      {!selectedClient ? (
        <>
          <div className="toolbar">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search client..."
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
                const count = consignments.filter(c => c.client === client).length;
                return (
                  <Card
                    key={client}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
                    onClick={() => setSelectedClient(client)}
                  >
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <Users className="h-8 w-8 text-accent" />
                      <CardTitle className="text-lg">{client}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{count} consignment{count !== 1 ? 's' : ''}</span>
                      </div>
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
            <Badge variant="secondary" className="text-base px-3 py-1">{selectedClient}</Badge>
          </div>

          <div className="table-container border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0 z-20">
                <tr>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Consignment No.</th>
                  <th className="text-left p-3 font-semibold">MARKA</th>
                  <th className="text-left p-3 font-semibold">Total CTN</th>
                  <th className="text-left p-3 font-semibold">CBM</th>
                  <th className="text-left p-3 font-semibold">GW</th>
                  <th className="text-left p-3 font-semibold">Destination</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold sticky-col-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientConsignments.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/50">
                    <td className="p-3">{c.date}</td>
                    <td className="p-3 font-medium">{c.consignmentNo}</td>
                    <td className="p-3">{c.marka}</td>
                    <td className="p-3">{c.totalCtns}</td>
                    <td className="p-3">{c.cbm}</td>
                    <td className="p-3">{c.gw}</td>
                    <td className="p-3">{c.destination}</td>
                    <td className="p-3"><Badge variant="outline">{c.status}</Badge></td>
                    <td className="p-3 sticky-col-right">
                      <Button size="sm" variant="ghost" onClick={() => setViewConsignment(c.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={!!viewConsignment} onOpenChange={() => setViewConsignment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consignment Details</DialogTitle>
          </DialogHeader>
          {viewedConsignment && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold">Date:</span> {viewedConsignment.date}</div>
              <div><span className="font-semibold">Consignment No:</span> {viewedConsignment.consignmentNo}</div>
              <div><span className="font-semibold">MARKA:</span> {viewedConsignment.marka}</div>
              <div><span className="font-semibold">Total CTNS:</span> {viewedConsignment.totalCtns}</div>
              <div><span className="font-semibold">CBM:</span> {viewedConsignment.cbm}</div>
              <div><span className="font-semibold">GW:</span> {viewedConsignment.gw}</div>
              <div><span className="font-semibold">Destination:</span> {viewedConsignment.destination}</div>
              <div><span className="font-semibold">Status:</span> {viewedConsignment.status}</div>
              <div><span className="font-semibold">Client:</span> {viewedConsignment.client}</div>
              <div className="col-span-2"><span className="font-semibold">Remarks:</span> {viewedConsignment.remarks}</div>
              {viewedLoadingItem && (
                <>
                  <div className="col-span-2 border-t pt-3 mt-2">
                    <h3 className="font-bold text-base mb-2">Loading List Details</h3>
                  </div>
                  <div><span className="font-semibold">LOT No:</span> {viewedLoadingItem.lotNo}</div>
                  <div><span className="font-semibold">Dispatched From:</span> {viewedLoadingItem.dispatchedFrom}</div>
                  <div><span className="font-semibold">Container:</span> {viewedLoadingItem.container}</div>
                  <div><span className="font-semibold">Arrival at Nylam:</span> {viewedLoadingItem.arrivalDateNylam}</div>
                  <div className="col-span-2 border-t pt-3 mt-2">
                    <h3 className="font-bold text-base mb-2">KERUNG Details</h3>
                  </div>
                  <div><span className="font-semibold">Dispatched:</span> {viewedLoadingItem.kerung.dispatchedFromNylam}</div>
                  <div><span className="font-semibold">Loaded CTN:</span> {viewedLoadingItem.kerung.loadedCtn}</div>
                  <div><span className="font-semibold">Container:</span> {viewedLoadingItem.kerung.nylamContainer}</div>
                  <div><span className="font-semibold">Status:</span> {viewedLoadingItem.kerung.status}</div>
                  <div><span className="font-semibold">Received CTN:</span> {viewedLoadingItem.kerung.receivedCtn}</div>
                  <div><span className="font-semibold">Arrival:</span> {viewedLoadingItem.kerung.arrivalDate}</div>
                  <div className="col-span-2 border-t pt-3 mt-2">
                    <h3 className="font-bold text-base mb-2">TATOPANI Details</h3>
                  </div>
                  <div><span className="font-semibold">Dispatched:</span> {viewedLoadingItem.tatopani.dispatchedFromNylam}</div>
                  <div><span className="font-semibold">Loaded CTN:</span> {viewedLoadingItem.tatopani.loadedCtn}</div>
                  <div><span className="font-semibold">Container:</span> {viewedLoadingItem.tatopani.nylamContainer}</div>
                  <div><span className="font-semibold">Status:</span> {viewedLoadingItem.tatopani.status}</div>
                  <div><span className="font-semibold">Received CTN:</span> {viewedLoadingItem.tatopani.receivedCtn}</div>
                  <div><span className="font-semibold">Arrival:</span> {viewedLoadingItem.tatopani.arrivalDate}</div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
