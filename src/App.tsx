import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import Person from "./pages/Person";
import AssessmentLanding from "./pages/AssessmentLanding";
import Assessment from "./pages/Assessment";
import MoodStart from "./pages/MoodStart";
import MoodProcessing from "./pages/MoodProcessing";
import MoodStory from "./pages/MoodStory";
import MoodBoardInfo from "./pages/MoodBoardInfo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/person/:id" element={<Person />} />
            <Route path="/assessment" element={<AssessmentLanding />} />
            <Route path="/assessment/quiz" element={<Assessment />} />
            <Route path="/assessment/landing" element={<AssessmentLanding />} />
            <Route path="/mood/info" element={<MoodBoardInfo />} />
            <Route path="/mood/start" element={<MoodStart />} />
            <Route path="/mood/processing" element={<MoodProcessing />} />
            <Route path="/mood/story/:assessmentId" element={<MoodStory />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;