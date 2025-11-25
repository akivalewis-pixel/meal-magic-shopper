
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomCategoriesProvider } from "@/contexts/CustomCategoriesContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CustomCategoriesProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                } 
              />
            </Routes>
            <Toaster />
          </Router>
        </CustomCategoriesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
