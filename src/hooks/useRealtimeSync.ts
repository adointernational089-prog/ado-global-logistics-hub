import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import type { Consignment, LoadingListItem, OldNylamItem, ContainerItem, RemainingCtnItem } from '@/types';

// --- Mappers: DB row <-> App type ---

const mapConsignmentFromDb = (r: any): Consignment => ({
  id: r.id, date: r.date || '', consignmentNo: r.consignment_no,
  marka: r.marka || '', totalCtns: r.total_ctns || 0, cbm: Number(r.cbm) || 0,
  gw: Number(r.gw) || 0, destination: r.destination || 'TATOPANI',
  status: r.status || '', client: r.client || '', remarks: r.remarks || '',
});

const mapConsignmentToDb = (c: Omit<Consignment, 'id'> & { id?: string }) => ({
  ...(c.id ? { id: c.id } : {}),
  date: c.date, consignment_no: c.consignmentNo, marka: c.marka,
  total_ctns: c.totalCtns, cbm: c.cbm, gw: c.gw, destination: c.destination,
  status: c.status, client: c.client, remarks: c.remarks,
});

const mapLoadingListFromDb = (r: any): LoadingListItem => ({
  id: r.id, date: r.date || '', consignmentNo: r.consignment_no,
  marka: r.marka || '', totalCtns: r.total_ctns || 0, cbm: Number(r.cbm) || 0,
  gw: Number(r.gw) || 0, destination: r.destination || 'TATOPANI',
  lotNo: r.lot_no || '', dispatchedFrom: r.dispatched_from || '',
  container: r.container || '', status: r.status || '',
  arrivalDateNylam: r.arrival_date_nylam || '',
  kerung: r.kerung || { dispatchedFromNylam: '', loadedCtn: 0, nylamContainer: '', status: '', receivedCtn: 0, arrivalDate: '', containers: [] },
  tatopani: r.tatopani || { dispatchedFromNylam: '', loadedCtn: 0, nylamContainer: '', status: '', receivedCtn: 0, arrivalDate: '', containers: [] },
  client: r.client || '', remarks: r.remarks || '', followUp: r.follow_up || false,
  origin: r.origin || 'guangzhou',
});

const mapLoadingListToDb = (item: Omit<LoadingListItem, 'id'> & { id?: string }) => ({
  ...(item.id ? { id: item.id } : {}),
  date: item.date, consignment_no: item.consignmentNo, marka: item.marka,
  total_ctns: item.totalCtns, cbm: item.cbm, gw: item.gw,
  destination: item.destination, lot_no: item.lotNo,
  dispatched_from: item.dispatchedFrom, container: item.container,
  status: item.status, arrival_date_nylam: item.arrivalDateNylam,
  kerung: item.kerung as any, tatopani: item.tatopani as any,
  client: item.client, remarks: item.remarks, follow_up: item.followUp,
  origin: item.origin,
});

const mapOldNylamFromDb = (r: any): OldNylamItem => ({
  id: r.id, date: r.date || '', consignmentNo: r.consignment_no || '',
  marka: r.marka || '', totalCtn: r.total_ctn || 0,
  ctnRemainingNylam: r.ctn_remaining_nylam || 0, loadedCtn: r.loaded_ctn || 0,
  cbm: Number(r.cbm) || 0, gw: Number(r.gw) || 0, destination: r.destination || '',
  dispatchedFromNylam: r.dispatched_from_nylam || '', nylamContainer: r.nylam_container || '',
  arrivalLocation: r.arrival_location || '', arrivalDate: r.arrival_date || '',
  client: r.client || '', followUp: r.follow_up || false,
});

const mapOldNylamToDb = (item: Omit<OldNylamItem, 'id'> & { id?: string }) => ({
  ...(item.id ? { id: item.id } : {}),
  date: item.date, consignment_no: item.consignmentNo, marka: item.marka,
  total_ctn: item.totalCtn, ctn_remaining_nylam: item.ctnRemainingNylam,
  loaded_ctn: item.loadedCtn, cbm: item.cbm, gw: item.gw,
  destination: item.destination, dispatched_from_nylam: item.dispatchedFromNylam,
  nylam_container: item.nylamContainer, arrival_location: item.arrivalLocation,
  arrival_date: item.arrivalDate, client: item.client, follow_up: item.followUp,
});

const mapContainerFromDb = (r: any): ContainerItem => ({
  id: r.id, containerNo: r.container_no, totalConsignments: r.total_consignments || 0,
  dispatchedDate: r.dispatched_date || '', dispatchedFrom: r.dispatched_from || 'Guangzhou',
  arrivalDate: r.arrival_date || '', arrivalLocation: r.arrival_location || 'Nylam',
});

const mapContainerToDb = (item: Omit<ContainerItem, 'id'> & { id?: string }) => ({
  ...(item.id ? { id: item.id } : {}),
  container_no: item.containerNo, total_consignments: item.totalConsignments,
  dispatched_date: item.dispatchedDate, dispatched_from: item.dispatchedFrom,
  arrival_date: item.arrivalDate, arrival_location: item.arrivalLocation,
});

