import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

      addConsignment: (c) => set((s) => ({ consignments: [...s.consignments, c] })),
      updateConsignment: (id, updates) => set((s) => ({
        consignments: s.consignments.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      deleteConsignment: (id) => set((s) => ({
        consignments: s.consignments.filter((c) => c.id !== id),
      })),
      setConsignments: (items) => set({ consignments: items }),

      addLoadingListItem: (item) => set((s) => ({ loadingList: [...s.loadingList, item] })),
      updateLoadingListItem: (id, updates) => set((s) => ({
        loadingList: s.loadingList.map((i) => i.id === id ? { ...i, ...updates } : i),
      })),
      deleteLoadingListItem: (id) => set((s) => ({
        loadingList: s.loadingList.filter((i) => i.id !== id),
      })),
      setLoadingList: (items) => set({ loadingList: items }),

      addOldNylamItem: (item) => set((s) => ({ oldNylamGoods: [...s.oldNylamGoods, item] })),
      updateOldNylamItem: (id, updates) => set((s) => ({
        oldNylamGoods: s.oldNylamGoods.map((i) => i.id === id ? { ...i, ...updates } : i),
      })),
      deleteOldNylamItem: (id) => set((s) => ({
        oldNylamGoods: s.oldNylamGoods.filter((i) => i.id !== id),
      })),

      addContainer: (item) => set((s) => ({ containers: [...s.containers, item] })),
      updateContainer: (id, updates) => set((s) => ({
        containers: s.containers.map((i) => i.id === id ? { ...i, ...updates } : i),
      })),
      deleteContainer: (id) => set((s) => ({
        containers: s.containers.filter((i) => i.id !== id),
      })),

      addRemainingCtn: (item) => set((s) => ({ remainingCtns: [...s.remainingCtns, item] })),
      updateRemainingCtn: (id, updates) => set((s) => ({
        remainingCtns: s.remainingCtns.map((i) => i.id === id ? { ...i, ...updates } : i),
      })),
      deleteRemainingCtn: (id) => set((s) => ({
        remainingCtns: s.remainingCtns.filter((i) => i.id !== id),
      })),

      bulkUpdateConsignmentStatus: (ids, status) => set((s) => ({
        consignments: s.consignments.map((c) => ids.includes(c.id) ? { ...c, status } : c),
      })),
      bulkUpdateLoadingList: (ids, updates) => set((s) => ({
        loadingList: s.loadingList.map((i) => ids.includes(i.id) ? { ...i, ...updates } : i),
      })),
    }),
    { name: 'ado-transport-store' }
  )
);
