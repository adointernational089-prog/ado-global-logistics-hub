import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingListTable } from '@/components/LoadingListTable';
import { OldNylamTable } from '@/components/OldNylamTable';

const LoadingLists = () => {
  return (
    <div className="p-6">
      <h1 className="page-header">Loading Lists</h1>
      <Tabs defaultValue="guangzhou">
        <TabsList className="mb-4">
          <TabsTrigger value="guangzhou">Guangzhou</TabsTrigger>
          <TabsTrigger value="yiwu">Yiwu</TabsTrigger>
          <TabsTrigger value="old-nylam">Old Nylam Goods</TabsTrigger>
        </TabsList>
        <TabsContent value="guangzhou">
          <LoadingListTable origin="guangzhou" />
        </TabsContent>
        <TabsContent value="yiwu">
          <LoadingListTable origin="yiwu" />
        </TabsContent>
        <TabsContent value="old-nylam">
          <OldNylamTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingLists;
