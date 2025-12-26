import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute } from "./components/layout/protected-route";
import { Login } from "./pages/auth/login";
import { Profile } from "./pages/profile/profile";
import { PublicProfileCard } from "./pages/profile/public-card";
import { UserDataSync } from "./components/user-data-sync";
import { ThemeProvider } from "./components/theme-provider";
import { Home } from "./pages/home/home";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <UserDataSync />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/u/:userId" element={<PublicProfileCard />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
