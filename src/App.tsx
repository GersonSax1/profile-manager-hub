import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import ProfileForm from "./pages/ProfileForm";
import CreateAlarm from "./pages/CreateAlarm";
import AlarmsList from "./pages/AlarmsList";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentsList from "./pages/DocumentsList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
          <Route path="/profile-form/:id" element={<ProfileForm />} />
          <Route path="/profile/:profileId/alarm/new" element={<CreateAlarm />} />
          <Route path="/profile/:profileId/alarms" element={<AlarmsList />} />
          <Route path="/profile/:profileId/upload" element={<DocumentUpload />} />
          <Route path="/profile/:profileId/documents" element={<DocumentsList />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
