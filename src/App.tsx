import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Consignments from "@/pages/Consignments";
import LoadingLists from "@/pages/LoadingLists";
import Containers from "@/pages/Containers";
import RemainingCtns from "@/pages/RemainingCtns";
import PartyFollowUp from "@/pages/PartyFollowUp";
import TrackingSystem from "@/pages/TrackingSystem";
import AIHelper from "@/pages/AIHelper";
import AdminPanel from "@/pages/AdminPanel";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound.tsx";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
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
        {role === 'admin' && <Route path="/admin" element={<AdminPanel />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
