import type { ConsignmentStatus } from '@/types';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'On the way to Lhasa': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'At Lhasa': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'On the way to Nylam': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'At Nylam': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    case 'On the way to Tatopani': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'At Tatopani port': return 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200';
    case 'On the way to Kerung': return 'text-teal-600 bg-teal-50 border-teal-200';
    case 'At Kerung port': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    default: return '';
  }
};

export const isKerungDestination = (destination: string): boolean => {
  const d = destination?.toUpperCase() || '';
  return d === 'KERUNG' || d === 'TATOPANI - KERUNG' || d === 'KERUNG - TATOPANI';
};

export const getDestinationRowClass = (destination: string): string => {
  return isKerungDestination(destination) ? 'text-red-600 bg-red-50/50' : '';
};
