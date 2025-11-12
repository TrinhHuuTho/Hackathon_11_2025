import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import BMICalculatorPage from "./pages/BMICalculator";
import WorkoutTrackerPage from "./pages/WorkoutTracker";
import DashboardPage from "./pages/Dashboard";
import NutritionPage from "./pages/Nutrition";
import ProfilePage from "./pages/Profile";
import WorkoutHistoryPage from "./pages/WorkoutHistory";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={
              <Layout>
                <BMICalculatorPage />
              </Layout>
            } />
            <Route path="/dashboard" element={
              <Layout>
                <DashboardPage />
              </Layout>
            } />
            <Route path="/workout-tracker" element={
              <Layout>
                <WorkoutTrackerPage />
              </Layout>
            } />
            <Route path="/nutrition" element={
              <Layout>
                <NutritionPage />
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <ProfilePage />
              </Layout>
            } />
            <Route path="/workout-history" element={
              <Layout>
                <WorkoutHistoryPage />
              </Layout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
