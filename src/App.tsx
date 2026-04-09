import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Consignments from "@/pages/Consignments";
import LoadingLists from "@/pages/LoadingLists";
import Containers from "@/pages/Containers";
import RemainingCtns from "@/pages/RemainingCtns";
import PartyFollowUp from "@/pages/PartyFollowUp";
import TrackingSystem from "@/pages/TrackingSystem";
import AIHelper from "@/pages/AIHelper";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/consignments" element={<Consignments />} />
            <Route path="/loading-lists" element={<LoadingLists />} />
            <Route path="/containers" element={<Containers />} />
            <Route path="/remaining-ctns" element={<RemainingCtns />} />
            <Route path="/party-follow-up" element={<PartyFollowUp />} />
            <Route path="/tracking" element={<TrackingSystem />} />
            <Route path="/ai-helper" element={<AIHelper />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
