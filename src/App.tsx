import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import HowToOrder from "./pages/HowToOrder";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Lazy load heavy components
const Admin = lazy(() => import("./pages/Admin"));
const Order = lazy(() => import("./pages/Order"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">กำลังโหลด...</div>}>
                  <Admin />
                </Suspense>
              } 
            />
            <Route 
              path="/order" 
              element={
                <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">กำลังโหลด...</div>}>
                  <Order />
                </Suspense>
              } 
            />
            <Route path="/how-to-order" element={<HowToOrder />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
