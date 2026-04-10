export type Destination = 'TATOPANI' | 'KERUNG' | 'TATOPANI - KERUNG' | 'KERUNG - TATOPANI' | 'NYLAM';

export type ConsignmentStatus =
  | 'On the way to Lhasa'
  | 'At Lhasa'
  | 'On the way to Nylam'
  | 'At Nylam'
  | 'On the way to Tatopani'
  | 'At Tatopani port'
  | 'On the way to Kerung'
  | 'At Kerung port';

export type TatopaniStatus = 'On the way to Tatopani' | 'At Tatopani port';
export type KerungStatus = 'On the way to Kerung' | 'At Kerung port';

export interface ContainerEntry {
  dispatchedFromNylam: string;
  loadedCtn: number;
  nylamContainer: string;
  status: string;
  receivedCtn: number;
  arrivalDate: string;
}

export interface KerungDetails {
  dispatchedFromNylam: string;
  loadedCtn: number;
  nylamContainer: string;
  status: KerungStatus | '';
  receivedCtn: number;
  arrivalDate: string;
  containers?: ContainerEntry[];
}

export interface TatopaniDetails {
  dispatchedFromNylam: string;
  loadedCtn: number;
  nylamContainer: string;
  status: TatopaniStatus | '';
  receivedCtn: number;
  arrivalDate: string;
  containers?: ContainerEntry[];
}

export interface Consignment {
  id: string;
  date: string;
  consignmentNo: string;
  marka: string;
  totalCtns: number;
  cbm: number;
  gw: number;
  destination: Destination;
  status: ConsignmentStatus | '';
  client: string;
  remarks: string;
}

export interface LoadingListItem {
  id: string;
  date: string;
  consignmentNo: string;
  marka: string;
  totalCtns: number;
  cbm: number;
  gw: number;
  destination: Destination;
  lotNo: string;
  dispatchedFrom: string;
  container: string;
  status: ConsignmentStatus | '';
  arrivalDateNylam: string;
  kerung: KerungDetails;
  tatopani: TatopaniDetails;
  client: string;
  remarks: string;
  followUp: boolean;
  origin: 'guangzhou' | 'yiwu';
}

export interface OldNylamItem {
  id: string;
  date: string;
  consignmentNo: string;
  marka: string;
  totalCtn: number;
  ctnRemainingNylam: number;
  loadedCtn: number;
  cbm: number;
  gw: number;
  destination: string;
  dispatchedFromNylam: string;
  nylamContainer: string;
  arrivalLocation: string;
  arrivalDate: string;
  client: string;
  followUp: boolean;
}

export interface ContainerItem {
  id: string;
  containerNo: string;
  totalConsignments: number;
  dispatchedDate: string;
  dispatchedFrom: 'Guangzhou' | 'Yiwu' | 'Nylam';
  arrivalDate: string;
  arrivalLocation: 'Nylam' | 'Tatopani' | 'Kerung';
}

export interface RemainingCtnItem {
  id: string;
  consignmentDate: string;
  consignmentNo: string;
  marka: string;
  totalCtn: number;
  cbm: number;
  gw: number;
  destination: string;
  remainingCtn: number;
  remainingCtnLocation: string;
  client: string;
}

export const DESTINATIONS: Destination[] = ['TATOPANI', 'KERUNG', 'TATOPANI - KERUNG', 'KERUNG - TATOPANI', 'NYLAM'];

export const STATUSES: ConsignmentStatus[] = [
  'On the way to Lhasa', 'At Lhasa', 'On the way to Nylam', 'At Nylam',
  'On the way to Tatopani', 'At Tatopani port', 'On the way to Kerung', 'At Kerung port'
];

export const TATOPANI_STATUSES: TatopaniStatus[] = ['On the way to Tatopani', 'At Tatopani port'];
export const KERUNG_STATUSES: KerungStatus[] = ['On the way to Kerung', 'At Kerung port'];

export const emptyContainerEntry = (): ContainerEntry => ({
  dispatchedFromNylam: '', loadedCtn: 0, nylamContainer: '', status: '', receivedCtn: 0, arrivalDate: ''
});

export const emptyKerung = (): KerungDetails => ({
  dispatchedFromNylam: '', loadedCtn: 0, nylamContainer: '', status: '', receivedCtn: 0, arrivalDate: '', containers: []
});

export const emptyTatopani = (): TatopaniDetails => ({
  dispatchedFromNylam: '', loadedCtn: 0, nylamContainer: '', status: '', receivedCtn: 0, arrivalDate: '', containers: []
});
