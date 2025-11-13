import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import BrandedIndex from "./pages/BrandedIndex";
import Auth from "./pages/Auth";
import DomainBasedRedirect from "@/components/DomainBasedRedirect";
import Zustandsbericht from "./pages/Zustandsbericht";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPositionen from "./pages/admin/AdminPositionen";
import AdminAnfragen from "./pages/admin/AdminAnfragen";
import AdminBenutzer from "./pages/admin/AdminBenutzer";
import AdminBranding from "./pages/admin/AdminBranding";
import AdminEmails from "./pages/admin/AdminEmails";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminKaltaquise from "./pages/admin/AdminKaltaquise";
import AdminKaltaquiseCallerDetails from "./pages/admin/AdminKaltaquiseCallerDetails";
import AdminKaltaquiseLeads from "./pages/admin/AdminKaltaquiseLeads";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DomainBasedRedirect targetPath="root" />} />
            <Route path="/insolvenz" element={<DomainBasedRedirect targetPath="insolvenz" />} />
            <Route path="/insolvenz/:slug" element={<BrandedIndex />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/zustandsbericht/:reportNr" element={<Zustandsbericht />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="positionen" element={<AdminPositionen />} />
              <Route path="anfragen" element={<AdminAnfragen />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="kaltaquise" element={<AdminKaltaquise />} />
              <Route path="kaltaquise/:callerId" element={<AdminKaltaquiseCallerDetails />} />
              <Route path="kaltaquise/:callerId/:campaignId" element={<AdminKaltaquiseLeads />} />
              <Route path="benutzer" element={<AdminBenutzer />} />
              <Route path="branding" element={<AdminBranding />} />
              <Route path="emails" element={<AdminEmails />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
