import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

const PartyFollowUp = () => {
  const { loadingList } = useStore();
  const [search, setSearch] = useState('');

  const followedUp = useMemo(() =>
    loadingList.filter(l => l.followUp), [loadingList]);

  const filtered = useMemo(() =>
    followedUp.filter(i =>
      Object.values(i).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
    ), [followedUp, search]);

  return (
    <div className="p-6">
      <h1 className="page-header">Party Follow Up</h1>
      <div className="toolbar">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="table-container border rounded-lg">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted sticky top-0 z-20">
            <tr>
              <th className="p-3 text-left font-semibold">Consignment No.</th>
              <th className="p-3 text-left font-semibold">MARKA</th>
              <th className="p-3 text-left font-semibold">Total CTN</th>
              <th className="p-3 text-left font-semibold">CBM</th>
              <th className="p-3 text-left font-semibold">GW</th>
              <th className="p-3 text-left font-semibold">Destination</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Client Name</th>
              <th className="p-3 text-left font-semibold">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t hover:bg-muted/50">
                <td className="p-3 font-medium">{item.consignmentNo}</td>
                <td className="p-3">{item.marka}</td>
                <td className="p-3">{item.totalCtns}</td>
                <td className="p-3">{item.cbm}</td>
                <td className="p-3">{item.gw}</td>
                <td className="p-3">{item.destination}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3">{item.client}</td>
                <td className="p-3">{item.remarks}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No followed-up consignments. Mark follow-up in Loading Lists section.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyFollowUp;
