import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { dbMappers } from '@/hooks/useRealtimeSync';
import type { Consignment, LoadingListItem, OldNylamItem, ContainerItem, RemainingCtnItem } from '@/types';

interface AppState {
  consignments: Consignment[];
  loadingList: LoadingListItem[];
  oldNylamGoods: OldNylamItem[];
  containers: ContainerItem[];
  remainingCtns: RemainingCtnItem[];

  addConsignment: (c: Consignment) => void;
  updateConsignment: (id: string, c: Partial<Consignment>) => void;
  deleteConsignment: (id: string) => void;
  setConsignments: (items: Consignment[]) => void;

  addLoadingListItem: (item: LoadingListItem) => void;
  updateLoadingListItem: (id: string, item: Partial<LoadingListItem>) => void;
  deleteLoadingListItem: (id: string) => void;
  setLoadingList: (items: LoadingListItem[]) => void;

  addOldNylamItem: (item: OldNylamItem) => void;
  updateOldNylamItem: (id: string, item: Partial<OldNylamItem>) => void;
  deleteOldNylamItem: (id: string) => void;

  addContainer: (item: ContainerItem) => void;
  updateContainer: (id: string, item: Partial<ContainerItem>) => void;
  deleteContainer: (id: string) => void;

  addRemainingCtn: (item: RemainingCtnItem) => void;
  updateRemainingCtn: (id: string, item: Partial<RemainingCtnItem>) => void;
  deleteRemainingCtn: (id: string) => void;

  bulkUpdateConsignmentStatus: (ids: string[], status: Consignment['status']) => void;
  bulkUpdateLoadingList: (ids: string[], updates: Partial<LoadingListItem>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      consignments: [],
      loadingList: [],
      oldNylamGoods: [],
      containers: [],
      remainingCtns: [],

      addConsignment: (c) => {
        set((s) => ({ consignments: [...s.consignments, c] }));
        supabase.from('consignments').upsert(dbMappers.consignment.toDb(c)).then();
      },
      updateConsignment: (id, updates) => {
        set((s) => ({
          consignments: s.consignments.map((c) => c.id === id ? { ...c, ...updates } : c),
        }));
        const state = useStore.getState();
        const item = state.consignments.find(c => c.id === id);
        if (item) supabase.from('consignments').update(dbMappers.consignment.toDb({ ...item, id })).eq('id', id).then();
      },
      deleteConsignment: (id) => {
        set((s) => ({ consignments: s.consignments.filter((c) => c.id !== id) }));
        supabase.from('consignments').delete().eq('id', id).then();
      },
      setConsignments: (items) => set({ consignments: items }),

      addLoadingListItem: (item) => {
        set((s) => ({ loadingList: [...s.loadingList, item] }));
        supabase.from('loading_list').upsert(dbMappers.loadingList.toDb(item)).then();
      },
      updateLoadingListItem: (id, updates) => {
        set((s) => ({
          loadingList: s.loadingList.map((i) => i.id === id ? { ...i, ...updates } : i),
        }));
        const state = useStore.getState();
        const item = state.loadingList.find(i => i.id === id);
        if (item) supabase.from('loading_list').update(dbMappers.loadingList.toDb({ ...item, id })).eq('id', id).then();
      },
      deleteLoadingListItem: (id) => {
        set((s) => ({ loadingList: s.loadingList.filter((i) => i.id !== id) }));
        supabase.from('loading_list').delete().eq('id', id).then();
      },
      setLoadingList: (items) => set({ loadingList: items }),

      addOldNylamItem: (item) => {
        set((s) => ({ oldNylamGoods: [...s.oldNylamGoods, item] }));
        supabase.from('old_nylam_goods').upsert(dbMappers.oldNylam.toDb(item)).then();
      },
      updateOldNylamItem: (id, updates) => {
        set((s) => ({
          oldNylamGoods: s.oldNylamGoods.map((i) => i.id === id ? { ...i, ...updates } : i),
        }));
        const state = useStore.getState();
        const item = state.oldNylamGoods.find(i => i.id === id);
        if (item) supabase.from('old_nylam_goods').update(dbMappers.oldNylam.toDb({ ...item, id })).eq('id', id).then();
      },
      deleteOldNylamItem: (id) => {
        set((s) => ({ oldNylamGoods: s.oldNylamGoods.filter((i) => i.id !== id) }));
        supabase.from('old_nylam_goods').delete().eq('id', id).then();
      },

      addContainer: (item) => {
        set((s) => ({ containers: [...s.containers, item] }));
        supabase.from('containers').upsert(dbMappers.container.toDb(item)).then();
      },
      updateContainer: (id, updates) => {
        set((s) => ({
          containers: s.containers.map((i) => i.id === id ? { ...i, ...updates } : i),
        }));
        const state = useStore.getState();
        const item = state.containers.find(i => i.id === id);
        if (item) supabase.from('containers').update(dbMappers.container.toDb({ ...item, id })).eq('id', id).then();
      },
      deleteContainer: (id) => {
        set((s) => ({ containers: s.containers.filter((i) => i.id !== id) }));
        supabase.from('containers').delete().eq('id', id).then();
      },

      addRemainingCtn: (item) => {
        set((s) => ({ remainingCtns: [...s.remainingCtns, item] }));
        supabase.from('remaining_ctns').upsert(dbMappers.remainingCtn.toDb(item)).then();
      },
      updateRemainingCtn: (id, updates) => {
        set((s) => ({
          remainingCtns: s.remainingCtns.map((i) => i.id === id ? { ...i, ...updates } : i),
        }));
        const state = useStore.getState();
        const item = state.remainingCtns.find(i => i.id === id);
        if (item) supabase.from('remaining_ctns').update(dbMappers.remainingCtn.toDb({ ...item, id })).eq('id', id).then();
      },
      deleteRemainingCtn: (id) => {
        set((s) => ({ remainingCtns: s.remainingCtns.filter((i) => i.id !== id) }));
        supabase.from('remaining_ctns').delete().eq('id', id).then();
      },

      bulkUpdateConsignmentStatus: (ids, status) => {
        set((s) => ({
          consignments: s.consignments.map((c) => ids.includes(c.id) ? { ...c, status } : c),
        }));
        supabase.from('consignments').update({ status }).in('id', ids).then();
      },
      bulkUpdateLoadingList: (ids, updates) => {
        set((s) => ({
          loadingList: s.loadingList.map((i) => ids.includes(i.id) ? { ...i, ...updates } : i),
        }));
        const dbUpdates: any = {};
        if ('status' in updates) dbUpdates.status = updates.status;
        if ('container' in updates) dbUpdates.container = updates.container;
        if ('dispatchedFrom' in updates) dbUpdates.dispatched_from = updates.dispatchedFrom;
        if (Object.keys(dbUpdates).length > 0) {
          supabase.from('loading_list').update(dbUpdates).in('id', ids).then();
        }
      },
    }),
    { name: 'ado-transport-store' }
  )
);