const mapRemainingCtnFromDb = (r: any): RemainingCtnItem => ({
  id: r.id, consignmentDate: r.consignment_date || '', consignmentNo: r.consignment_no || '',
  marka: r.marka || '', totalCtn: r.total_ctn || 0, cbm: Number(r.cbm) || 0,
  gw: Number(r.gw) || 0, destination: r.destination || '',
  remainingCtn: r.remaining_ctn || 0, remainingCtnLocation: r.remaining_ctn_location || '',
  client: r.client || '',
});

const mapRemainingCtnToDb = (item: Omit<RemainingCtnItem, 'id'> & { id?: string }) => ({
  ...(item.id ? { id: item.id } : {}),
  consignment_date: item.consignmentDate, consignment_no: item.consignmentNo,
  marka: item.marka, total_ctn: item.totalCtn, cbm: item.cbm, gw: item.gw,
  destination: item.destination, remaining_ctn: item.remainingCtn,
  remaining_ctn_location: item.remainingCtnLocation, client: item.client,
});

// Export mappers for use in store
export const dbMappers = {
  consignment: { toDb: mapConsignmentToDb, fromDb: mapConsignmentFromDb },
  loadingList: { toDb: mapLoadingListToDb, fromDb: mapLoadingListFromDb },
  oldNylam: { toDb: mapOldNylamToDb, fromDb: mapOldNylamFromDb },
  container: { toDb: mapContainerToDb, fromDb: mapContainerFromDb },
  remainingCtn: { toDb: mapRemainingCtnToDb, fromDb: mapRemainingCtnFromDb },
};

export function useRealtimeSync() {
  const store = useStore;
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Fetch initial data
    const fetchAll = async () => {
      const [c, l, o, ct, r] = await Promise.all([
        supabase.from('consignments').select('*'),
        supabase.from('loading_list').select('*'),
        supabase.from('old_nylam_goods').select('*'),
        supabase.from('containers').select('*'),
        supabase.from('remaining_ctns').select('*'),
      ]);

      const state = store.getState();
      if (c.data) state.setConsignments(c.data.map(mapConsignmentFromDb));
      if (l.data) state.setLoadingList(l.data.map(mapLoadingListFromDb));
      if (o.data) {
        // Replace oldNylamGoods entirely
        const items = o.data.map(mapOldNylamFromDb);
        useStore.setState({ oldNylamGoods: items });
      }
      if (ct.data) {
        const items = ct.data.map(mapContainerFromDb);
        useStore.setState({ containers: items });
      }
      if (r.data) {
        const items = r.data.map(mapRemainingCtnFromDb);
        useStore.setState({ remainingCtns: items });
      }
    };

    fetchAll();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('db-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consignments' }, (payload) => {
        const state = store.getState();
        if (payload.eventType === 'INSERT') {
          const item = mapConsignmentFromDb(payload.new);
          if (!state.consignments.find(c => c.id === item.id)) {
            state.addConsignment(item);
          }
        } else if (payload.eventType === 'UPDATE') {
          state.updateConsignment(payload.new.id, mapConsignmentFromDb(payload.new));
        } else if (payload.eventType === 'DELETE') {
          state.deleteConsignment(payload.old.id);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loading_list' }, (payload) => {
        const state = store.getState();
        if (payload.eventType === 'INSERT') {
          const item = mapLoadingListFromDb(payload.new);
          if (!state.loadingList.find(l => l.id === item.id)) {
            state.addLoadingListItem(item);
          }
        } else if (payload.eventType === 'UPDATE') {
          state.updateLoadingListItem(payload.new.id, mapLoadingListFromDb(payload.new));
        } else if (payload.eventType === 'DELETE') {
          state.deleteLoadingListItem(payload.old.id);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'old_nylam_goods' }, (payload) => {
        const state = store.getState();
        if (payload.eventType === 'INSERT') {
          const item = mapOldNylamFromDb(payload.new);
          if (!state.oldNylamGoods.find(o => o.id === item.id)) {
            state.addOldNylamItem(item);
          }
        } else if (payload.eventType === 'UPDATE') {
          state.updateOldNylamItem(payload.new.id, mapOldNylamFromDb(payload.new));
        } else if (payload.eventType === 'DELETE') {
          state.deleteOldNylamItem(payload.old.id);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'containers' }, (payload) => {
        const state = store.getState();
        if (payload.eventType === 'INSERT') {
          const item = mapContainerFromDb(payload.new);
          if (!state.containers.find(c => c.id === item.id)) {
            state.addContainer(item);
          }
        } else if (payload.eventType === 'UPDATE') {
          state.updateContainer(payload.new.id, mapContainerFromDb(payload.new));
        } else if (payload.eventType === 'DELETE') {
          state.deleteContainer(payload.old.id);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'remaining_ctns' }, (payload) => {
        const state = store.getState();
        if (payload.eventType === 'INSERT') {
          const item = mapRemainingCtnFromDb(payload.new);
          if (!state.remainingCtns.find(r => r.id === item.id)) {
            state.addRemainingCtn(item);
          }
        } else if (payload.eventType === 'UPDATE') {
          state.updateRemainingCtn(payload.new.id, mapRemainingCtnFromDb(payload.new));
        } else if (payload.eventType === 'DELETE') {
          state.deleteRemainingCtn(payload.old.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      initialized.current = false;
    };
  }, []);
}
